const fieldNames = ['開講部局', '科目区分', '開講キャンパス', '使用言語'];

function plain(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
function exact(value, keys) {
  return (
    plain(value) &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}
function finiteNonnegative(value) {
  return Number.isFinite(value) && value >= 0;
}
function unit(value) {
  return finiteNonnegative(value) && value <= 1;
}
const codePointCompare = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

export function validateUpdateGuardConfig(config) {
  if (
    !exact(config, [
      'schemaVersion',
      'subjectCount',
      'fields',
      'reviewEmptyRateMultiplier',
    ]) ||
    config.schemaVersion !== 1
  )
    throw new Error(
      'Update guard config must be an exact schemaVersion 1 object.'
    );
  if (
    !exact(config.subjectCount, [
      'hardMinRatio',
      'reviewMinRatio',
      'reviewMaxRatio',
    ])
  )
    throw new Error('Update guard subjectCount schema is invalid.');
  const { hardMinRatio, reviewMinRatio, reviewMaxRatio } = config.subjectCount;
  if (
    !unit(hardMinRatio) ||
    hardMinRatio <= 0 ||
    !unit(reviewMinRatio) ||
    !finiteNonnegative(reviewMaxRatio) ||
    hardMinRatio > reviewMinRatio ||
    reviewMinRatio > reviewMaxRatio
  )
    throw new Error(
      'Update guard subject-count ratios must satisfy 0 < hardMinRatio <= reviewMinRatio <= reviewMaxRatio.'
    );
  if (!exact(config.fields, fieldNames))
    throw new Error('Update guard fields schema is invalid.');
  for (const field of fieldNames) {
    const rule = config.fields[field];
    if (
      !exact(rule, [
        'hardMaxEmptyRate',
        'hardMinUniqueRetention',
        'reviewAdded',
        'reviewRemoved',
      ])
    )
      throw new Error(`Update guard ${field} schema is invalid.`);
    if (
      !unit(rule.hardMaxEmptyRate) ||
      !unit(rule.hardMinUniqueRetention) ||
      typeof rule.reviewAdded !== 'boolean' ||
      typeof rule.reviewRemoved !== 'boolean'
    )
      throw new Error(`Update guard ${field} values are invalid.`);
  }
  if (
    !finiteNonnegative(config.reviewEmptyRateMultiplier) ||
    config.reviewEmptyRateMultiplier < 1
  )
    throw new Error('Update guard empty-rate multiplier must be at least 1.');
}

function stats(data, field) {
  const values = Object.values(data).map((subject) => subject[field]);
  return {
    unique: [...new Set(values.filter((value) => value !== ''))].sort(
      codePointCompare
    ),
    emptyCount: values.filter((value) => value === '').length,
    count: values.length,
  };
}

function validateGuardData(data, label) {
  if (!plain(data) || Object.keys(data).length === 0) {
    throw new Error(
      `Update guard ${label} data must be a nonempty plain object.`
    );
  }
}

export function evaluateUpdateGuard(baseline, incoming, config) {
  validateUpdateGuardConfig(config);
  validateGuardData(baseline, 'baseline');
  validateGuardData(incoming, 'incoming');
  const baselineCount = Object.keys(baseline).length;
  const incomingCount = Object.keys(incoming).length;
  const ratio = incomingCount / baselineCount;
  const baselineCodes = new Set(Object.keys(baseline));
  const incomingCodes = new Set(Object.keys(incoming));
  const hardFailures = [];
  const review = [];
  const analysis = [];
  if (ratio < config.subjectCount.hardMinRatio)
    hardFailures.push(
      `subject count ratio ${ratio.toFixed(6)} is below ${config.subjectCount.hardMinRatio}`
    );
  else if (
    ratio < config.subjectCount.reviewMinRatio ||
    ratio > config.subjectCount.reviewMaxRatio
  )
    review.push(`subject count ratio ${ratio.toFixed(6)} requires review`);
  const fields = {};
  for (const field of fieldNames) {
    const before = stats(baseline, field),
      after = stats(incoming, field);
    const beforeSet = new Set(before.unique),
      afterSet = new Set(after.unique);
    const added = after.unique
      .filter((value) => !beforeSet.has(value))
      .sort(codePointCompare);
    const removed = before.unique
      .filter((value) => !afterSet.has(value))
      .sort(codePointCompare);
    const retention =
      before.unique.length === 0
        ? 1
        : before.unique.filter((value) => afterSet.has(value)).length /
          before.unique.length;
    const emptyRate = after.emptyCount / after.count;
    const baselineEmptyRate = before.emptyCount / before.count;
    const rule = config.fields[field];
    if (emptyRate > rule.hardMaxEmptyRate)
      hardFailures.push(
        `${field} empty rate ${emptyRate.toFixed(6)} exceeds ${rule.hardMaxEmptyRate}`
      );
    if (retention < rule.hardMinUniqueRetention)
      analysis.push(
        `${field} unique retention ${retention.toFixed(6)} is below ${rule.hardMinUniqueRetention}`
      );
    if (rule.reviewAdded && added.length)
      analysis.push(`${field} added values: ${added.join(', ')}`);
    if (rule.reviewRemoved && removed.length)
      analysis.push(`${field} removed values: ${removed.join(', ')}`);
    if (
      emptyRate > 0 &&
      (baselineEmptyRate === 0 ||
        emptyRate > baselineEmptyRate * config.reviewEmptyRateMultiplier)
    )
      review.push(
        `${field} empty rate increased from ${baselineEmptyRate.toFixed(6)} to ${emptyRate.toFixed(6)}`
      );
    fields[field] = {
      baselineUniqueCount: before.unique.length,
      incomingUniqueCount: after.unique.length,
      retention,
      added,
      removed,
      baselineEmptyCount: before.emptyCount,
      incomingEmptyCount: after.emptyCount,
      baselineEmptyRate,
      incomingEmptyRate: emptyRate,
    };
  }
  return {
    baselineSubjectCount: baselineCount,
    incomingSubjectCount: incomingCount,
    subjectCountDelta: incomingCount - baselineCount,
    subjectCountRatio: ratio,
    lectureCodesAdded: [...incomingCodes].filter(
      (code) => !baselineCodes.has(code)
    ).length,
    lectureCodesRemoved: [...baselineCodes].filter(
      (code) => !incomingCodes.has(code)
    ).length,
    fields,
    analysis,
    hardFailures,
    review,
    info: [],
  };
}
