import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {
  canonicalSha256,
  createClassificationDiff,
  serializeClassificationDiff,
} from './classification-diff.mjs';
import { requiredFields } from './validate-subject-data.mjs';

function subject(code, year, values = {}) {
  return Object.assign(
    Object.fromEntries(requiredFields.map((field) => [field, ''])),
    {
      'relative URL': `${year.slice(0, 4)}_AA_${code}.html`,
      年度: year,
      講義コード: code,
      開講部局: '部局A',
      科目区分: '科目A',
      開講キャンパス: '東広島',
      使用言語: 'J',
    },
    values
  );
}

function manifest(data, year, retrievedAt) {
  return {
    dataFile: `subject_details_main_${retrievedAt}.json`,
    academicYear: year,
    retrievedAt,
    subjectCount: Object.keys(data).length,
    source: 'https://example.test/syllabus/',
  };
}

test('reports deterministic same-year value counts without blocking semantics', () => {
  const baseline = {
    1: subject('1', '2026年度'),
    2: subject('2', '2026年度', { 開講部局: '廃止部局' }),
  };
  const incoming = {
    1: subject('1', '2026年度'),
    3: subject('3', '2026年度', { 開講部局: '新部局' }),
    4: subject('4', '2026年度', { 開講部局: '新部局' }),
  };
  const artifact = createClassificationDiff(
    baseline,
    manifest(baseline, '2026年度', '2026-04-01'),
    incoming,
    manifest(incoming, '2026年度', '2026-04-02')
  );

  assert.equal(artifact.schemaVersion, 2);
  assert.equal(artifact.comparisonType, 'same-academic-year');
  assert.deepEqual(artifact.fields['開講部局'].added, [
    { value: '新部局', lectureCount: 2 },
  ]);
  assert.deepEqual(artifact.fields['開講部局'].removed, [
    { value: '廃止部局', lectureCount: 1 },
  ]);
  assert.equal(artifact.fields['開講部局'].beforeEmptyRate, 0);
  assert.equal(artifact.fields['開講部局'].afterEmptyRate, 0);
  assert.equal(artifact.fields['開講部局'].emptyRateChange, 0);
  assert.deepEqual(artifact.fields['開講部局'].afterValues, [
    { value: '新部局', lectureCount: 2 },
    { value: '部局A', lectureCount: 1 },
  ]);
  assert.equal(artifact.hardFailures, undefined);
  assert.equal(artifact.review, undefined);

  const reversed = Object.fromEntries(Object.entries(incoming).reverse());
  assert.equal(
    serializeClassificationDiff(
      baseline,
      manifest(baseline, '2026年度', '2026-04-01'),
      incoming,
      manifest(incoming, '2026年度', '2026-04-02')
    ),
    serializeClassificationDiff(
      Object.fromEntries(Object.entries(baseline).reverse()),
      manifest(baseline, '2026年度', '2026-04-01'),
      reversed,
      manifest(incoming, '2026年度', '2026-04-02')
    )
  );
});

test('distinguishes academic-year rollover and preserves raw values', () => {
  const baseline = { 1: subject('1', '2026年度') };
  const incoming = {
    1: subject('1', '2027年度', { 開講部局: '新年度部局' }),
  };
  const artifact = createClassificationDiff(
    baseline,
    manifest(baseline, '2026年度', '2026-04-01'),
    incoming,
    manifest(incoming, '2027年度', '2027-04-01')
  );
  assert.equal(artifact.comparisonType, 'academic-year-rollover');
  assert.deepEqual(artifact.fields['開講部局'].added, [
    { value: '新年度部局', lectureCount: 1 },
  ]);
  assert.equal(artifact.fields['開講部局'].emptyRateChange, 0);
});

test('reports empty-rate worsening, improvement, and invariance', () => {
  const baseline = {
    1: subject('1', '2026年度', { 使用言語: '' }),
    2: subject('2', '2026年度'),
  };
  const target = {
    1: subject('1', '2026年度', { 使用言語: '' }),
    2: subject('2', '2026年度', { 使用言語: '' }),
  };
  const improved = {
    1: subject('1', '2026年度'),
    2: subject('2', '2026年度'),
  };
  const worsening = createClassificationDiff(
    baseline,
    manifest(baseline, '2026年度', '2026-04-01'),
    target,
    manifest(target, '2026年度', '2026-04-02')
  ).fields['使用言語'];
  const improvement = createClassificationDiff(
    baseline,
    manifest(baseline, '2026年度', '2026-04-01'),
    improved,
    manifest(improved, '2026年度', '2026-04-02')
  ).fields['使用言語'];
  assert.equal(worsening.emptyRateChange, 0.5);
  assert.equal(improvement.emptyRateChange, -0.5);
  assert.equal(
    createClassificationDiff(
      baseline,
      manifest(target, '2026年度', '2026-04-02'),
      baseline,
      manifest(baseline, '2026年度', '2026-04-03')
    ).fields['使用言語'].emptyRateChange,
    0
  );
});

test('matches canonical SHA-256 and real yearly classification counts', async () => {
  const [baseline, incoming] = await Promise.all([
    fs
      .readFile('data/subject_details_main_2025-04-03.json', 'utf8')
      .then(JSON.parse),
    fs
      .readFile('data/subject_details_main_2026-04-07.json', 'utf8')
      .then(JSON.parse),
  ]);
  const artifact = createClassificationDiff(
    baseline,
    manifest(baseline, '2025年度', '2025-04-03'),
    incoming,
    manifest(incoming, '2026年度', '2026-04-07')
  );

  assert.equal(artifact.base.canonicalSha256, canonicalSha256(baseline));
  assert.equal(artifact.target.canonicalSha256, canonicalSha256(incoming));
  assert.equal(artifact.fields['開講部局'].beforeUniqueCount, 115);
  assert.equal(artifact.fields['開講部局'].afterUniqueCount, 129);
  for (const field of [
    '開講部局',
    '科目区分',
    '開講キャンパス',
    '使用言語',
  ]) {
    const value = artifact.fields[field];
    assert.equal(
      value.beforeEmptyRate,
      value.beforeEmptyCount / Object.keys(baseline).length
    );
    assert.equal(
      value.afterEmptyRate,
      value.afterEmptyCount / Object.keys(incoming).length
    );
    assert.equal(
      value.emptyRateChange,
      value.afterEmptyCount / Object.keys(incoming).length -
        value.beforeEmptyCount / Object.keys(baseline).length
    );
  }
  assert.ok(
    artifact.fields['開講部局'].added.some(
      ({ value, lectureCount }) =>
        value === 'スマートソサイエティ実践科学研究院博士課程前期' &&
        lectureCount === 29
    )
  );
});

test('rejects malformed data and ambiguous same-date changes', () => {
  const baseline = { 1: subject('1', '2026年度') };
  const incoming = {
    1: subject('1', '2026年度', { 開講部局: '変更' }),
  };
  assert.throws(
    () =>
      createClassificationDiff(
        baseline,
        manifest(baseline, '2026年度', '2026-04-01'),
        incoming,
        manifest(incoming, '2026年度', '2026-04-01')
      ),
    /distinct retrievedAt/
  );
  const broken = structuredClone(baseline);
  delete broken['1']['科目区分'];
  assert.throws(
    () =>
      createClassificationDiff(
        broken,
        manifest(broken, '2026年度', '2026-04-01'),
        incoming,
        manifest(incoming, '2026年度', '2026-04-02')
      ),
    /missing required field/
  );
});
