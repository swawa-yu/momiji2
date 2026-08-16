import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { canonicalSha256 } from './classification-diff.mjs';
import {
  applyHistoryArtifact,
  validateHistoryDataDir,
} from './validate-history-artifacts.mjs';
import { requiredFields } from './validate-subject-data.mjs';

function subject(code, title) {
  return Object.assign(
    Object.fromEntries(requiredFields.map((field) => [field, ''])),
    {
      'relative URL': `2026_AA_${code}.html`,
      年度: '2026年度',
      講義コード: code,
      授業科目名: title,
      開講部局: '部局A',
      科目区分: '科目A',
      開講キャンパス: '東広島',
      使用言語: 'J',
    }
  );
}

const metadata = (data, retrievedAt) => ({
  academicYear: '2026年度',
  retrievedAt,
  subjectCount: Object.keys(data).length,
  canonicalSha256: canonicalSha256(data),
  source: 'https://example.test/syllabus/',
});
const bytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momiji-history-'));
  const dataDir = path.join(root, 'data');
  const historyDir = path.join(dataDir, 'history', '2026');
  await fs.mkdir(historyDir, { recursive: true });
  const base = { 1: subject('1', 'before') };
  const target = {
    1: subject('1', 'after'),
    2: subject('2', 'added'),
  };
  const artifact = {
    schemaVersion: 1,
    base: metadata(base, '2026-04-01'),
    target: metadata(target, '2026-04-02'),
    changes: [
      {
        lectureCode: '1',
        type: 'changed',
        fields: [{ field: '授業科目名', before: 'before', after: 'after' }],
      },
      { lectureCode: '2', type: 'added', after: target['2'] },
    ],
  };
  const artifactBytes = bytes(artifact);
  const classification = {
    schemaVersion: 2,
    comparisonType: 'same-academic-year',
    base: Object.fromEntries(
      Object.entries(artifact.base).filter(([key]) => key !== 'source')
    ),
    target: Object.fromEntries(
      Object.entries(artifact.target).filter(([key]) => key !== 'source')
    ),
    fields: Object.fromEntries(
      ['開講部局', '科目区分', '開講キャンパス', '使用言語'].map((field) => [
        field,
        {
          beforeUniqueCount: 1,
          afterUniqueCount: 1,
          beforeEmptyCount: 0,
          afterEmptyCount: 0,
          beforeEmptyRate: 0,
          afterEmptyRate: 0,
          emptyRateChange: 0,
          added: [],
          removed: [],
          beforeValues: [{ value: base['1'][field], lectureCount: 1 }],
          afterValues: [{ value: target['1'][field], lectureCount: 2 }],
        },
      ])
    ),
  };
  const classificationBytes = bytes(classification);
  const baseFile = 'subject_details_main_2026-04-01_base.json';
  const latestFile = 'subject_details_main_2026-04-02_latest.json';
  const historyFile = 'history_2026-04-01_2026-04-02_fixture.json';
  const classificationFile =
    'classification_2026-04-01_2026-04-02_fixture.json';
  const index = {
    schemaVersion: 1,
    academicYear: '2026年度',
    baseline: {
      dataFile: baseFile,
      retrievedAt: artifact.base.retrievedAt,
      subjectCount: artifact.base.subjectCount,
      canonicalSha256: artifact.base.canonicalSha256,
    },
    latest: {
      dataFile: latestFile,
      retrievedAt: artifact.target.retrievedAt,
      subjectCount: artifact.target.subjectCount,
      canonicalSha256: artifact.target.canonicalSha256,
    },
    artifacts: [{ dataFile: historyFile, sha256: sha256(artifactBytes) }],
    classificationArtifacts: [
      { dataFile: classificationFile, sha256: sha256(classificationBytes) },
    ],
  };
  await Promise.all([
    fs.writeFile(path.join(dataDir, baseFile), JSON.stringify(base)),
    fs.writeFile(path.join(dataDir, latestFile), JSON.stringify(target)),
    fs.writeFile(path.join(historyDir, historyFile), artifactBytes),
    fs.writeFile(
      path.join(historyDir, classificationFile),
      classificationBytes
    ),
    fs.writeFile(path.join(historyDir, 'index.json'), JSON.stringify(index)),
  ]);
  return {
    root,
    dataDir,
    historyDir,
    base,
    target,
    artifact,
    index,
    historyFile,
    classificationFile,
  };
}

