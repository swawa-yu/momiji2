import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  deriveSubjectConstants,
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

test('uses first appearance order, removes empty values, and deduplicates', () => {
  assert.deepEqual(
    uniqueNonEmptyValues(['霞', '双方向', '東広島', '', '双方向']),
    ['霞', '双方向', '東広島']
  );
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

  assert.deepEqual(
    deriveSubjectConstants(data, {
      kaikouBukyokuGakubus: ['学部B', '学部A', '未観測学部'],
      kaikouBukyokuDaigakuins: ['大学院A'],
    }),
    {
      campuses: ['東広島', '双方向'],
      kamokuKubuns: ['平和科目', '平和共修科目'],
      languages: ['J : 日本語', 'B : 日本語・英語'],
      kaikouBukyokuGakubus: [],
      kaikouBukyokuDaigakuins: [],
    }
  );
});

test('keeps the Harvester page order and excludes artifact-only parents', () => {
  const result = deriveSubjectConstants(
    {
      A: { 開講部局: '学部A', 開講キャンパス: '', 科目区分: '', 使用言語: '' },
      B: {
        開講部局: '大学院A',
        開講キャンパス: '',
        科目区分: '',
        使用言語: '',
      },
      C: { 開講部局: '学部B', 開講キャンパス: '', 科目区分: '', 使用言語: '' },
    },
    {
      kaikouBukyokuGakubus: ['学部B', '中間親', '学部A'],
      kaikouBukyokuDaigakuins: ['大学院A'],
    }
  );

  assert.deepEqual(result.kaikouBukyokuGakubus, ['学部B', '学部A']);
  assert.deepEqual(result.kaikouBukyokuDaigakuins, ['大学院A']);
});

test('rejects unclassified observed departments in data order', () => {
  assert.throws(
    () =>
      deriveSubjectConstants(
        {
          A: { 開講部局: '未分類A' },
          B: { 開講部局: '未分類B' },
        },
        {
          kaikouBukyokuGakubus: ['学部A'],
          kaikouBukyokuDaigakuins: ['大学院A'],
        }
      ),
    /Unclassified observed 開講部局: 未分類A, 未分類B/
  );
});

test('rejects malformed department artifacts', () => {
  class DepartmentConstants {
    kaikouBukyokuGakubus = ['学部A'];
    kaikouBukyokuDaigakuins = ['大学院A'];
  }

  const valid = {
    kaikouBukyokuGakubus: ['学部A'],
    kaikouBukyokuDaigakuins: ['大学院A'],
  };
  for (const artifact of [
    {},
    { kaikouBukyokuGakubus: ['学部A'] },
    new DepartmentConstants(),
    { ...valid, extra: [] },
    { kaikouBukyokuGakubus: [], kaikouBukyokuDaigakuins: ['大学院A'] },
    { kaikouBukyokuGakubus: [' '], kaikouBukyokuDaigakuins: ['大学院A'] },
    { kaikouBukyokuGakubus: [' 学部A'], kaikouBukyokuDaigakuins: ['大学院A'] },
    {
      kaikouBukyokuGakubus: ['学部A', '学部A'],
      kaikouBukyokuDaigakuins: ['大学院A'],
    },
    { kaikouBukyokuGakubus: ['共通'], kaikouBukyokuDaigakuins: ['共通'] },
  ]) {
    assert.throws(() => validateDepartmentConstants(artifact));
  }
});

test('2026 data classifies all observed departments with the 147-candidate artifact', async () => {
  const data = JSON.parse(
    await fs.readFile(
      path.join(root, 'data', 'subject_details_main_2026-04-07.json'),
      'utf8'
    )
  );
  const result = deriveSubjectConstants(data, departmentConstants);

  assert.equal(departmentConstants.kaikouBukyokuGakubus.length, 40);
  assert.equal(departmentConstants.kaikouBukyokuDaigakuins.length, 107);
  assert.equal(result.kaikouBukyokuGakubus.length, 34);
  assert.equal(result.kaikouBukyokuDaigakuins.length, 95);
});

test('2025 data fails rather than classifying a department absent from the 2026 artifact', async () => {
  const data = JSON.parse(
    await fs.readFile(
      path.join(root, 'data', 'subject_details_main_2025-04-03.json'),
      'utf8'
    )
  );

  assert.throws(
    () => deriveSubjectConstants(data, departmentConstants),
    /Unclassified observed 開講部局: 教育学研究科博士課程後期/
  );
});
