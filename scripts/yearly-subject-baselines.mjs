import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

import { validateYearData } from './subject-diff.mjs';

const root = process.cwd();
export const defaultDataDir = path.join(root, 'data');
export const defaultRegistryPath = path.join(
  defaultDataDir,
  'yearlySubjectBaselines.json'
);

const fileNamePattern = /^.+_(\d{4})-(\d{2})-(\d{2})\.json$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const hashPattern = /^[a-f0-9]{64}$/;

function validateDate(value, label) {
  if (!datePattern.test(value))
    throw new Error(`${label} must use the form YYYY-MM-DD.`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error(`${label} must be a valid calendar date.`);
}

function validateDataFileName(dataFile) {
  if (
    typeof dataFile !== 'string' ||
    path.basename(dataFile) !== dataFile ||
    !/^[A-Za-z0-9._-]+\.json$/.test(dataFile)
  ) {
    throw new Error('Baseline dataFile must be a safe JSON basename in data/.');
  }
  const match = dataFile.match(fileNamePattern);
  if (!match)
    throw new Error(`Baseline dataFile has no retrieval date: ${dataFile}`);
  validateDate(
    `${match[1]}-${match[2]}-${match[3]}`,
    `Baseline ${dataFile} date`
  );
  return {
    filenameYear: `${match[1]}年度`,
    retrievedAt: `${match[1]}-${match[2]}-${match[3]}`,
  };
}

function assertDataPath(dataFile, dataDir) {
  validateDataFileName(dataFile);
  const resolvedDataDir = path.resolve(dataDir);
  const resolvedPath = path.resolve(resolvedDataDir, dataFile);
  if (path.dirname(resolvedPath) !== resolvedDataDir)
    throw new Error(
      `Baseline dataFile must be directly under data/: ${dataFile}`
    );
  return resolvedPath;
}

function inputToDataFile(input, dataDir) {
  if (typeof input !== 'string' || input.split(/[\\/]/).includes('..'))
    throw new Error(`Baseline input must not use path traversal: ${input}`);
  if (path.basename(input) === input) return input;
  const resolved = path.resolve(input);
  if (path.dirname(resolved) !== path.resolve(dataDir))
    throw new Error(
      `Baseline input must be a file directly under data/: ${input}`
    );
  return path.basename(resolved);
}

export function validateRegistryShape(registry) {
  if (!registry || typeof registry !== 'object' || Array.isArray(registry))
    throw new Error('Yearly subject baseline registry must be an object.');
  if (Object.keys(registry).sort().join(',') !== 'entries,schemaVersion')
    throw new Error('Yearly subject baseline registry has unexpected fields.');
  if (registry.schemaVersion !== 1)
    throw new Error(
      'Yearly subject baseline registry schemaVersion must be 1.'
    );
  if (!Array.isArray(registry.entries) || registry.entries.length === 0)
    throw new Error(
      'Yearly subject baseline registry entries must be non-empty.'
    );

  let previousYear = 0;
  const years = new Set();
  for (const entry of registry.entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry))
      throw new Error('Each yearly subject baseline entry must be an object.');
    if (
      Object.keys(entry).sort().join(',') !==
      'academicYear,dataFile,retrievedAt,sha256,subjectCount'
    )
      throw new Error('Baseline entry has unexpected or missing fields.');
    if (!/^\d{4}年度$/.test(entry.academicYear))
      throw new Error('Baseline academicYear must use the form YYYY年度.');
    const year = Number(entry.academicYear.slice(0, 4));
    const file = validateDataFileName(entry.dataFile);
    if (file.filenameYear !== entry.academicYear)
      throw new Error(
        `Baseline year does not match filename: ${entry.dataFile}`
      );
    if (year <= previousYear)
      throw new Error(
        'Baseline entries must be in ascending, unique year order.'
      );
    previousYear = year;
    if (years.has(entry.academicYear))
      throw new Error(
        `Duplicate baseline academic year: ${entry.academicYear}`
      );
    years.add(entry.academicYear);
    if (entry.retrievedAt !== file.retrievedAt)
      throw new Error(
        `Baseline retrievedAt does not match filename: ${entry.dataFile}`
      );
    if (!hashPattern.test(entry.sha256))
      throw new Error(
        `Baseline sha256 must be 64 lowercase hex characters: ${entry.dataFile}`
      );
    if (!Number.isInteger(entry.subjectCount) || entry.subjectCount < 1)
      throw new Error(
        `Baseline subjectCount must be a positive integer: ${entry.dataFile}`
      );
  }
  return registry;
}

async function readEntry(dataFile, dataDir) {
  const filePath = assertDataPath(dataFile, dataDir);
  const bytes = await fs.readFile(filePath);
  const data = JSON.parse(bytes.toString('utf8'));
  const validated = validateYearData(data, dataFile);
  const file = validateDataFileName(dataFile);
  if (validated.academicYear !== file.filenameYear)
    throw new Error(`Academic year does not match filename: ${dataFile}`);
  return {
    academicYear: validated.academicYear,
    retrievedAt: file.retrievedAt,
    dataFile,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    subjectCount: Object.keys(data).length,
  };
}

export async function buildRegistry(dataFiles, dataDir = defaultDataDir) {
  if (!Array.isArray(dataFiles) || dataFiles.length === 0)
    throw new Error('At least one explicit baseline data file is required.');
  const entries = await Promise.all(
    dataFiles.map((dataFile) =>
      readEntry(inputToDataFile(dataFile, dataDir), dataDir)
    )
  );
  const registry = {
    schemaVersion: 1,
    entries: entries.sort((a, b) =>
      a.academicYear.localeCompare(b.academicYear)
    ),
  };
  validateRegistryShape(registry);
  return registry;
}

export async function validateYearlySubjectBaselines(
  registry,
  dataDir = defaultDataDir
) {
  validateRegistryShape(registry);
  const actual = await buildRegistry(
    registry.entries.map((entry) => entry.dataFile),
    dataDir
  );
  if (JSON.stringify(actual) !== JSON.stringify(registry))
    throw new Error(
      'Yearly subject baseline registry is out of date or data has changed.'
    );
  return registry;
}

export async function generateYearlySubjectBaselines({
  dataFiles,
  dataDir = defaultDataDir,
  registryPath = defaultRegistryPath,
  check = false,
} = {}) {
  const registry = JSON.parse(
    await fs.readFile(registryPath, 'utf8').catch((error) => {
      if (check && error.code === 'ENOENT')
        throw new Error(
          `Yearly subject baseline registry is missing: ${registryPath}`
        );
      if (check) throw error;
      return '{}';
    })
  );
  const expected = check
    ? await validateYearlySubjectBaselines(registry, dataDir)
    : await buildRegistry(dataFiles, dataDir);
  if (!check)
    await fs.writeFile(registryPath, `${JSON.stringify(expected, null, 2)}\n`);
  return expected;
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const files = args.filter((arg) => arg !== '--check');
  if (check && files.length)
    throw new Error(
      'Usage: node scripts/yearly-subject-baselines.mjs [--check]'
    );
  if (!check && files.length === 0)
    throw new Error(
      'Usage: node scripts/yearly-subject-baselines.mjs DATA_FILE...'
    );
  await generateYearlySubjectBaselines({ dataFiles: files, check });
  console.log(
    check
      ? 'Yearly subject baseline registry is up to date.'
      : 'Generated data/yearlySubjectBaselines.json'
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
