import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

const root = process.cwd();
const defaultManifestPath = path.join(root, 'data', 'subjectDataManifest.json');
const rawPropertiesPath = new URL(
  '../data/subjectRawProperties.json',
  import.meta.url
);
const requiredFieldSet = new Set(
  JSON.parse(await fs.readFile(rawPropertiesPath, 'utf8'))
);

export const requiredFields = [...requiredFieldSet];

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Manifest must be a JSON object.');
  }

  const requiredManifestFields = [
    'dataFile',
    'academicYear',
    'retrievedAt',
    'subjectCount',
    'source',
  ];
  for (const field of requiredManifestFields) {
    if (!(field in manifest)) {
      throw new Error(`Manifest is missing required field: ${field}`);
    }
  }

  if (
    typeof manifest.dataFile !== 'string' ||
    path.basename(manifest.dataFile) !== manifest.dataFile ||
    !/^[A-Za-z0-9._-]+\.json$/.test(manifest.dataFile)
  ) {
    throw new Error('Manifest dataFile must be a JSON filename in data/.');
  }
  if (!/^\d{4}年度$/.test(manifest.academicYear)) {
    throw new Error('Manifest academicYear must use the form YYYY年度.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.retrievedAt)) {
    throw new Error('Manifest retrievedAt must use the form YYYY-MM-DD.');
  }
  if (!Number.isInteger(manifest.subjectCount) || manifest.subjectCount < 1) {
    throw new Error('Manifest subjectCount must be a positive integer.');
  }
  if (
    typeof manifest.source !== 'string' ||
    !manifest.source.startsWith('https://')
  ) {
    throw new Error('Manifest source must be an HTTPS URL.');
  }
  const hasVersion = 'schemaVersion' in manifest;
  const hasStructureReport = 'structureReport' in manifest;
  if (hasVersion || hasStructureReport) {
    if (manifest.schemaVersion !== 1) {
      throw new Error('Manifest schemaVersion must be 1.');
    }
    const binding = manifest.structureReport;
    if (
      !binding ||
      typeof binding !== 'object' ||
      Array.isArray(binding) ||
      Object.keys(binding).sort().join(',') !== 'dataFile,sha256' ||
      typeof binding.dataFile !== 'string' ||
      path.basename(binding.dataFile) !== binding.dataFile ||
      !/^subject_structure_[A-Za-z0-9._-]+\.json$/.test(binding.dataFile) ||
      typeof binding.sha256 !== 'string' ||
      !/^[a-f0-9]{64}$/.test(binding.sha256)
    ) {
      throw new Error(
        'Manifest structureReport must be a valid version 1 binding.'
      );
    }
  }
}

export function validateSubjectData(data, manifest) {
  validateManifest(manifest);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Subject data must be an object keyed by lecture code.');
  }

  const entries = Object.entries(data);
  if (entries.length !== manifest.subjectCount) {
    throw new Error(
      `Subject count mismatch: manifest=${manifest.subjectCount}, actual=${entries.length}`
    );
  }

  const emptyValueCounts = Object.fromEntries(
    requiredFields.map((field) => [field, 0])
  );

  for (const [lectureCode, subject] of entries) {
    if (!subject || typeof subject !== 'object' || Array.isArray(subject)) {
      throw new Error(`Subject ${lectureCode} must be an object.`);
    }

    for (const field of requiredFields) {
      if (!(field in subject)) {
        throw new Error(
          `Subject ${lectureCode} is missing required field: ${field}`
        );
      }
      if (typeof subject[field] !== 'string') {
        throw new Error(
          `Subject ${lectureCode} field ${field} must be a string.`
        );
      }
      if (subject[field] === '') {
        emptyValueCounts[field] += 1;
      }
    }

    for (const field of Object.keys(subject)) {
      if (!requiredFieldSet.has(field)) {
        throw new Error(
          `Subject ${lectureCode} has unexpected field: ${field}`
        );
      }
    }

    if (subject['講義コード'] !== lectureCode) {
      throw new Error(
        `Lecture code mismatch: object key=${lectureCode}, field=${subject['講義コード']}`
      );
    }
    if (subject['年度'] !== manifest.academicYear) {
      throw new Error(
        `Academic year mismatch for ${lectureCode}: expected=${manifest.academicYear}, actual=${subject['年度']}`
      );
    }
  }

  return {
    academicYear: manifest.academicYear,
    retrievedAt: manifest.retrievedAt,
    subjectCount: entries.length,
    emptyValueCounts,
  };
}

export async function loadAndValidateSubjectData(
  manifestPath = defaultManifestPath
) {
  const manifestText = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestText);
  validateManifest(manifest);

  const dataPath = path.join(path.dirname(manifestPath), manifest.dataFile);
  const dataText = await fs.readFile(dataPath, 'utf8');
  const data = JSON.parse(dataText);

  return validateSubjectData(data, manifest);
}

async function main() {
  const manifestPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : defaultManifestPath;
  const result = await loadAndValidateSubjectData(manifestPath);

  console.log(
    `Validated ${result.subjectCount} subjects for ${result.academicYear} (retrieved ${result.retrievedAt}).`
  );

  const nonZeroEmptyCounts = Object.entries(result.emptyValueCounts).filter(
    ([, count]) => count > 0
  );
  if (nonZeroEmptyCounts.length > 0) {
    console.log('Empty values by field:');
    for (const [field, count] of nonZeroEmptyCounts) {
      console.log(`  ${field}: ${count}`);
    }
  }
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
