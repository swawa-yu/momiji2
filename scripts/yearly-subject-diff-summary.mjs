import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { compareSubjectData, metadataFields, requiredFields } from './subject-diff.mjs';
import {
  defaultDataDir,
  defaultRegistryPath,
  validateYearlySubjectBaselines,
} from './yearly-subject-baselines.mjs';

export const defaultSummaryPath = path.join(defaultDataDir, 'yearlySubjectDiffSummary.json');

// Temporary guardrails exceed the current pair maxima (about 4.7%, 17.1%,
// 16.7%, and 68.5%) while catching large parser/year-selection anomalies.
const WARNING_THRESHOLDS = {
  subjectCountShift: 0.1,
  addedRatio: 0.25,
  removedRatio: 0.25,
  displayChangedRatio: 0.8,
};

function warning(code, message, observed, threshold) {
  return { code, message, observed, threshold };
}

function summarizePair(baselineEntry, incomingEntry, baseline, incoming) {
  const diff = compareSubjectData(baseline, incoming);
  const rawFieldChanges = Object.fromEntries(requiredFields.map((field) => [field, 0]));
  const displayFieldChanges = Object.fromEntries(
    requiredFields.filter((field) => !metadataFields.includes(field)).map((field) => [field, 0])
  );
  let metadataOnlyChanged = 0;
  let displayChanged = 0;
  for (const change of diff.changed) {
    const hasContent = change.fields.some(({ kind }) => kind === 'content');
    if (hasContent) displayChanged += 1;
    else metadataOnlyChanged += 1;
    for (const { field, kind } of change.fields) {
      rawFieldChanges[field] += 1;
      if (kind === 'content') displayFieldChanges[field] += 1;
    }
  }
  const added = diff.added.length;
  const removed = diff.removed.length;
  const commonCount = baselineEntry.subjectCount - removed;
  const warnings = [];
  const subjectCountShift = Math.abs(incomingEntry.subjectCount - baselineEntry.subjectCount) / baselineEntry.subjectCount;
  if (subjectCountShift > WARNING_THRESHOLDS.subjectCountShift)
    warnings.push(warning('subject-count-shift', '科目数の変動が閾値を超えています。', subjectCountShift, WARNING_THRESHOLDS.subjectCountShift));
  const addedRatio = added / incomingEntry.subjectCount;
  if (addedRatio > WARNING_THRESHOLDS.addedRatio)
    warnings.push(warning('added-ratio', '追加科目の割合が閾値を超えています。', addedRatio, WARNING_THRESHOLDS.addedRatio));
  const removedRatio = removed / baselineEntry.subjectCount;
  if (removedRatio > WARNING_THRESHOLDS.removedRatio)
    warnings.push(warning('removed-ratio', '削除科目の割合が閾値を超えています。', removedRatio, WARNING_THRESHOLDS.removedRatio));
  const displayChangedRatio = commonCount > 0 ? displayChanged / commonCount : null;
  if (commonCount <= 0 || displayChangedRatio > WARNING_THRESHOLDS.displayChangedRatio)
    warnings.push(warning('display-changed-ratio', '共通科目の内容変更割合が閾値を超えています。', displayChangedRatio, WARNING_THRESHOLDS.displayChangedRatio));
  return {
    baseline: {
      academicYear: baselineEntry.academicYear,
      retrievedAt: baselineEntry.retrievedAt,
      dataFile: baselineEntry.dataFile,
      subjectCount: baselineEntry.subjectCount,
      sha256: baselineEntry.sha256,
    },
    incoming: {
      academicYear: incomingEntry.academicYear,
      retrievedAt: incomingEntry.retrievedAt,
      dataFile: incomingEntry.dataFile,
      subjectCount: incomingEntry.subjectCount,
      sha256: incomingEntry.sha256,
    },
    raw: {
      counts: { added: diff.added.length, removed: diff.removed.length, changed: diff.changed.length },
      fieldChangeCounts: rawFieldChanges,
    },
    display: {
      counts: { added: diff.added.length, removed: diff.removed.length, changed: displayChanged },
      metadataOnlyChanged,
      fieldChangeCounts: displayFieldChanges,
    },
    warnings,
  };
}

export async function generateYearlySubjectDiffSummary({
  registryPath = defaultRegistryPath,
  dataDir = defaultDataDir,
  summaryPath = defaultSummaryPath,
  check = false,
} = {}) {
  const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
  await validateYearlySubjectBaselines(registry, dataDir);
  for (let index = 0; index < registry.entries.length - 1; index += 1) {
    const baselineYear = Number(registry.entries[index].academicYear.slice(0, 4));
    const incomingYear = Number(registry.entries[index + 1].academicYear.slice(0, 4));
    if (incomingYear !== baselineYear + 1)
      throw new Error(
        `Yearly subject diff summary requires consecutive academic years: ${registry.entries[index].academicYear} -> ${registry.entries[index + 1].academicYear}`
      );
  }
  const pairs = [];
  for (let index = 0; index < registry.entries.length - 1; index += 1) {
    const baselineEntry = registry.entries[index];
    const incomingEntry = registry.entries[index + 1];
    const [baseline, incoming] = await Promise.all([
      fs.readFile(path.join(dataDir, baselineEntry.dataFile), 'utf8').then(JSON.parse),
      fs.readFile(path.join(dataDir, incomingEntry.dataFile), 'utf8').then(JSON.parse),
    ]);
    pairs.push(summarizePair(baselineEntry, incomingEntry, baseline, incoming));
  }
  const expected = { schemaVersion: 2, pairs };
  const actual = await fs.readFile(summaryPath, 'utf8').catch((error) => {
    if (check && error.code === 'ENOENT') throw new Error(`Yearly subject diff summary is missing: ${summaryPath}`);
    if (check) throw error;
    return null;
  });
  if (check && actual !== `${JSON.stringify(expected, null, 2)}\n`)
    throw new Error('Yearly subject diff summary is out of date.');
  if (!check) await fs.writeFile(summaryPath, `${JSON.stringify(expected, null, 2)}\n`);
  return expected;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args[0] && args[0] !== '--check')) throw new Error('Usage: node scripts/yearly-subject-diff-summary.mjs [--check]');
  await generateYearlySubjectDiffSummary({ check: args[0] === '--check' });
  console.log(args[0] === '--check' ? 'Yearly subject diff summary is up to date.' : 'Generated data/yearlySubjectDiffSummary.json');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => { console.error(error.message); process.exit(1); });
