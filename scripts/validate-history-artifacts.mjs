import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  canonicalSha256,
  classificationFields,
} from './classification-diff.mjs';
import {
  requiredFields,
  validateSubjectData,
} from './validate-subject-data.mjs';

const historyMetadataFields = [
  'academicYear',
  'retrievedAt',
  'subjectCount',
  'canonicalSha256',
  'source',
];

const exact = (value, keys) =>
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));
const compareCodePoints = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

function validateIndexSnapshot(value, academicYear, label) {
  if (
    !exact(value, [
      'dataFile',
      'retrievedAt',
      'subjectCount',
      'canonicalSha256',
    ]) ||
    !/^subject_details_main_[A-Za-z0-9._-]+\.json$/.test(value.dataFile) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.retrievedAt) ||
    !Number.isInteger(value.subjectCount) ||
    value.subjectCount < 1 ||
    !/^[a-f0-9]{64}$/.test(value.canonicalSha256) ||
    !/^\d{4}年度$/.test(academicYear)
  )
    throw new Error(`History index ${label} is invalid.`);
}

function validateFilePointer(pointer, filenamePattern, label) {
  if (
    !exact(pointer, ['dataFile', 'sha256']) ||
    !filenamePattern.test(pointer.dataFile) ||
    !/^[a-f0-9]{64}$/.test(pointer.sha256)
  )
    throw new Error(`${label} pointer is invalid.`);
}

function validateMetadata(value, label) {
  if (!exact(value, historyMetadataFields))
    throw new Error(`${label} history metadata has an invalid contract.`);
  if (
    !/^\d{4}年度$/.test(value.academicYear) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value.retrievedAt) ||
    !Number.isInteger(value.subjectCount) ||
    value.subjectCount < 1 ||
    !/^[a-f0-9]{64}$/.test(value.canonicalSha256) ||
    typeof value.source !== 'string' ||
    !value.source.startsWith('https://')
  )
    throw new Error(`${label} history metadata is invalid.`);
  return value;
}

function validateSnapshot(data, metadata, label) {
  validateSubjectData(data, {
    dataFile: 'history.json',
    academicYear: metadata.academicYear,
    retrievedAt: metadata.retrievedAt,
    subjectCount: metadata.subjectCount,
    source: metadata.source,
  });
  if (canonicalSha256(data) !== metadata.canonicalSha256)
    throw new Error(`${label} canonical SHA-256 does not match.`);
}

export function validateHistoryArtifact(artifact) {
  if (!exact(artifact, ['schemaVersion', 'base', 'target', 'changes']))
    throw new Error('History artifact has an invalid contract.');
  if (artifact.schemaVersion !== 1)
    throw new Error('History artifact schemaVersion must be 1.');
  const base = validateMetadata(artifact.base, 'Base');
  const target = validateMetadata(artifact.target, 'Target');
  if (base.academicYear !== target.academicYear)
    throw new Error('History artifact crosses academic years.');
  if (base.retrievedAt >= target.retrievedAt)
    throw new Error('History artifact dates must increase.');
  if (!Array.isArray(artifact.changes))
    throw new Error('History artifact changes must be an array.');
  const codes = [];
  for (const change of artifact.changes) {
    if (!change || typeof change !== 'object' || Array.isArray(change))
      throw new Error('History change must be an object.');
    const { lectureCode, type } = change;
    if (typeof lectureCode !== 'string' || lectureCode === '')
      throw new Error('History lectureCode must be nonempty.');
    codes.push(lectureCode);
    if (type === 'added') {
      if (!exact(change, ['lectureCode', 'type', 'after']))
        throw new Error('Added history change is invalid.');
    } else if (type === 'removed') {
      if (!exact(change, ['lectureCode', 'type', 'before']))
        throw new Error('Removed history change is invalid.');
    } else if (type === 'changed') {
      if (
        !exact(change, ['lectureCode', 'type', 'fields']) ||
        !Array.isArray(change.fields) ||
        change.fields.length === 0
      )
        throw new Error('Changed history change is invalid.');
      const fields = [];
      for (const item of change.fields) {
        if (
          !exact(item, ['field', 'before', 'after']) ||
          !requiredFields.includes(item.field) ||
          typeof item.before !== 'string' ||
          typeof item.after !== 'string' ||
          item.before === item.after
        )
          throw new Error('Changed history field is invalid.');
        fields.push(item.field);
      }
      if (
        fields.join('\0') !==
        [...new Set(fields)].sort(compareCodePoints).join('\0')
      )
        throw new Error('Changed history fields are not deterministic.');
    } else throw new Error('History change type is invalid.');
  }
  if (
    codes.join('\0') !== [...new Set(codes)].sort(compareCodePoints).join('\0')
  )
    throw new Error('History changes are not deterministic.');
  return artifact;
}

