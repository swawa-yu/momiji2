import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

import {
  evaluateUpdateGuard,
  validateUpdateGuardConfig,
} from './update-guard.mjs';

const config = JSON.parse(await fs.readFile('data/updateGuard.json', 'utf8'));
const subject = (code, values = {}) => [
  code,
  {
    開講部局: '部局A',
    科目区分: '科目A',
    開講キャンパス: '東広島',
    使用言語: 'J',
    ...values,
  },
];

test('known 2025 to 2026 change reports value-set analysis without blocking', async () => {
  const baseline = JSON.parse(
    await fs.readFile('data/subject_details_main_2025-04-03.json', 'utf8')
  );
  const incoming = JSON.parse(
    await fs.readFile('data/subject_details_main_2026-04-07.json', 'utf8')
  );
  const report = evaluateUpdateGuard(baseline, incoming, config);
  assert.equal(report.baselineSubjectCount, 11989);
  assert.equal(report.incomingSubjectCount, 12489);
  assert.equal(report.subjectCountDelta, 500);
  assert.equal(report.hardFailures.length, 0);
  assert.equal(report.review.length, 0);
  assert.ok(
    report.analysis.some((item) => item.includes('開講部局 added values'))
  );
  assert.ok(
    report.analysis.some((item) => item.includes('教育学研究科博士課程後期'))
  );
});

test('hard-fails truncation and excessive empty rates', () => {
  const baseline = Object.fromEntries(
    Array.from({ length: 10 }, (_, index) =>
      subject(String(index), {
        開講部局: `部局${index}`,
        科目区分: `科目${index}`,
      })
    )
  );
  const incoming = Object.fromEntries([
    subject('0', {
      開講部局: '',
      科目区分: '',
      開講キャンパス: '',
      使用言語: '',
    }),
  ]);
  const report = evaluateUpdateGuard(baseline, incoming, config);
  assert.ok(
    report.hardFailures.some((item) => item.includes('subject count ratio'))
  );
  assert.ok(report.hardFailures.some((item) => item.includes('empty rate')));
  assert.ok(report.analysis.some((item) => item.includes('unique retention')));
});

test('added and removed values are analysis rather than review', () => {
  const baseline = Object.fromEntries(
    Array.from({ length: 10 }, (_, index) =>
      subject(String(index), { 開講部局: `部局${index}` })
    )
  );
  const incoming = structuredClone(baseline);
  incoming['9']['開講部局'] = '新部局';
  const report = evaluateUpdateGuard(baseline, incoming, config);
  assert.equal(report.hardFailures.length, 0);
  assert.equal(report.review.length, 0);
  assert.ok(report.analysis.some((item) => item.includes('新部局')));
  assert.ok(report.analysis.some((item) => item.includes('部局9')));
});

test('strictly validates versioned config', () => {
  validateUpdateGuardConfig(config);
  assert.throws(() => validateUpdateGuardConfig({ ...config, extra: true }));
  assert.throws(() =>
    validateUpdateGuardConfig({ ...config, reviewEmptyRateMultiplier: -1 })
  );
  assert.throws(() =>
    validateUpdateGuardConfig(Object.assign(Object.create(null), config))
  );
  for (const patch of [
    { hardMinRatio: 0 },
    { hardMinRatio: 1.1 },
    { hardMinRatio: 0.95, reviewMinRatio: 0.9 },
    { reviewMinRatio: 1.1 },
    { reviewMaxRatio: 0.89 },
  ]) {
    assert.throws(() =>
      validateUpdateGuardConfig({
        ...config,
        subjectCount: { ...config.subjectCount, ...patch },
      })
    );
  }
  assert.throws(() =>
    validateUpdateGuardConfig({ ...config, reviewEmptyRateMultiplier: 0.9 })
  );
});

test('value reports are invariant to input key order', () => {
  const baseline = Object.fromEntries([
    subject('b', { 開講部局: '部局B' }),
    subject('a', { 開講部局: '部局A' }),
  ]);
  const incoming = Object.fromEntries([
    subject('a', { 開講部局: '部局A' }),
    subject('b', { 開講部局: '部局C' }),
  ]);
  const reversed = (value) =>
    Object.fromEntries(Object.entries(value).reverse());
  assert.deepEqual(
    evaluateUpdateGuard(baseline, incoming, config).fields,
    evaluateUpdateGuard(reversed(baseline), reversed(incoming), config).fields
  );
});

test('rejects empty or non-plain data at the public evaluator boundary', () => {
  const valid = Object.fromEntries([subject('1')]);
  for (const invalid of [{}, [], Object.assign(Object.create(null), valid)]) {
    assert.throws(
      () => evaluateUpdateGuard(invalid, valid, config),
      /baseline data must be a nonempty plain object/
    );
    assert.throws(
      () => evaluateUpdateGuard(valid, invalid, config),
      /incoming data must be a nonempty plain object/
    );
  }
});
