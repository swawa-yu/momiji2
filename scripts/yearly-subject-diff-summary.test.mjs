import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { requiredFields } from './subject-diff.mjs';
import { generateYearlySubjectDiffSummary } from './yearly-subject-diff-summary.mjs';

const record = (code, year, overrides = {}) => Object.fromEntries(requiredFields.map((field) => [
  field, overrides[field] ?? (field === '講義コード' ? code : field === '年度' ? year : `${field}-${code}`),
]));

test('keeps raw changes and excludes metadata-only changes from display counts', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'momiji-summary-'));
  try {
    const files = ['subject_2024-01-01.json', 'subject_2025-01-01.json', 'subject_2026-01-01.json'];
    const data = [
      { same: record('same', '2024年度'), metadata: record('metadata', '2024年度') },
      { same: record('same', '2025年度', { メッセージ: 'new' }), metadata: record('metadata', '2025年度') },
      { same: record('same', '2026年度', { メッセージ: 'newer' }), metadata: record('metadata', '2026年度') },
    ];
    for (let i = 0; i < files.length; i += 1) await fs.writeFile(path.join(dir, files[i]), JSON.stringify(data[i]));
    const registry = { schemaVersion: 1, entries: files.map((dataFile, i) => ({
      academicYear: `${2024 + i}年度`, retrievedAt: `${2024 + i}-01-01`, dataFile,
      sha256: '0'.repeat(64), subjectCount: 2,
    })) };
    // The generator validates real hashes, so construct the registry through its observed bytes.
    const { buildRegistry } = await import('./yearly-subject-baselines.mjs');
    const valid = await buildRegistry(files, dir);
    const registryPath = path.join(dir, 'registry.json');
    const summaryPath = path.join(dir, 'summary.json');
    await fs.writeFile(registryPath, JSON.stringify(valid));
    const summary = await generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath });
    assert.equal(summary.pairs.length, 2);
    assert.equal(summary.pairs[0].raw.counts.changed, 2);
    assert.equal(summary.pairs[0].display.counts.changed, 1);
    assert.equal(summary.pairs[0].display.metadataOnlyChanged, 1);
    assert.equal(summary.pairs[0].raw.fieldChangeCounts['年度'], 2);
    assert.equal(summary.pairs[0].display.fieldChangeCounts['年度'], undefined);
    await fs.writeFile(summaryPath, 'stale\n');
    await assert.rejects(() => generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath, check: true }), /out of date/);
    await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
    await generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath, check: true });

    const gapRegistry = { ...valid, entries: [valid.entries[0], valid.entries[2]] };
    await fs.writeFile(registryPath, JSON.stringify(gapRegistry));
    const beforeGap = await fs.readFile(summaryPath, 'utf8');
    await assert.rejects(
      () => generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath }),
      /consecutive academic years/
    );
    assert.equal(await fs.readFile(summaryPath, 'utf8'), beforeGap);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('adds deterministic warnings, including the strict threshold boundaries', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'momiji-summary-warnings-'));
  try {
    const files = ['subject_2024-01-01.json', 'subject_2025-01-01.json'];
    const baseline = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [
      `base-${i}`, record(`base-${i}`, '2024年度'),
    ]));
    const incoming = Object.fromEntries(Array.from({ length: 90 }, (_, i) => [
      `base-${i}`, record(`base-${i}`, '2025年度'),
    ]));
    // 100 baseline -> 90 incoming: 10% count shift, 0% added, 10% removed, 0% changed.
    await fs.writeFile(path.join(dir, files[0]), JSON.stringify(baseline));
    await fs.writeFile(path.join(dir, files[1]), JSON.stringify(incoming));
    const { buildRegistry } = await import('./yearly-subject-baselines.mjs');
    const registry = await buildRegistry(files, dir);
    const registryPath = path.join(dir, 'registry.json');
    const summaryPath = path.join(dir, 'summary.json');
    await fs.writeFile(registryPath, JSON.stringify(registry));
    const boundary = await generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath });
    assert.deepEqual(boundary.pairs[0].warnings, []);

    const changedIncoming = Object.fromEntries([
      ...Object.entries(incoming),
      ...Array.from({ length: 31 }, (_, i) => [`added-${i}`, record(`added-${i}`, '2025年度')]),
    ]);
    for (const [key, subject] of Object.entries(changedIncoming).slice(0, 81)) subject['授業科目名'] = `${subject['授業科目名']}-changed`;
    await fs.writeFile(path.join(dir, files[1]), JSON.stringify(changedIncoming));
    await fs.writeFile(registryPath, JSON.stringify(await buildRegistry(files, dir)));
    const warnings = await generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath });
    assert.deepEqual(warnings.pairs[0].warnings.map(({ code }) => code), [
      'subject-count-shift', 'added-ratio', 'display-changed-ratio',
    ]);

    const noCommon = Object.fromEntries(Array.from({ length: 90 }, (_, i) => [
      `other-${i}`, record(`other-${i}`, '2025年度'),
    ]));
    await fs.writeFile(path.join(dir, files[1]), JSON.stringify(noCommon));
    await fs.writeFile(registryPath, JSON.stringify(await buildRegistry(files, dir)));
    const noCommonSummary = await generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath });
    assert.deepEqual(noCommonSummary.pairs[0].warnings.map(({ code }) => code), [
      'added-ratio', 'removed-ratio', 'display-changed-ratio',
    ]);
    assert.equal(noCommonSummary.pairs[0].warnings[2].observed, null);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('does not warn at exact added, removed, or display-change thresholds', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'momiji-summary-thresholds-'));
  try {
    const files = ['subject_2024-01-01.json', 'subject_2025-01-01.json'];
    const baseline = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [
      `base-${i}`, record(`base-${i}`, '2024年度'),
    ]));
    const { buildRegistry } = await import('./yearly-subject-baselines.mjs');
    const registryPath = path.join(dir, 'registry.json');
    const summaryPath = path.join(dir, 'summary.json');
    await fs.writeFile(path.join(dir, files[0]), JSON.stringify(baseline));

    const writeAndSummarize = async (incoming) => {
      await fs.writeFile(path.join(dir, files[1]), JSON.stringify(incoming));
      await fs.writeFile(registryPath, JSON.stringify(await buildRegistry(files, dir)));
      return generateYearlySubjectDiffSummary({ registryPath, dataDir: dir, summaryPath });
    };
    const warningCodes = (summary) => summary.pairs[0].warnings.map(({ code }) => code);

    // Added: 25/100 = 0.25 is silent; 26/101 > 0.25 warns.
    const addedAt = Object.fromEntries([
      ...Array.from({ length: 75 }, (_, i) => [`base-${i}`, record(`base-${i}`, '2025年度')]),
      ...Array.from({ length: 25 }, (_, i) => [`added-${i}`, record(`added-${i}`, '2025年度')]),
    ]);
    assert.equal(warningCodes(await writeAndSummarize(addedAt)).includes('added-ratio'), false);
    const addedOver = { ...addedAt, ...Object.fromEntries([
      ['added-over', record('added-over', '2025年度')],
    ]) };
    assert.equal(warningCodes(await writeAndSummarize(addedOver)).includes('added-ratio'), true);

    // Removed: 25/100 = 0.25 is silent; 26/100 > 0.25 warns.
    const removedAt = Object.fromEntries(Array.from({ length: 75 }, (_, i) => [
      `base-${i}`, record(`base-${i}`, '2025年度'),
    ]));
    assert.equal(warningCodes(await writeAndSummarize(removedAt)).includes('removed-ratio'), false);
    const removedOverByOne = Object.fromEntries(Array.from({ length: 74 }, (_, i) => [
      `base-${i}`, record(`base-${i}`, '2025年度'),
    ]));
    assert.equal(warningCodes(await writeAndSummarize(removedOverByOne)).includes('removed-ratio'), true);

    // Display changed: 80/100 = 0.8 is silent; 81/100 > 0.8 warns.
    const displayAt = Object.fromEntries(Array.from({ length: 100 }, (_, i) => [
      `base-${i}`, record(`base-${i}`, '2025年度', i < 80 ? { 授業科目名: `changed-${i}` } : {}),
    ]));
    assert.equal(warningCodes(await writeAndSummarize(displayAt)).includes('display-changed-ratio'), false);
    const displayOver = { ...displayAt, ['base-80']: record('base-80', '2025年度', { 授業科目名: 'changed-80' }) };
    assert.equal(warningCodes(await writeAndSummarize(displayOver)).includes('display-changed-ratio'), true);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
