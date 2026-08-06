import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';
import { pathToFileURL } from 'url';

import {
  validateManifest,
  validateSubjectData,
} from './validate-subject-data.mjs';

const root = process.cwd();
const staticJsonPath = path.join(root, 'data', 'subjectConstants.json');
const departmentConstantsPath = path.join(
  root,
  'data',
  'department_constants.json'
);
const derivedJsonPath = path.join(root, 'data', 'derivedSubjectConstants.json');
const manifestPath = path.join(root, 'data', 'subjectDataManifest.json');
const tsPath = path.join(root, 'src', 'types', 'subjectConstants.ts');
const activeDataTsPath = path.join(
  root,
  'src',
  'subject',
  'activeSubjectData.ts'
);
const rawPropertiesJsonPath = path.join(
  root,
  'data',
  'subjectRawProperties.json'
);
const rawPropertiesTsPath = path.join(
  root,
  'src',
  'types',
  'rawSubjectProperties.ts'
);

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export function parseAndHashSubjectData(dataBytes) {
  return {
    data: JSON.parse(dataBytes.toString('utf8')),
    sha256: createHash('sha256').update(dataBytes).digest('hex'),
  };
}

export function uniqueNonEmptyValues(observedValues) {
  return [
    ...new Set(
      observedValues.filter(
        (value) => typeof value === 'string' && value.trim() !== ''
      )
    ),
  ];
}

function isPlainJsonObject(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function hasExactKeys(value, expectedKeys) {
  return (
    isPlainJsonObject(value) &&
    Object.keys(value).length === expectedKeys.length &&
    expectedKeys.every((key) => Object.hasOwn(value, key))
  );
}

function validateDepartmentLists(departments) {
  const expectedKeys = ['kaikouBukyokuGakubus', 'kaikouBukyokuDaigakuins'];

  if (!hasExactKeys(departments, expectedKeys)) {
    throw new Error(
      'Department constants departments must be an object with exactly kaikouBukyokuGakubus and kaikouBukyokuDaigakuins.'
    );
  }

  const seen = new Set();
  for (const key of expectedKeys) {
    const values = departments[key];
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error(`Department constants ${key} must be a nonempty array.`);
    }
    for (const department of values) {
      if (
        typeof department !== 'string' ||
        department.trim() === '' ||
        department !== department.trim()
      ) {
        throw new Error(
          `Department constants ${key} must contain nonempty trimmed strings.`
        );
      }
      if (seen.has(department)) {
        throw new Error(
          `Department constants contains duplicate: ${department}`
        );
      }
      seen.add(department);
    }
  }
}

export function validateDepartmentConstants(
  departmentConstants,
  manifest,
  subjectDataSha256
) {
  const expectedKeys = [
    'schemaVersion',
    'academicYear',
    'retrievedAt',
    'source',
    'subjectData',
    'departments',
  ];
  if (!hasExactKeys(departmentConstants, expectedKeys)) {
    throw new Error(
      'Department constants must be a plain object with exactly schemaVersion, academicYear, retrievedAt, source, subjectData, and departments.'
    );
  }
  if (departmentConstants.schemaVersion !== 1) {
    throw new Error('Department constants schemaVersion must be 1.');
  }
  for (const key of ['academicYear', 'retrievedAt', 'source']) {
    if (departmentConstants[key] !== manifest[key]) {
      throw new Error(
        `Department constants ${key} does not match subject data manifest.`
      );
    }
  }

  const expectedSubjectDataKeys = ['dataFile', 'sha256', 'subjectCount'];
  if (!hasExactKeys(departmentConstants.subjectData, expectedSubjectDataKeys)) {
    throw new Error(
      'Department constants subjectData must be a plain object with exactly dataFile, sha256, and subjectCount.'
    );
  }
  for (const key of ['dataFile', 'subjectCount']) {
    if (departmentConstants.subjectData[key] !== manifest[key]) {
      throw new Error(
        `Department constants subjectData.${key} does not match subject data manifest.`
      );
    }
  }
  if (!/^[a-f0-9]{64}$/.test(departmentConstants.subjectData.sha256)) {
    throw new Error(
      'Department constants subjectData.sha256 must be a full lowercase SHA-256 hex digest.'
    );
  }
  if (departmentConstants.subjectData.sha256 !== subjectDataSha256) {
    throw new Error(
      'Department constants subjectData.sha256 does not match active subject data.'
    );
  }
  validateDepartmentLists(departmentConstants.departments);
}

