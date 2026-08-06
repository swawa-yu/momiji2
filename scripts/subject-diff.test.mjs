import assert from 'node:assert/strict';
import test from 'node:test';

import fs from 'fs/promises';
import path from 'path';

import {
  compareSubjectData,
  requiredFields,
  serializeSubjectDiff,
} from './subject-diff.mjs';

const record = (code, year, overrides = {}) =>
  Object.fromEntries(
    requiredFields.map((field) => [
      field,
      overrides[field] ??
        (field === '講義コード'
          ? code
          : field === '年度'
            ? year
            : `${field}-${code}`),
    ])
  );

test('reports sorted added, removed, and raw changed fields', () => {
  const result = compareSubjectData(
    {
      z: record('z', '2024年度'),
      gone: record('gone', '2024年度'),
      same: record('same', '2024年度'),
    },
    {
      add: record('add', '2025年度'),
      same: record('same', '2025年度', { メッセージ: 'changed' }),
      z: record('z', '2025年度'),
    }
  );
  assert.deepEqual(result.added, [
    { code: 'add', recordIdentity: '2025年度+add' },
  ]);
  assert.deepEqual(result.removed, [
    { code: 'gone', recordIdentity: '2024年度+gone' },
  ]);
  assert.deepEqual(
    result.changed[0].fields.find((x) => x.field === '年度'),
    { field: '年度', before: '2024年度', after: '2025年度', kind: 'metadata' }
  );
  assert.deepEqual(
    result.changed[0].fields.find((x) => x.field === 'メッセージ'),
    {
      field: 'メッセージ',
      before: 'メッセージ-same',
      after: 'changed',
      kind: 'content',
    }
  );
});

test('is byte-identical across order and preserves raw whitespace and Unicode differences', () => {
  const before = record('x', '2024年度', {
    メッセージ: '',
    その他: 'が',
  });
  const after = Object.fromEntries(
    [...requiredFields]
      .reverse()
      .map((field) => [
        field,
        field === '講義コード'
          ? 'x'
          : field === '年度'
            ? '2025年度'
            : field === 'メッセージ'
              ? '  '
              : before[field],
      ])
  );
  after.その他 = 'か\u3099';
  const one = serializeSubjectDiff({ x: before }, { x: after });
  const two = serializeSubjectDiff(
    { x: Object.fromEntries(Object.entries(before).reverse()) },
    { x: Object.fromEntries(Object.entries(after).reverse()) }
  );
  assert.equal(one, two);
  assert.ok(one.endsWith('\n'));
  assert.deepEqual(
    compareSubjectData({ x: before }, { x: after }).changed[0].fields.map(
      (x) => x.field
    ),
    ['年度', 'メッセージ', 'その他']
  );
  assert.deepEqual(
    compareSubjectData({ x: before }, { x: after }).changed[0].fields.find(
      (x) => x.field === 'その他'
    ),
    { field: 'その他', before: 'が', after: 'か\u3099', kind: 'content' }
  );
});

for (const name of [
  'duplicate lecture-code alias',
  'key/code mismatch',
  'missing field',
  'extra field',
  'non-string field',
  'mixed academic years',
]) {
  test(`rejects ${name}`, () => {
    const good = { x: record('x', '2024年度') };
    const bad = structuredClone(good);
    if (name === 'duplicate lecture-code alias')
      bad.y = record('x', '2024年度');
    if (name === 'key/code mismatch') bad.x['講義コード'] = 'y';
    if (name === 'missing field') delete bad.x['その他'];
    if (name === 'extra field') bad.x.extra = 'x';
    if (name === 'non-string field') bad.x['単位'] = 1;
    if (name === 'mixed academic years') bad.y = record('y', '2025年度');
    assert.throws(() => compareSubjectData(bad, good));
  });
}

test('matches investigated real-data added and removed counts', async () => {
  const root = process.cwd();
  const data = async (file) =>
    JSON.parse(await fs.readFile(path.join(root, 'data', file), 'utf8'));
  const a = await compareSubjectData(
    await data('subject_data_main_2024-04-05.json'),
    await data('subject_details_main_2025-04-03.json')
  );
  const b = await compareSubjectData(
    await data('subject_details_main_2025-04-03.json'),
    await data('subject_details_main_2026-04-07.json')
  );
  assert.equal(a.added.length, 1535);
  assert.equal(a.removed.length, 2093);
  assert.equal(b.added.length, 2130);
  assert.equal(b.removed.length, 1630);
  assert.ok(a.changed.length > 0);
  assert.ok(b.changed.length > 0);
});