export function applyHistoryArtifact(data, artifact, reverse = false) {
  validateHistoryArtifact(artifact);
  const start = reverse ? artifact.target : artifact.base;
  const finish = reverse ? artifact.base : artifact.target;
  validateSnapshot(data, start, 'History input');
  const result = structuredClone(data);
  const changes = reverse ? [...artifact.changes].reverse() : artifact.changes;
  for (const change of changes) {
    const code = change.lectureCode;
    if (change.type === 'added') {
      if (reverse) {
        if (canonicalSha256(result[code]) !== canonicalSha256(change.after))
          throw new Error('Added record does not match reverse input.');
        delete result[code];
      } else {
        if (Object.hasOwn(result, code))
          throw new Error('Added record already exists.');
        result[code] = structuredClone(change.after);
      }
    } else if (change.type === 'removed') {
      if (reverse) {
        if (Object.hasOwn(result, code))
          throw new Error('Removed record already exists in reverse input.');
        result[code] = structuredClone(change.before);
      } else {
        if (canonicalSha256(result[code]) !== canonicalSha256(change.before))
          throw new Error('Removed record does not match input.');
        delete result[code];
      }
    } else {
      if (!Object.hasOwn(result, code))
        throw new Error('Changed record is missing.');
      for (const field of change.fields) {
        const expected = reverse ? field.after : field.before;
        const replacement = reverse ? field.before : field.after;
        if (result[code][field.field] !== expected)
          throw new Error('Changed field does not match input.');
        result[code][field.field] = replacement;
      }
    }
  }
  validateSnapshot(result, finish, 'History result');
  return result;
}

function validateValueEntries(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  const names = [];
  for (const entry of value) {
    if (
      !exact(entry, ['value', 'lectureCount']) ||
      typeof entry.value !== 'string' ||
      entry.value === '' ||
      !Number.isInteger(entry.lectureCount) ||
      entry.lectureCount < 1
    )
      throw new Error(`${label} contains an invalid value count.`);
    names.push(entry.value);
  }
  if (
    names.join('\0') !== [...new Set(names)].sort(compareCodePoints).join('\0')
  )
    throw new Error(`${label} is not deterministic.`);
}

export function validateClassificationArtifact(artifact, knownHashes) {
  if (
    !exact(artifact, [
      'schemaVersion',
      'comparisonType',
      'base',
      'target',
      'fields',
    ])
  )
    throw new Error('Classification artifact has an invalid contract.');
  if (artifact.schemaVersion !== 2)
    throw new Error('Classification artifact schemaVersion must be 2.');
  const metadataKeys = historyMetadataFields.filter(
    (field) => field !== 'source'
  );
  for (const label of ['base', 'target']) {
    const metadata = artifact[label];
    if (
      !exact(metadata, metadataKeys) ||
      !/^\d{4}年度$/.test(metadata.academicYear) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(metadata.retrievedAt) ||
      !Number.isInteger(metadata.subjectCount) ||
      metadata.subjectCount < 1 ||
      !knownHashes.has(metadata.canonicalSha256)
    )
      throw new Error(`Classification ${label} metadata is invalid.`);
  }
  const expectedType =
    artifact.base.academicYear === artifact.target.academicYear
      ? 'same-academic-year'
      : 'academic-year-rollover';
  if (artifact.comparisonType !== expectedType)
    throw new Error('Classification comparisonType is invalid.');
  if (!exact(artifact.fields, classificationFields))
    throw new Error('Classification fields contract is invalid.');
  for (const field of classificationFields) {
    const value = artifact.fields[field];
    if (
      !exact(value, [
        'beforeUniqueCount',
        'afterUniqueCount',
        'beforeEmptyCount',
        'afterEmptyCount',
        'beforeEmptyRate',
        'afterEmptyRate',
        'emptyRateChange',
        'added',
        'removed',
        'beforeValues',
        'afterValues',
      ]) ||
      !Number.isInteger(value.beforeUniqueCount) ||
      !Number.isInteger(value.afterUniqueCount) ||
      !Number.isInteger(value.beforeEmptyCount) ||
      value.beforeEmptyCount < 0 ||
      !Number.isInteger(value.afterEmptyCount) ||
      value.afterEmptyCount < 0 ||
      !Number.isFinite(value.beforeEmptyRate) ||
      !Number.isFinite(value.afterEmptyRate) ||
      !Number.isFinite(value.emptyRateChange) ||
      value.beforeEmptyRate < 0 ||
      value.beforeEmptyRate > 1 ||
      value.afterEmptyRate < 0 ||
      value.afterEmptyRate > 1 ||
      value.emptyRateChange < -1 ||
      value.emptyRateChange > 1
    )
      throw new Error(`Classification ${field} contract is invalid.`);
    for (const key of ['added', 'removed', 'beforeValues', 'afterValues'])
      validateValueEntries(value[key], `Classification ${field} ${key}`);
    if (
      value.beforeValues.length !== value.beforeUniqueCount ||
      value.afterValues.length !== value.afterUniqueCount ||
      value.beforeValues.reduce((sum, item) => sum + item.lectureCount, 0) +
        value.beforeEmptyCount !==
        artifact.base.subjectCount ||
      value.afterValues.reduce((sum, item) => sum + item.lectureCount, 0) +
        value.afterEmptyCount !==
        artifact.target.subjectCount
    )
      throw new Error(`Classification ${field} unique count does not match.`);
    if (
      value.beforeEmptyRate !==
        value.beforeEmptyCount / artifact.base.subjectCount ||
      value.afterEmptyRate !==
        value.afterEmptyCount / artifact.target.subjectCount ||
      value.emptyRateChange !== value.afterEmptyRate - value.beforeEmptyRate
    )
      throw new Error(`Classification ${field} empty rates do not match.`);
    const before = new Map(
      value.beforeValues.map((item) => [item.value, item])
    );
    const after = new Map(value.afterValues.map((item) => [item.value, item]));
    const expectedAdded = value.afterValues.filter(
      (item) => !before.has(item.value)
    );
    const expectedRemoved = value.beforeValues.filter(
      (item) => !after.has(item.value)
    );
    if (
      JSON.stringify(value.added) !== JSON.stringify(expectedAdded) ||
      JSON.stringify(value.removed) !== JSON.stringify(expectedRemoved)
    )
      throw new Error(`Classification ${field} added/removed does not match.`);
  }
}