test('accepts no installed history', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momiji-no-history-'));
  try {
    assert.deepEqual(await validateHistoryDataDir(root), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('validates forward, reverse, latest, and classification artifacts', async () => {
  const value = await fixture();
  try {
    const reports = await validateHistoryDataDir(value.dataDir);
    assert.deepEqual(reports, [
      {
        academicYear: '2026年度',
        historyArtifactCount: 1,
        classificationArtifactCount: 1,
        latestSha256: canonicalSha256(value.target),
      },
    ]);
    assert.deepEqual(
      applyHistoryArtifact(value.base, value.artifact),
      value.target
    );
    assert.deepEqual(
      applyHistoryArtifact(value.target, value.artifact, true),
      value.base
    );
  } finally {
    await fs.rm(value.root, { recursive: true, force: true });
  }
});

test('rejects tampered, reordered, and unsupported artifacts', async () => {
  for (const mutate of [
    (value) => {
      value.artifact.changes.reverse();
    },
    (value) => {
      value.artifact.schemaVersion = 2;
    },
  ]) {
    const value = await fixture();
    try {
      mutate(value);
      const payload = bytes(value.artifact);
      value.index.artifacts[0].sha256 = sha256(payload);
      await fs.writeFile(
        path.join(value.historyDir, value.historyFile),
        payload
      );
      await fs.writeFile(
        path.join(value.historyDir, 'index.json'),
        JSON.stringify(value.index)
      );
      await assert.rejects(validateHistoryDataDir(value.dataDir));
    } finally {
      await fs.rm(value.root, { recursive: true, force: true });
    }
  }
  const tampered = await fixture();
  try {
    await fs.appendFile(
      path.join(tampered.historyDir, tampered.classificationFile),
      '\n'
    );
    await assert.rejects(
      validateHistoryDataDir(tampered.dataDir),
      /Classification artifact file SHA-256/
    );
  } finally {
    await fs.rm(tampered.root, { recursive: true, force: true });
  }
});

test('rejects path escape and inconsistent classification counts', async () => {
  const escaped = await fixture();
  try {
    escaped.index.artifacts[0].dataFile = '../outside.json';
    await fs.writeFile(
      path.join(escaped.historyDir, 'index.json'),
      JSON.stringify(escaped.index)
    );
    await assert.rejects(
      validateHistoryDataDir(escaped.dataDir),
      /History artifact pointer is invalid/
    );
  } finally {
    await fs.rm(escaped.root, { recursive: true, force: true });
  }

  const inconsistent = await fixture();
  try {
    const classificationPath = path.join(
      inconsistent.historyDir,
      inconsistent.classificationFile
    );
    const classification = JSON.parse(
      await fs.readFile(classificationPath, 'utf8')
    );
    classification.fields['開講部局'].afterValues[0].lectureCount = 999;
    const payload = bytes(classification);
    inconsistent.index.classificationArtifacts[0].sha256 = sha256(payload);
    await fs.writeFile(classificationPath, payload);
    await fs.writeFile(
      path.join(inconsistent.historyDir, 'index.json'),
      JSON.stringify(inconsistent.index)
    );
    await assert.rejects(
      validateHistoryDataDir(inconsistent.dataDir),
      /unique count does not match/
    );
  } finally {
    await fs.rm(inconsistent.root, { recursive: true, force: true });
  }
});

test('rejects classification artifacts with tampered empty rates', async () => {
  const value = await fixture();
  try {
    const classificationPath = path.join(
      value.historyDir,
      value.classificationFile
    );
    const classification = JSON.parse(
      await fs.readFile(classificationPath, 'utf8')
    );
    classification.fields['開講部局'].emptyRateChange = 0.25;
    const payload = bytes(classification);
    value.index.classificationArtifacts[0].sha256 = sha256(payload);
    await fs.writeFile(classificationPath, payload);
    await fs.writeFile(
      path.join(value.historyDir, 'index.json'),
      JSON.stringify(value.index)
    );
    await assert.rejects(
      validateHistoryDataDir(value.dataDir),
      /empty rates do not match/
    );

    classification.fields['開講部局'].emptyRateChange = 0;
    classification.fields['開講部局'].beforeEmptyRate = 1.1;
    const outOfRangePayload = bytes(classification);
    value.index.classificationArtifacts[0].sha256 = sha256(outOfRangePayload);
    await fs.writeFile(classificationPath, outOfRangePayload);
    await fs.writeFile(
      path.join(value.historyDir, 'index.json'),
      JSON.stringify(value.index)
    );
    await assert.rejects(
      validateHistoryDataDir(value.dataDir),
      /Classification 開講部局 contract is invalid/
    );
  } finally {
    await fs.rm(value.root, { recursive: true, force: true });
  }
});
