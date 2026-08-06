import assert from 'node:assert/strict';
import test from 'node:test';

import {
  requiredFields,
  validateManifest,
  validateSubjectData,
} from './validate-subject-data.mjs';

function createManifest(subjectCount = 1) {
  return {
    dataFile: 'subject_details_main_2026-04-07.json',
    academicYear: '2026年度',
    retrievedAt: '2026-04-07',
    subjectCount,
    source: 'https://momiji.hiroshima-u.ac.jp/syllabusHtml/',
  };
}

function createSubject(overrides = {}) {
  const subject = Object.fromEntries(
    requiredFields.map((field) => [field, 'value'])
  );
  return {
    ...subject,
    年度: '2026年度',
    講義コード: '10000100',
    ...overrides,
  };
}

test('accepts data matching the manifest and required fields', () => {
  const result = validateSubjectData(
    { 10000100: createSubject() },
    createManifest()
  );

  assert.equal(result.subjectCount, 1);
  assert.equal(result.academicYear, '2026年度');
});

test('rejects a missing required field', () => {
  const subject = createSubject();
  delete subject['授業科目名'];

  assert.throws(
    () => validateSubjectData({ 10000100: subject }, createManifest()),
    /missing required field: 授業科目名/
  );
});

test('rejects a lecture code that differs from its object key', () => {
  assert.throws(
    () =>
      validateSubjectData(
        { 10000100: createSubject({ 講義コード: 'different' }) },
        createManifest()
      ),
    /Lecture code mismatch/
  );
});

test('rejects null and other non-string field values', () => {
  assert.throws(
    () =>
      validateSubjectData(
        { 10000100: createSubject({ 担当教員名: null }) },
        createManifest()
      ),
    /field 担当教員名 must be a string/
  );
});

test('rejects a subject count that differs from the manifest', () => {
  assert.throws(
    () => validateSubjectData({}, createManifest()),
    /Subject count mismatch/
  );
});

test('rejects unsafe data filenames before they are used', () => {
  assert.throws(
    () =>
      validateManifest({
        ...createManifest(),
        dataFile: '../outside.json',
      }),
    /dataFile must be a JSON filename in data/
  );
  assert.throws(
    () =>
      validateManifest({
        ...createManifest(),
        dataFile: "invalid'import.json",
      }),
    /dataFile must be a JSON filename in data/
  );
});
