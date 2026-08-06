import test from 'node:test';

import assert from 'assert/strict';
import fs from 'fs/promises';
import path from 'path';
import ts from 'typescript';

import {
  requiredFields,
  validateSubjectData,
} from './validate-subject-data.mjs';

const root = process.cwd();
const rawPropertiesJsonPath = path.join(
  root,
  'data',
  'subjectRawProperties.json'
);
const rawPropertiesTsPath = path.join(
  root,
  'src',
  'types',
  'rawSubjectProperties.ts'
);
const subjectDataManifests = [
  {
    academicYear: '2025年度',
    dataFile: 'subject_details_main_2025-04-03.json',
    retrievedAt: '2025-04-03',
    subjectCount: 11989,
    source: 'https://momiji.hiroshima-u.ac.jp/syllabusHtml/',
  },
  {
    academicYear: '2026年度',
    dataFile: 'subject_details_main_2026-04-07.json',
    retrievedAt: '2026-04-07',
    subjectCount: 12489,
    source: 'https://momiji.hiroshima-u.ac.jp/syllabusHtml/',
  },
];

const expectedRawProperties = [
  'relative URL',
  '年度',
  '開講部局',
  '講義コード',
  '科目区分',
  '授業科目名',
  '担当教員名',
  '開講キャンパス',
  '開設期',
  '曜日・時限・講義室',
  '単位',
  '使用言語',
  '学習の段階',
  '対象学生',
  '授業の目標・概要等',
  '予習・復習への アドバイス',
  '履修上の注意 受講条件等',
  'メッセージ',
  'その他',
];

function readGeneratedRawProperties(sourceText) {
  const sourceFile = ts.createSourceFile(
    rawPropertiesTsPath,
    sourceText,
    ts.ScriptTarget.ESNext,
    true
  );
  const declaration = sourceFile.statements.find(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (candidate) =>
          ts.isIdentifier(candidate.name) &&
          candidate.name.text === 'rawSubjectProperties'
      )
  );
  assert.ok(declaration, 'rawSubjectProperties declaration must exist');

  const variableDeclaration = declaration.declarationList.declarations.find(
    (candidate) =>
      ts.isIdentifier(candidate.name) &&
      candidate.name.text === 'rawSubjectProperties'
  );
  assert.ok(variableDeclaration?.initializer, 'initializer must exist');

  const initializer = ts.isAsExpression(variableDeclaration.initializer)
    ? variableDeclaration.initializer.expression
    : variableDeclaration.initializer;
  assert.ok(
    ts.isArrayLiteralExpression(initializer),
    'initializer must be an array'
  );

  return initializer.elements.map((element) => {
    assert.ok(
      ts.isStringLiteral(element),
      'each property must be a string literal'
    );
    return element.text;
  });
}

test('raw properties, TypeScript model, and validator share the 19-field contract', async () => {
  const [jsonText, typeScriptText] = await Promise.all([
    fs.readFile(rawPropertiesJsonPath, 'utf8'),
    fs.readFile(rawPropertiesTsPath, 'utf8'),
  ]);
  const rawProperties = JSON.parse(jsonText);

  assert.deepEqual(rawProperties, expectedRawProperties);
  assert.deepEqual(requiredFields, rawProperties);
  assert.deepEqual(readGeneratedRawProperties(typeScriptText), rawProperties);
  assert.equal(rawProperties.length, 19);
  assert.ok(rawProperties.includes('学習の段階'));
  assert.ok(rawProperties.includes('履修上の注意 受講条件等'));
  assert.ok(!rawProperties.includes('教科書・参考書等'));
  assert.ok(!rawProperties.some((field) => field.includes('\t')));
});

for (const manifest of subjectDataManifests) {
  test(`${manifest.academicYear} data satisfies the complete 19-field contract`, async () => {
    const data = JSON.parse(
      await fs.readFile(path.join(root, 'data', manifest.dataFile), 'utf8')
    );
    const result = validateSubjectData(data, manifest);

    assert.equal(
      result.academicYear,
      manifest.academicYear,
      `${manifest.academicYear}: validator returned the wrong academic year`
    );
    assert.equal(
      result.subjectCount,
      manifest.subjectCount,
      `${manifest.academicYear}: subject count changed`
    );

    for (const [lectureCode, subject] of Object.entries(data)) {
      assert.deepEqual(
        new Set(Object.keys(subject)),
        new Set(expectedRawProperties),
        `${manifest.academicYear}: field contract changed for ${lectureCode}`
      );
    }

    const expectedEmptyCounts =
      manifest.academicYear === '2025年度'
        ? { 科目区分: 19, 開講キャンパス: 90 }
        : { 科目区分: 17, 開講キャンパス: 132 };
    assert.equal(
      result.emptyValueCounts['科目区分'],
      expectedEmptyCounts['科目区分'],
      `${manifest.academicYear}: blank category count changed`
    );
    assert.equal(
      result.emptyValueCounts['開講キャンパス'],
      expectedEmptyCounts['開講キャンパス'],
      `${manifest.academicYear}: blank campus count changed`
    );
  });
}
