import summaryJson from '../../data/yearlySubjectDiffSummary.json';

export type YearlyDiffCounts = {
  added: number;
  removed: number;
  changed: number;
};

export type YearlyDiffWarning = {
  code: string;
  message: string;
  observed: number | null;
  threshold: number;
};

export type YearlyDiffPair = {
  baseline: { academicYear: string; retrievedAt: string };
  incoming: { academicYear: string; retrievedAt: string };
  display: {
    counts: YearlyDiffCounts;
    metadataOnlyChanged: number;
    fieldChangeCounts: Record<string, number>;
  };
  warnings: YearlyDiffWarning[];
};

export type YearlyDiffSummary = {
  schemaVersion: 2;
  pairs: YearlyDiffPair[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isCounts(value: unknown): value is YearlyDiffCounts {
  return (
    isRecord(value) &&
    ['added', 'removed', 'changed'].every(
      (key) => typeof value[key] === 'number'
    )
  );
}

function isPair(value: unknown): value is YearlyDiffPair {
  if (
    !isRecord(value) ||
    !isRecord(value.baseline) ||
    !isRecord(value.incoming)
  ) {
    return false;
  }
  const baseline = value.baseline;
  const incoming = value.incoming;
  const display = value.display;
  return (
    typeof baseline.academicYear === 'string' &&
    typeof baseline.retrievedAt === 'string' &&
    typeof incoming.academicYear === 'string' &&
    typeof incoming.retrievedAt === 'string' &&
    isRecord(display) &&
    isCounts(display.counts) &&
    typeof display.metadataOnlyChanged === 'number' &&
    isRecord(display.fieldChangeCounts) &&
    Object.values(display.fieldChangeCounts).every(
      (count) => typeof count === 'number'
    ) &&
    Array.isArray(value.warnings) &&
    value.warnings.every(
      (item) =>
        isRecord(item) &&
        typeof item.code === 'string' &&
        typeof item.message === 'string' &&
        (typeof item.observed === 'number' || item.observed === null) &&
        typeof item.threshold === 'number'
    )
  );
}

function loadSummary(value: unknown): YearlyDiffSummary {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 2 ||
    !Array.isArray(value.pairs) ||
    !value.pairs.every(isPair)
  ) {
    throw new Error('年度間差分概要の形式が不正です。');
  }
  return { schemaVersion: 2, pairs: value.pairs };
}

export const yearlyDiffSummary = loadSummary(summaryJson);
