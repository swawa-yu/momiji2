import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  deriveSubjectConstants,
  parseAndHashSubjectData,
  uniqueNonEmptyValues,
  validateDepartmentConstants,
} from './generate-subject-constants.mjs';

const root = process.cwd();
const departmentConstants = JSON.parse(
  await fs.readFile(
    path.join(root, 'data', 'department_constants.json'),
    'utf8'
  )
);
const manifest = JSON.parse(
  await fs.readFile(path.join(root, 'data', 'subjectDataManifest.json'), 'utf8')
);
const subjectDataSha256 = createHash('sha256')
  .update(await fs.readFile(path.join(root, 'data', manifest.dataFile)))
  .digest('hex');

function createDepartmentConstants(overrides = {}) {
  return {
    schemaVersion: 1,
    academicYear: manifest.academicYear,
    retrievedAt: manifest.retrievedAt,
    source: manifest.source,
    subjectData: {
      dataFile: manifest.dataFile,
      sha256: subjectDataSha256,
      subjectCount: manifest.subjectCount,
    },
    departments: {
      kaikouBukyokuGakubus: ['学部B', '学部A', '未観測学部'],
      kaikouBukyokuDaigakuins: ['大学院A'],
    },
    ...overrides,
  };
}

function deriveForTest(data, constants = createDepartmentConstants()) {
  return deriveSubjectConstants(data, constants, manifest, subjectDataSha256);
}

test('uses first appearance order, removes empty values, and deduplicates', () => {
  assert.deepEqual(
    uniqueNonEmptyValues(['霞', '双方向', '東広島', '', '双方向']),
    ['霞', '双方向', '東広島']
  );
});

test('parses and hashes the same supplied subject-data bytes', () => {
  const firstBytes = Buffer.from('{"A":{"開講部局":"学部A"}}', 'utf8');
  const secondBytes = Buffer.from('{"A":{"開講部局":"学部B"}}', 'utf8');
  const first = parseAndHashSubjectData(firstBytes);
  const second = parseAndHashSubjectData(secondBytes);

  assert.deepEqual(first.data, { A: { 開講部局: '学部A' } });
  assert.equal(
    first.sha256,
    createHash('sha256').update(firstBytes).digest('hex')
  );
  assert.notEqual(first.sha256, second.sha256);
  assert.deepEqual(second.data, { A: { 開講部局: '学部B' } });
});

test('generates an explicit cache option for active subject data loading', async () => {
  const generated = await fs.readFile(
    path.join(root, 'src', 'subject', 'activeSubjectData.ts'),
    'utf8'
  );

  assert.match(generated, /cache: RequestCache = 'default'/);
  assert.match(generated, /fetch\(subjectDataUrl, \{ cache \}\)/);
});

test('derives searchable classifications from subject data and page-ordered departments', () => {
  const data = {
    A: {
      開講キャンパス: '東広島',
      科目区分: '平和科目',
      使用言語: 'J : 日本語',
    },
    B: {
      開講キャンパス: '双方向',
      科目区分: '平和共修科目',
      使用言語: 'B : 日本語・英語',
    },
    C: {
      開講キャンパス: '',
      科目区分: '',
      使用言語: 'J : 日本語',
    },
  };

  assert.deepEqual(deriveForTest(data), {
    campuses: ['東広島', '双方向'],
    kamokuKubuns: ['平和科目', '平和共修科目'],
    languages: ['J : 日本語', 'B : 日本語・英語'],
    kaikouBukyokuGakubus: [],
    kaikouBukyokuDaigakuins: [],
  });
});

test('keeps the Harvester page order and excludes artifact-only parents', () => {
  const result = deriveForTest(
    {
      A: { 開講部局: '学部A', 開講キャンパス: '', 科目区分: '', 使用言語: '' },
      B: {
        開講部局: '大学院A',
        開講キャンパス: '',
        科目区分: '',
        使用言語: '',
      },
      C: {
        開講部局: '大学院B',
        開講キャンパス: '',
        科目区分: '',
        使用言語: '',
      },
      D: { 開講部局: '学部B', 開講キャンパス: '', 科目区分: '', 使用言語: '' },
    },
    createDepartmentConstants({
      departments: {
        kaikouBukyokuGakubus: ['学部B', '中間親', '学部A'],
        kaikouBukyokuDaigakuins: ['大学院A', '大学院B'],
      },
    })
  );

  assert.deepEqual(result.kaikouBukyokuGakubus, ['学部B', '学部A']);
  assert.deepEqual(result.kaikouBukyokuDaigakuins, ['大学院A', '大学院B']);
});

test('rejects unclassified observed departments in data order', () => {
  assert.throws(
    () =>
      deriveForTest(
        {
          A: { 開講部局: '未分類A' },
          B: { 開講部局: '未分類B' },
        },
        createDepartmentConstants({
          departments: {
            kaikouBukyokuGakubus: ['学部A'],
            kaikouBukyokuDaigakuins: ['大学院A'],
          },
        })
      ),
    /Unclassified observed 開講部局: 未分類A, 未分類B/
  );
});

