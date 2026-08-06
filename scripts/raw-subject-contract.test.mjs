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
const manifestPath = path.join(root, 'data', 'subjectDataManifest.json');

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

test('2026 data keeps blank category and campus values as valid raw strings', async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const data = JSON.parse(
    await fs.readFile(path.join(root, 'data', manifest.dataFile), 'utf8')
  );
  const result = validateSubjectData(data, manifest);

  assert.equal(result.emptyValueCounts['科目区分'], 17);
  assert.equal(result.emptyValueCounts['開講キャンパス'], 132);
});