async function readJson(filePath, label) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid ${label} JSON: ${error.message}`);
  }
}

const fileSha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function validateHistoryDataDir(dataDir) {
  const historyRoot = path.join(dataDir, 'history');
  let years;
  try {
    years = (await fs.readdir(historyRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const reports = [];
  for (const year of years) {
    const directory = path.join(historyRoot, year);
    const index = await readJson(
      path.join(directory, 'index.json'),
      'history index'
    );
    if (
      !exact(index, [
        'schemaVersion',
        'academicYear',
        'baseline',
        'latest',
        'artifacts',
        'classificationArtifacts',
      ]) ||
      index.schemaVersion !== 1 ||
      index.academicYear !== `${year}年度` ||
      !Array.isArray(index.artifacts) ||
      !Array.isArray(index.classificationArtifacts)
    )
      throw new Error(`History index for ${year} is invalid.`);
    validateIndexSnapshot(index.baseline, index.academicYear, 'baseline');
    validateIndexSnapshot(index.latest, index.academicYear, 'latest');
    const baseline = await readJson(
      path.join(dataDir, index.baseline.dataFile),
      'history baseline'
    );
    const knownHashes = new Set([canonicalSha256(baseline)]);
    for (const entry of await fs.readdir(dataDir, { withFileTypes: true })) {
      if (
        entry.isFile() &&
        /^subject_details_main_[A-Za-z0-9._-]+\.json$/.test(entry.name)
      ) {
        knownHashes.add(
          canonicalSha256(
            await readJson(path.join(dataDir, entry.name), 'subject snapshot')
          )
        );
      }
    }
    let current = baseline;
    const artifacts = [];
    for (const pointer of index.artifacts) {
      validateFilePointer(
        pointer,
        /^history_[A-Za-z0-9._-]+\.json$/,
        'History artifact'
      );
      const bytes = await fs.readFile(path.join(directory, pointer.dataFile));
      if (fileSha256(bytes) !== pointer.sha256)
        throw new Error('History artifact file SHA-256 does not match.');
      const artifact = JSON.parse(bytes);
      artifacts.push(artifact);
      current = applyHistoryArtifact(current, artifact);
      knownHashes.add(artifact.base.canonicalSha256);
      knownHashes.add(artifact.target.canonicalSha256);
    }
    if (canonicalSha256(current) !== index.latest.canonicalSha256)
      throw new Error('History chain does not match index latest.');
    const latest = await readJson(
      path.join(dataDir, index.latest.dataFile),
      'history latest'
    );
    if (canonicalSha256(latest) !== canonicalSha256(current))
      throw new Error(
        'History latest file does not match reconstructed chain.'
      );
    let reversed = current;
    for (const artifact of [...artifacts].reverse())
      reversed = applyHistoryArtifact(reversed, artifact, true);
    if (canonicalSha256(reversed) !== canonicalSha256(baseline))
      throw new Error('History reverse reconstruction failed.');
    for (const pointer of index.classificationArtifacts) {
      validateFilePointer(
        pointer,
        /^classification_[A-Za-z0-9._-]+\.json$/,
        'Classification artifact'
      );
      const bytes = await fs.readFile(path.join(directory, pointer.dataFile));
      if (fileSha256(bytes) !== pointer.sha256)
        throw new Error('Classification artifact file SHA-256 does not match.');
      validateClassificationArtifact(JSON.parse(bytes), knownHashes);
    }
    reports.push({
      academicYear: index.academicYear,
      historyArtifactCount: index.artifacts.length,
      classificationArtifactCount: index.classificationArtifacts.length,
      latestSha256: index.latest.canonicalSha256,
    });
  }
  return reports;
}

async function main() {
  const dataDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve('data');
  const reports = await validateHistoryDataDir(dataDir);
  console.log(
    reports.length
      ? `Validated ${reports.length} academic-year history index(es).`
      : 'Validated: no syllabus history is installed.'
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
