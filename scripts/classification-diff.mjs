import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  validateManifest,
  validateSubjectData,
} from './validate-subject-data.mjs';

export const classificationFields = [
  '開講部局',
  '科目区分',
  '開講キャンパス',
  '使用言語',
];

const compareCodePoints = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

function canonicalJson(value) {
  if (Array.isArray(value))
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort(compareCodePoints)
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function canonicalSha256(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

function valueCounts(data, field) {
  const counts = new Map();
  let emptyCount = 0;
  for (const subject of Object.values(data)) {
    const value = subject[field];
    if (value === '') emptyCount += 1;
    else counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return {
    values: [...counts]
      .sort(([left], [right]) => compareCodePoints(left, right))
      .map(([value, lectureCount]) => ({ value, lectureCount })),
    emptyCount,
  };
}

function snapshotMetadata(data, manifest) {
  validateManifest(manifest);
  validateSubjectData(data, manifest);
  return {
    academicYear: manifest.academicYear,
    retrievedAt: manifest.retrievedAt,
    subjectCount: manifest.subjectCount,
    canonicalSha256: canonicalSha256(data),
  };
}

export function createClassificationDiff(
  baseline,
  baselineManifest,
  incoming,
  incomingManifest
) {
  const base = snapshotMetadata(baseline, baselineManifest);
  const target = snapshotMetadata(incoming, incomingManifest);
  if (base.retrievedAt > target.retrievedAt)
    throw new Error('Classification diff target must not predate baseline.');
  if (
    base.academicYear === target.academicYear &&
    base.retrievedAt === target.retrievedAt &&
    base.canonicalSha256 !== target.canonicalSha256
  )
    throw new Error(
      'Different same-year snapshots require distinct retrievedAt values.'
    );

  const fields = {};
  for (const field of classificationFields) {
    const before = valueCounts(baseline, field);
    const after = valueCounts(incoming, field);
    const beforeMap = new Map(
      before.values.map(({ value, lectureCount }) => [value, lectureCount])
    );
    const afterMap = new Map(
      after.values.map(({ value, lectureCount }) => [value, lectureCount])
    );
    fields[field] = {
      beforeUniqueCount: before.values.length,
      afterUniqueCount: after.values.length,
      beforeEmptyCount: before.emptyCount,
      afterEmptyCount: after.emptyCount,
      beforeEmptyRate: before.emptyCount / base.subjectCount,
      afterEmptyRate: after.emptyCount / target.subjectCount,
      emptyRateChange:
        after.emptyCount / target.subjectCount -
        before.emptyCount / base.subjectCount,
      added: after.values.filter(({ value }) => !beforeMap.has(value)),
      removed: before.values.filter(({ value }) => !afterMap.has(value)),
      beforeValues: before.values,
      afterValues: after.values,
    };
  }
  return {
    schemaVersion: 2,
    comparisonType:
      base.academicYear === target.academicYear
        ? 'same-academic-year'
        : 'academic-year-rollover',
    base,
    target,
    fields,
  };
}

export function serializeClassificationDiff(
  baseline,
  baselineManifest,
  incoming,
  incomingManifest
) {
  return `${JSON.stringify(
    createClassificationDiff(
      baseline,
      baselineManifest,
      incoming,
      incomingManifest
    ),
    null,
    2
  )}\n`;
}

async function loadSnapshot(manifestPath) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  validateManifest(manifest);
  const data = JSON.parse(
    await fs.readFile(
      path.join(path.dirname(manifestPath), manifest.dataFile),
      'utf8'
    )
  );
  return { manifest, data };
}

async function main() {
  if (process.argv.length !== 4)
    throw new Error(
      'Usage: node scripts/classification-diff.mjs BASELINE_MANIFEST INCOMING_MANIFEST'
    );
  const [baseline, incoming] = await Promise.all([
    loadSnapshot(path.resolve(process.argv[2])),
    loadSnapshot(path.resolve(process.argv[3])),
  ]);
  process.stdout.write(
    serializeClassificationDiff(
      baseline.data,
      baseline.manifest,
      incoming.data,
      incoming.manifest
    )
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
