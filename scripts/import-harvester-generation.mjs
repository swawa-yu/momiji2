import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

import {
  deriveSubjectConstants,
  parseAndHashSubjectData,
  validateDepartmentConstants,
} from './generate-subject-constants.mjs';
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
    if (argument === '--manifest' || argument === '--departments') {
      if (!argv[index + 1] || values[argument.slice(2)]) {
        throw new Error(`Expected one value for ${argument}.`);
      }
      values[argument.slice(2)] = argv[(index += 1)];
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (!values.manifest || !values.departments) {
    throw new Error('Usage: --manifest <path> --departments <path> [--check]');
  }
  return values;
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
  replaceFile = atomicReplace,
}) {
  const sourceManifestPath = path.resolve(manifestPath);
  const sourceDepartmentsPath = path.resolve(departmentsPath);
  const manifest = await readJson(sourceManifestPath, 'Harvester manifest');
  validateManifest(manifest);
  const sourceDataPath = path.resolve(
    path.dirname(sourceManifestPath),
    manifest.dataFile
  );
  const destinationDataPath = path.resolve(
    destinationDataDir,
    manifest.dataFile
  );
  const destinationDepartmentsPath = path.resolve(
    destinationDataDir,
    'department_constants.json'
  );
  const destinationManifestPath = path.resolve(
    destinationDataDir,
    'subjectDataManifest.json'
  );
  await assertDistinctInputPaths(
    [sourceManifestPath, sourceDataPath, sourceDepartmentsPath],
    [destinationDataPath, destinationDepartmentsPath, destinationManifestPath]
  );

  const [dataBytes, departmentConstants] = await Promise.all([
    fs.readFile(sourceDataPath),
    readJson(sourceDepartmentsPath, 'Harvester department artifact'),
  ]);
  const { data, sha256 } = parseAndHashSubjectData(dataBytes);
  validateSubjectData(data, manifest);
  validateDepartmentConstants(departmentConstants, manifest, sha256);
  deriveSubjectConstants(data, departmentConstants, manifest, sha256);

  if (check) return { manifest, sha256, changed: false };

  await fs.mkdir(destinationDataDir, { recursive: true });
  const releaseLock = await acquireLock(destinationDataDir);
  try {
    let existingData;
    let previousDepartments;
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
    if (existingData && !existingData.equals(dataBytes)) {
      throw new Error(
        `Destination data collision for ${manifest.dataFile}: bytes differ.`
      );
    }

    let installedDepartments = false;
    try {
      if (!existingData) await replaceFile(destinationDataPath, dataBytes);
      await replaceFile(
        destinationDepartmentsPath,
        `${JSON.stringify(departmentConstants, null, 2)}\n`
      );
      installedDepartments = true;
      await replaceFile(
        destinationManifestPath,
        `${JSON.stringify(manifest, null, 2)}\n`
      );
    } catch (error) {
      if (installedDepartments) {
        if (previousDepartments) {
          await replaceFile(destinationDepartmentsPath, previousDepartments);
        } else {
          await fs.rm(destinationDepartmentsPath, { force: true });
        }
      }
      throw error;
    }
    return { manifest, sha256, changed: true };
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
  });
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
