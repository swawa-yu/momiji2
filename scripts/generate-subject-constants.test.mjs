import assert from 'node:assert/strict';
import test from 'node:test';

import {
  deriveSubjectConstants,
  uniqueNonEmptyValues,
} from './generate-subject-constants.mjs';

test('uses first appearance order, removes empty values, and deduplicates', () => {
  assert.deepEqual(
    uniqueNonEmptyValues(['霞', '双方向', '東広島', '', '双方向']),
    ['霞', '双方向', '東広島']
  );
});

test('derives searchable classifications from subject data', () => {
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

  assert.deepEqual(deriveSubjectConstants(data), {
    campuses: ['東広島', '双方向'],
    kamokuKubuns: ['平和科目', '平和共修科目'],
    languages: ['J : 日本語', 'B : 日本語・英語'],
  });
});
