import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

const rawPropertiesPath = new URL(
  '../data/subjectRawProperties.json',
  import.meta.url
);
export const requiredFields = JSON.parse(
  await fs.readFile(rawPropertiesPath, 'utf8')
);
export const metadataFields = ['relative URL', '年度'];
const requiredFieldSet = new Set(requiredFields);
const metadataFieldSet = new Set(metadataFields);

function validateYearData(data, label) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${label} must be a JSON object keyed by lecture code.`);
  }
  const entries = Object.entries(data);
  const years = new Set();
  for (const [code, record] of entries) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw new Error(`${label} subject ${code} must be an object.`);
    }
    const fields = Object.keys(record);
    if (
      fields.length !== requiredFields.length ||
      fields.some((field) => !requiredFieldSet.has(field))
    ) {
      throw new Error(
        `${label} subject ${code} must have exactly the 19 raw fields.`
      );
    }
    for (const field of requiredFields) {
      if (!(field in record))
        throw new Error(`${label} subject ${code} is missing field: ${field}`);
      if (typeof record[field] !== 'string')
        throw new Error(
          `${label} subject ${code} field ${field} must be a string.`
        );
    }
    if (record['講義コード'] !== code) {
      throw new Error(
        `${label} lecture code mismatch: key=${code}, field=${record['講義コード']}`
      );
    }
    years.add(record['年度']);
  }
  if (years.size !== 1 || !/^\d{4}年度$/.test([...years][0] ?? '')) {
    throw new Error(
      `${label} must contain records from exactly one academic year.`
    );
  }
  return { academicYear: [...years][0], records: data };
}

export function compareSubjectData(baseline, incoming) {
  const base = validateYearData(baseline, 'baseline');
  const next = validateYearData(incoming, 'incoming');
  const codes = [
    ...new Set([...Object.keys(base.records), ...Object.keys(next.records)]),
  ].sort();
  const added = [];
  const removed = [];
  const changed = [];
  for (const code of codes) {
    const before = base.records[code];
    const after = next.records[code];
    if (!before) {
      added.push({ code, recordIdentity: `${next.academicYear}+${code}` });
    } else if (!after) {
      removed.push({ code, recordIdentity: `${base.academicYear}+${code}` });
    } else {
      const fields = requiredFields.filter(
        (field) => before[field] !== after[field]
      );
      if (fields.length) {
        changed.push({
          code,
          recordIdentity: {
            baseline: `${base.academicYear}+${code}`,
            incoming: `${next.academicYear}+${code}`,
          },
          fields: fields.map((field) => ({
            field,
            before: before[field],
            after: after[field],
            kind: metadataFieldSet.has(field) ? 'metadata' : 'content',
          })),
        });
      }
    }
  }
  return {
    baseline: {
      academicYear: base.academicYear,
      recordCount: Object.keys(base.records).length,
    },
    incoming: {
      academicYear: next.academicYear,
      recordCount: Object.keys(next.records).length,
    },
    added,
    removed,
    changed,
  };
}

export function serializeSubjectDiff(baseline, incoming) {
  return `${JSON.stringify(compareSubjectData(baseline, incoming), null, 2)}\n`;
}

async function main() {
  if (process.argv.length !== 4)
    throw new Error(
      'Usage: node scripts/subject-diff.mjs BASELINE.json INCOMING.json'
    );
  const [baselineText, incomingText] = await Promise.all([
    fs.readFile(path.resolve(process.argv[2]), 'utf8'),
    fs.readFile(path.resolve(process.argv[3]), 'utf8'),
  ]);
  process.stdout.write(
    serializeSubjectDiff(JSON.parse(baselineText), JSON.parse(incomingText))
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