export function deriveSubjectConstants(
  data,
  departmentConstants,
  manifest,
  subjectDataSha256
) {
  const subjects = Object.values(data);
  validateDepartmentConstants(departmentConstants, manifest, subjectDataSha256);

  const observedKaikouBukyokus = uniqueNonEmptyValues(
    subjects.map((subject) => subject['開講部局'])
  );
  const classifiedKaikouBukyokus = new Set([
    ...departmentConstants.departments.kaikouBukyokuGakubus,
    ...departmentConstants.departments.kaikouBukyokuDaigakuins,
  ]);
  const unclassified = observedKaikouBukyokus.filter(
    (department) => !classifiedKaikouBukyokus.has(department)
  );
  if (unclassified.length > 0) {
    throw new Error(
      `Unclassified observed 開講部局: ${unclassified.join(', ')}`
    );
  }
  const observedSet = new Set(observedKaikouBukyokus);

  return {
    campuses: uniqueNonEmptyValues(
      subjects.map((subject) => subject['開講キャンパス'])
    ),
    kamokuKubuns: uniqueNonEmptyValues(
      subjects.map((subject) => subject['科目区分'])
    ),
    languages: uniqueNonEmptyValues(
      subjects.map((subject) => subject['使用言語'])
    ),
    kaikouBukyokuGakubus:
      departmentConstants.departments.kaikouBukyokuGakubus.filter(
        (department) => observedSet.has(department)
      ),
    kaikouBukyokuDaigakuins:
      departmentConstants.departments.kaikouBukyokuDaigakuins.filter(
        (department) => observedSet.has(department)
      ),
  };
}

function renderTypeScript(constants) {
  return `// Generated from validated syllabus data, data/subjectConstants.json, and Harvester-derived data/department_constants.json
// Do not edit this file directly.

export const campuses = ${JSON.stringify(constants.campuses, null, 2)} as const;
export const semesters = ${JSON.stringify(constants.semesters, null, 2)} as const;
export const jikiKubuns = ${JSON.stringify(constants.jikiKubuns, null, 2)} as const;

export const jikiKubunMap: { [key: string]: (typeof jikiKubuns)[number] } = ${JSON.stringify(
    constants.jikiKubunMap,
    null,
    2
  )} as const;

export const kamokuKubuns = ${JSON.stringify(constants.kamokuKubuns, null, 2)} as const;

export const kaikouBukyokuGakubus = ${JSON.stringify(
    constants.kaikouBukyokuGakubus,
    null,
    2
  )} as const;

export const kaikouBukyokuDaigakuins = ${JSON.stringify(
    constants.kaikouBukyokuDaigakuins,
    null,
    2
  )} as const;

export const kaikouBukyokus = [
  ...kaikouBukyokuGakubus,
  ...kaikouBukyokuDaigakuins,
] as const;

export const languages = ${JSON.stringify(constants.languages, null, 2)} as const;

export const rishuNenjiNumbers = ${JSON.stringify(constants.rishuNenjiNumbers, null, 2)} as const;
`;
}

function renderActiveSubjectData(manifest) {
  const importPath = JSON.stringify(`../../data/${manifest.dataFile}`);
  return `// Generated from data/subjectDataManifest.json
// Do not edit this file directly.

import subjectData from ${importPath};

export { subjectData };
export const subjectDataManifest = ${JSON.stringify(manifest, null, 2)} as const;
`;
}

