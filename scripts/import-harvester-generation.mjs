import { createHash, randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

import {
  deriveSubjectConstants,
  parseAndHashSubjectData,
  validateDepartmentConstants,
} from './generate-subject-constants.mjs';
import {
  evaluateUpdateGuard,
  validateUpdateGuardConfig,
} from './update-guard.mjs';
import {
  validateManifest,
  validateSubjectData,
} from './validate-subject-data.mjs';

async function readJson(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid ${label} JSON: ${error.message}`);
  }
}

function validateStructureReport(report, manifest, dataSha256) {
  if (manifest.schemaVersion !== 1 || !manifest.structureReport) {
    throw new Error(
      'Harvester manifest must include a version 1 structure report.'
    );
  }
  if (
    !report ||
    typeof report !== 'object' ||
    Array.isArray(report) ||
    report.schemaVersion !== 1 ||
    report.academicYear !== manifest.academicYear ||
    report.retrievedAt !== manifest.retrievedAt ||
    report.source !== manifest.source ||
    !report.subjectData ||
    report.subjectData.dataFile !== manifest.dataFile ||
    report.subjectData.sha256 !== dataSha256 ||
    report.subjectData.subjectCount !== manifest.subjectCount ||
    !report.structure ||
    report.structure.subjectPageCount !== manifest.subjectCount ||
    !Array.isArray(report.structure.unknownHeaders) ||
    !Array.isArray(report.structure.missingHeaders) ||
    !Array.isArray(report.structure.observedHeaders) ||
    !report.structure.headerPresence ||
    typeof report.structure.headerPresence !== 'object' ||
    !isSortedUniqueStrings(report.structure.unknownHeaders) ||
    !isSortedUniqueStrings(report.structure.missingHeaders) ||
    !isSortedUniqueStrings(report.structure.observedHeaders) ||
    report.structure.missingHeaders.length !== 0 ||
    report.structure.unknownHeaders.some(
      (header) => !report.structure.observedHeaders.includes(header)
    ) ||
    report.structure.unknownHeaders.some(
      (header) =>
        !validHeaderPresence(
          report.structure.headerPresence[header],
          report.structure.subjectPageCount
        )
    )
  ) {
    throw new Error(
      'Harvester structure report does not match the generation.'
    );
  }
}

function isSortedUniqueStrings(values) {
  return values.every(
    (value, index) =>
      typeof value === 'string' && value > (values[index - 1] ?? '')
  );
}

function validHeaderPresence(value, pageCount) {
  return (
    value &&
    typeof value === 'object' &&
    Number.isInteger(value.presentCount) &&
    value.presentCount > 0 &&
    value.presentCount <= pageCount &&
    value.presenceRate === value.presentCount / pageCount &&
    Number.isInteger(value.emptyCount) &&
    value.emptyCount >= 0 &&
    value.emptyCount <= value.presentCount &&
    value.emptyRate === value.emptyCount / pageCount
  );
}

function addStructureInfo(guardReport, structure) {
  if (structure.unknownHeaders.length === 0) return guardReport;
  return {
    ...guardReport,
    info: [
      ...guardReport.info,
      ...structure.unknownHeaders.map((header) => {
        const presence = structure.headerPresence[header];
        return `HTML extra header: ${header} (present ${presence.presentCount}/${structure.subjectPageCount}, empty ${presence.emptyCount}/${structure.subjectPageCount})`;
      }),
    ],
  };
}

async function atomicReplace(filePath, bytes) {
  const temporaryPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${randomUUID()}.tmp`
  );
  try {
    await fs.writeFile(temporaryPath, bytes, { flag: 'wx' });
    await fs.rename(temporaryPath, filePath);
  } finally {
    await fs.rm(temporaryPath, { force: true });
  }
}

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--check') {
      values.check = true;
      continue;
    }
    if (argument === '--accept-review') {
      values.acceptReview = true;
      continue;
    }
    if (argument === '--manifest' || argument === '--departments') {
      if (!argv[index + 1] || values[argument.slice(2)]) {
        throw new Error(`Expected one value for ${argument}.`);
      }
      values[argument.slice(2)] = argv[(index += 1)];
      continue;
    }
    if (
      argument === '--destination-data-dir' ||
      argument === '--update-guard'
    ) {
      if (!argv[index + 1])
        throw new Error(`Expected one value for ${argument}.`);
      values[
        argument === '--update-guard' ? 'updateGuardPath' : 'destinationDataDir'
      ] = argv[(index += 1)];
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (!values.manifest || !values.departments) {
    throw new Error(
      'Usage: --manifest <path> --departments <path> [--check] [--accept-review]'
    );
  }
  return values;
}