test('rejects malformed department envelopes', () => {
  class DepartmentConstants {
    schemaVersion = 1;
    academicYear = manifest.academicYear;
    retrievedAt = manifest.retrievedAt;
    source = manifest.source;
    subjectData = { ...createDepartmentConstants().subjectData };
    departments = { ...createDepartmentConstants().departments };
  }
  class DepartmentLists {
    kaikouBukyokuGakubus = ['学部A'];
    kaikouBukyokuDaigakuins = ['大学院A'];
  }

  for (const artifact of [
    {},
    new DepartmentConstants(),
    createDepartmentConstants({ schemaVersion: 2 }),
    createDepartmentConstants({ extra: [] }),
    createDepartmentConstants({
      subjectData: { ...createDepartmentConstants().subjectData, extra: [] },
    }),
    createDepartmentConstants({
      subjectData: {
        ...createDepartmentConstants().subjectData,
        sha256: 'ABC',
      },
    }),
    createDepartmentConstants({ departments: new DepartmentLists() }),
    createDepartmentConstants({
      departments: {
        kaikouBukyokuGakubus: [],
        kaikouBukyokuDaigakuins: ['大学院A'],
      },
    }),
    createDepartmentConstants({
      departments: {
        kaikouBukyokuGakubus: [' '],
        kaikouBukyokuDaigakuins: ['大学院A'],
      },
    }),
    createDepartmentConstants({
      departments: {
        kaikouBukyokuGakubus: ['学部A', '学部A'],
        kaikouBukyokuDaigakuins: ['大学院A'],
      },
    }),
    createDepartmentConstants({
      departments: {
        kaikouBukyokuGakubus: ['共通'],
        kaikouBukyokuDaigakuins: ['共通'],
      },
    }),
  ]) {
    assert.throws(() =>
      validateDepartmentConstants(artifact, manifest, subjectDataSha256)
    );
  }
});

test('rejects envelope metadata or data bindings that differ from the active manifest', () => {
  const cases = [
    [
      createDepartmentConstants({ academicYear: '2025年度' }),
      /academicYear does not match/,
    ],
    [
      createDepartmentConstants({ retrievedAt: '2025-04-03' }),
      /retrievedAt does not match/,
    ],
    [
      createDepartmentConstants({ source: 'https://example.test/' }),
      /source does not match/,
    ],
    [
      createDepartmentConstants({
        subjectData: {
          ...createDepartmentConstants().subjectData,
          dataFile: 'other.json',
        },
      }),
      /subjectData.dataFile does not match/,
    ],
    [
      createDepartmentConstants({
        subjectData: {
          ...createDepartmentConstants().subjectData,
          subjectCount: 1,
        },
      }),
      /subjectData.subjectCount does not match/,
    ],
    [
      createDepartmentConstants({
        subjectData: {
          ...createDepartmentConstants().subjectData,
          sha256: '0'.repeat(64),
        },
      }),
      /subjectData.sha256 does not match active subject data/,
    ],
  ];
  for (const [artifact, message] of cases) {
    assert.throws(
      () => validateDepartmentConstants(artifact, manifest, subjectDataSha256),
      message
    );
  }
});

test('current data classifications agree with the department artifact', async () => {
  const data = JSON.parse(
    await fs.readFile(
      path.join(root, 'data', 'subject_details_main_2026-04-07.json'),
      'utf8'
    )
  );
  const result = deriveSubjectConstants(
    data,
    departmentConstants,
    manifest,
    subjectDataSha256
  );

  const observedDepartments = uniqueNonEmptyValues(
    Object.values(data).map((subject) => subject['開講部局'])
  );
  const classifiedDepartments = new Set([
    ...departmentConstants.departments.kaikouBukyokuGakubus,
    ...departmentConstants.departments.kaikouBukyokuDaigakuins,
  ]);
  assert.deepEqual(
    observedDepartments.filter(
      (department) => !classifiedDepartments.has(department)
    ),
    []
  );
  assert.deepEqual(
    result.kaikouBukyokuGakubus,
    departmentConstants.departments.kaikouBukyokuGakubus.filter((department) =>
      observedDepartments.includes(department)
    )
  );
  assert.deepEqual(
    result.kaikouBukyokuDaigakuins,
    departmentConstants.departments.kaikouBukyokuDaigakuins.filter(
      (department) => observedDepartments.includes(department)
    )
  );
});

test('2025 manifest and data fail the 2026 envelope binding before classification', async () => {
  const data = JSON.parse(
    await fs.readFile(
      path.join(root, 'data', 'subject_details_main_2025-04-03.json'),
      'utf8'
    )
  );

  const manifest2025 = {
    ...manifest,
    dataFile: 'subject_details_main_2025-04-03.json',
    academicYear: '2025年度',
    retrievedAt: '2025-04-03',
    subjectCount: 11989,
  };
  const sha2562025 = createHash('sha256')
    .update(await fs.readFile(path.join(root, 'data', manifest2025.dataFile)))
    .digest('hex');

  assert.throws(
    () =>
      deriveSubjectConstants(
        data,
        departmentConstants,
        manifest2025,
        sha2562025
      ),
    /academicYear does not match subject data manifest/
  );
});
