import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  buildRegistry,
  validateRegistryShape,
  validateYearlySubjectBaselines,
} from './yearly-subject-baselines.mjs';

const files = [
  'subject_data_main_2024-04-05.json',
  'subject_details_main_2025-04-03.json',
  'subject_details_main_2026-04-07.json',
];

test('builds deterministic metadata for the three explicit real-data baselines', async () => {
  const one = await buildRegistry(files);
  const two = await buildRegistry([...files].reverse());
  assert.deepEqual(one, two);
  assert.deepEqual(
    one.entries.map(
      ({ academicYear, retrievedAt, dataFile, subjectCount }) => ({
        academicYear,
        retrievedAt,
        dataFile,
        subjectCount,
      })
    ),
    [
      {
        academicYear: '2024年度',
        retrievedAt: '2024-04-05',
        dataFile: files[0],
        subjectCount: 12547,
      },
      {
        academicYear: '2025年度',
        retrievedAt: '2025-04-03',
        dataFile: files[1],
        subjectCount: 11989,
      },
      {
        academicYear: '2026年度',
        retrievedAt: '2026-04-07',
        dataFile: files[2],
        subjectCount: 12489,
      },
    ]
  );
  assert.match(one.entries[0].sha256, /^[a-f0-9]{64}$/);
  await validateYearlySubjectBaselines(one);
});

test('rejects duplicate, unsafe, mixed-year, and tampered baselines', async () => {
  const registry = await buildRegistry(files);
  assert.throws(
    () =>
      validateRegistryShape({
        ...registry,
        entries: [registry.entries[0], registry.entries[0]],
      }),
    /ascending|unique|Duplicate/
  );
  await assert.rejects(
    () => buildRegistry(['../subject_details_main_2026-04-07.json']),
    /path traversal/
  );

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'momiji-baselines-'));
  try {
    await Promise.all(
      files.map((file) =>
        fs.copyFile(path.join('data', file), path.join(tempDir, file))
      )
    );
    const tampered = structuredClone(registry);
    tampered.entries[2].sha256 = '0'.repeat(64);
    await assert.rejects(
      () => validateYearlySubjectBaselines(tampered, tempDir),
      /out of date|changed/
    );

    const mixedName = 'subject_details_main_2026-04-08.json';
    await fs.copyFile(
      path.join('data', files[1]),
      path.join(tempDir, mixedName)
    );
    await assert.rejects(
      () => buildRegistry([mixedName], tempDir),
      /does not match filename/
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