async function evaluateDestinationGuard(destinationDataDir, incoming, config) {
  const manifestPath = path.join(
    destinationDataDir,
    'subjectDataManifest.json'
  );
  let bytes;
  try {
    bytes = await fs.readFile(manifestPath);
  } catch (error) {
    if (error.code === 'ENOENT')
      return {
        hardFailures: [],
        review: [],
        analysis: [],
        info: ['no baseline'],
      };
    throw error;
  }
  let manifest;
  try {
    manifest = JSON.parse(bytes.toString('utf8'));
  } catch (error) {
    throw new Error(`Invalid baseline manifest JSON: ${error.message}`);
  }
  validateManifest(manifest);
  const baseline = JSON.parse(
    await fs.readFile(path.join(destinationDataDir, manifest.dataFile), 'utf8')
  );
  validateSubjectData(baseline, manifest);
  return evaluateUpdateGuard(baseline, incoming, config);
}

function enforceGuard(report, check, acceptReview) {
  if (report.hardFailures.length)
    throw new Error(
      `Update guard hard failure: ${report.hardFailures.join('; ')}`
    );
  if (!check && report.review.length && !acceptReview)
    throw new Error(
      `Update guard review required: ${report.review.join('; ')}. Re-run with --accept-review.`
    );
}

async function canonicalPath(filePath) {
  const suffix = [];
  let candidate = path.resolve(filePath);
  let resolvedExistingPath;
  while (resolvedExistingPath === undefined) {
    try {
      resolvedExistingPath = await fs.realpath(candidate);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(candidate);
      if (parent === candidate) throw error;
      suffix.push(path.basename(candidate));
      candidate = parent;
    }
  }
  return path.join(resolvedExistingPath, ...suffix.reverse());
}

async function assertDistinctInputPaths(inputPaths, destinationPaths) {
  const canonicalInputs = await Promise.all(inputPaths.map(canonicalPath));
  const canonicalDestinations = await Promise.all(
    destinationPaths.map(canonicalPath)
  );
  for (const inputPath of canonicalInputs) {
    if (canonicalDestinations.includes(inputPath)) {
      throw new Error(
        'Harvester input paths must not alias destination files.'
      );
    }
  }
}

async function acquireLock(destinationDataDir) {
  const lockPath = path.join(
    destinationDataDir,
    '.import-harvester-generation.lock'
  );
  let handle;
  try {
    handle = await fs.open(lockPath, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error('Harvester generation import is already locked.');
    }
    throw error;
  }
  return async () => {
    await handle.close();
    await fs.rm(lockPath, { force: true });
  };
}