function renderRawSubjectProperties(rawProperties) {
  return `// Generated from data/subjectRawProperties.json.
// Do not edit this file directly.

export const rawSubjectProperties = ${JSON.stringify(rawProperties, null, 2)} as const;
`;
}

async function expectedOutputs() {
  const staticConstants = await readJson(staticJsonPath);
  const manifest = await readJson(manifestPath);
  validateManifest(manifest);
  const dataPath = path.join(root, 'data', manifest.dataFile);
  const { data, sha256: subjectDataSha256 } = parseAndHashSubjectData(
    await fs.readFile(dataPath)
  );
  const departmentConstants = await readJson(departmentConstantsPath);
  const rawProperties = await readJson(rawPropertiesJsonPath);

  validateSubjectData(data, manifest);
  const derivedConstants = deriveSubjectConstants(
    data,
    departmentConstants,
    manifest,
    subjectDataSha256
  );
  const allConstants = { ...staticConstants, ...derivedConstants };
  const prettierConfig = (await prettier.resolveConfig(tsPath)) ?? {};

  return {
    derivedJson: await prettier.format(JSON.stringify(derivedConstants), {
      ...prettierConfig,
      parser: 'json',
    }),
    typeScript: await prettier.format(renderTypeScript(allConstants), {
      ...prettierConfig,
      parser: 'typescript',
    }),
    activeDataTypeScript: await prettier.format(
      renderActiveSubjectData(manifest),
      {
        ...prettierConfig,
        parser: 'typescript',
      }
    ),
    rawPropertiesTypeScript: await prettier.format(
      renderRawSubjectProperties(rawProperties),
      {
        ...prettierConfig,
        parser: 'typescript',
      }
    ),
  };
}

async function fileMatches(filePath, expected) {
  try {
    return (await fs.readFile(filePath, 'utf8')) === expected;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function writeIfChanged(filePath, expected) {
  if (await fileMatches(filePath, expected)) {
    return false;
  }
  await fs.writeFile(filePath, expected, 'utf8');
  return true;
}

export async function generateSubjectConstants({ check = false } = {}) {
  const expected = await expectedOutputs();

  if (check) {
    const staleFiles = [];
    if (!(await fileMatches(derivedJsonPath, expected.derivedJson))) {
      staleFiles.push(path.relative(root, derivedJsonPath));
    }
    if (!(await fileMatches(tsPath, expected.typeScript))) {
      staleFiles.push(path.relative(root, tsPath));
    }
    if (!(await fileMatches(activeDataTsPath, expected.activeDataTypeScript))) {
      staleFiles.push(path.relative(root, activeDataTsPath));
    }
    if (
      !(await fileMatches(
        rawPropertiesTsPath,
        expected.rawPropertiesTypeScript
      ))
    ) {
      staleFiles.push(path.relative(root, rawPropertiesTsPath));
    }
    if (staleFiles.length > 0) {
      throw new Error(
        `Generated subject constants are stale: ${staleFiles.join(
          ', '
        )}. Run pnpm generate:subject-constants.`
      );
    }
    console.log('Subject constants are up to date.');
    return;
  }

  const changedFiles = [];
  if (await writeIfChanged(derivedJsonPath, expected.derivedJson)) {
    changedFiles.push(path.relative(root, derivedJsonPath));
  }
  if (await writeIfChanged(tsPath, expected.typeScript)) {
    changedFiles.push(path.relative(root, tsPath));
  }
  if (await writeIfChanged(activeDataTsPath, expected.activeDataTypeScript)) {
    changedFiles.push(path.relative(root, activeDataTsPath));
  }
  if (
    await writeIfChanged(rawPropertiesTsPath, expected.rawPropertiesTypeScript)
  ) {
    changedFiles.push(path.relative(root, rawPropertiesTsPath));
  }

  if (changedFiles.length === 0) {
    console.log('Subject constants are already up to date.');
  } else {
    console.log(`Generated ${changedFiles.join(', ')}`);
  }
}

async function main() {
  await generateSubjectConstants({ check: process.argv.includes('--check') });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
