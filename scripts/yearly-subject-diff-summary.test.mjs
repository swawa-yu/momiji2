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
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