export async function importHarvesterGeneration({
  manifestPath,
  departmentsPath,
  destinationDataDir = path.join(process.cwd(), 'data'),
  check = false,
  acceptReview = false,
  updateGuardPath = path.join(process.cwd(), 'data', 'updateGuard.json'),
  replaceFile = atomicReplace,
  afterLock,
}) {
  const sourceManifestPath = path.resolve(manifestPath);
  const sourceDepartmentsPath = path.resolve(departmentsPath);
  const manifest = await readJson(sourceManifestPath, 'Harvester manifest');
  validateManifest(manifest);
  if (manifest.schemaVersion !== 1 || !manifest.structureReport) {
    throw new Error(
      'Harvester manifest must include a version 1 structure report.'
    );
  }
  const sourceDataPath = path.resolve(
    path.dirname(sourceManifestPath),
    manifest.dataFile
  );
  const sourceStructurePath = path.resolve(
    path.dirname(sourceManifestPath),
    manifest.structureReport?.dataFile ?? ''
  );
  const destinationDataPath = path.resolve(
    destinationDataDir,
    manifest.dataFile
  );
  const destinationDepartmentsPath = path.resolve(
    destinationDataDir,
    'department_constants.json'
  );
  const destinationStructurePath = path.resolve(
    destinationDataDir,
    'subject_structure.json'
  );
  const destinationManifestPath = path.resolve(
    destinationDataDir,
    'subjectDataManifest.json'
  );
  await assertDistinctInputPaths(
    [
      sourceManifestPath,
      sourceDataPath,
      sourceDepartmentsPath,
      sourceStructurePath,
    ],
    [
      destinationDataPath,
      destinationDepartmentsPath,
      destinationStructurePath,
      destinationManifestPath,
    ]
  );

  const [dataBytes, departmentConstants, structureBytes, structureReport] =
    await Promise.all([
      fs.readFile(sourceDataPath),
      readJson(sourceDepartmentsPath, 'Harvester department artifact'),
      fs.readFile(sourceStructurePath),
      readJson(sourceStructurePath, 'Harvester structure report'),
    ]);
  const { data, sha256 } = parseAndHashSubjectData(dataBytes);
  validateSubjectData(data, manifest);
  validateDepartmentConstants(departmentConstants, manifest, sha256);
  const structureSha256 = createHash('sha256')
    .update(structureBytes)
    .digest('hex');
  if (structureSha256 !== manifest.structureReport.sha256) {
    throw new Error('Harvester structure report hash does not match manifest.');
  }
  validateStructureReport(structureReport, manifest, sha256);
  deriveSubjectConstants(data, departmentConstants, manifest, sha256);

  const updateGuard = await readJson(updateGuardPath, 'update guard config');
  validateUpdateGuardConfig(updateGuard);
  let guardReport = addStructureInfo(
    await evaluateDestinationGuard(destinationDataDir, data, updateGuard),
    structureReport.structure
  );
  enforceGuard(guardReport, check, acceptReview);

  if (check) return { manifest, sha256, changed: false, guardReport };

  await fs.mkdir(destinationDataDir, { recursive: true });
  const releaseLock = await acquireLock(destinationDataDir);
  try {
    if (afterLock) await afterLock();
    guardReport = addStructureInfo(
      await evaluateDestinationGuard(destinationDataDir, data, updateGuard),
      structureReport.structure
    );
    enforceGuard(guardReport, false, acceptReview);
    let existingData;
    let previousDepartments;
    let previousStructure;
    try {
      existingData = await fs.readFile(destinationDataPath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      previousDepartments = await fs.readFile(destinationDepartmentsPath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    try {
      previousStructure = await fs.readFile(destinationStructurePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (existingData && !existingData.equals(dataBytes)) {
      throw new Error(
        `Destination data collision for ${manifest.dataFile}: bytes differ.`
      );
    }

    let installedDepartments = false;
    let installedStructure = false;
    let createdData = false;
    try {
      if (!existingData) {
        await replaceFile(destinationDataPath, dataBytes);
        createdData = true;
      }
      await replaceFile(
        destinationDepartmentsPath,
        `${JSON.stringify(departmentConstants, null, 2)}\n`
      );
      installedDepartments = true;
      await replaceFile(destinationStructurePath, structureBytes);
      installedStructure = true;
      await replaceFile(
        destinationManifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`
      );
    } catch (error) {
      if (installedStructure) {
        if (previousStructure) {
          await replaceFile(destinationStructurePath, previousStructure);
        } else {
          await fs.rm(destinationStructurePath, { force: true });
        }
      }
      if (installedDepartments) {
        if (previousDepartments) {
          await replaceFile(destinationDepartmentsPath, previousDepartments);
        } else {
          await fs.rm(destinationDepartmentsPath, { force: true });
        }
      }
      if (createdData) await fs.rm(destinationDataPath, { force: true });
      throw error;
    }
    return { manifest, sha256, changed: true, guardReport };
  } finally {
    await releaseLock();
  }
}

async function main() {
  const arguments_ = parseArguments(process.argv.slice(2));
  const result = await importHarvesterGeneration({
    manifestPath: arguments_.manifest,
    departmentsPath: arguments_.departments,
    check: arguments_.check,
    acceptReview: arguments_.acceptReview,
    destinationDataDir: arguments_.destinationDataDir,
    updateGuardPath: arguments_.updateGuardPath,
  });
  if (arguments_.check)
    console.log(JSON.stringify(result.guardReport, null, 2));
  console.log(
    `${arguments_.check ? 'Validated' : 'Imported'} ${result.manifest.dataFile}. ${arguments_.check ? '' : 'Run pnpm generate:subject-constants before build.'}`.trim()
  );
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
