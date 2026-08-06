import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

import { importHarvesterGeneration } from './import-harvester-generation.mjs';

const execFileAsync = promisify(execFile);

const fields = [
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

function subjectData(year = '2027年度') {
  return {
    10000100: Object.assign(
      Object.fromEntries(fields.map((field) => [field, ''])),
      {
        年度: year,
        開講部局: '学部A',
        講義コード: '10000100',
        授業科目名: 'Test',
        科目区分: '科目A',
        開講キャンパス: '東広島',
        使用言語: 'J',
      }
    ),
  };
}

async function fixture(overrides = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'momiji-import-'));
  const source = path.join(root, 'source');
  const destination = path.join(root, 'destination', 'data');
  await fs.mkdir(source, { recursive: true });
  const dataFile = 'subject_details_main_2027-04-01_deadbeef.json';
  const dataBytes = Buffer.from(JSON.stringify(subjectData()), 'utf8');
  const manifest = {
    dataFile,
    academicYear: '2027年度',
    retrievedAt: '2027-04-01',
    subjectCount: 1,
    source: 'https://example.test/syllabus/',
    ...overrides.manifest,
  };
  const sha256 = createHash('sha256').update(dataBytes).digest('hex');
  const artifact = {
    schemaVersion: 1,
    academicYear: manifest.academicYear,
    retrievedAt: manifest.retrievedAt,
    source: manifest.source,
    subjectData: {
      dataFile: manifest.dataFile,
      sha256,
      subjectCount: manifest.subjectCount,
    },
    departments: {
      kaikouBukyokuGakubus: ['学部A'],
      kaikouBukyokuDaigakuins: ['大学院A'],
    },
    ...overrides.artifact,
  };
  const manifestPath = path.join(source, 'subjectDataManifest.json');
  const departmentsPath = path.join(source, 'department_constants.json');
  await Promise.all([
    fs.writeFile(path.join(source, dataFile), dataBytes),
    fs.writeFile(manifestPath, JSON.stringify(manifest)),
    fs.writeFile(departmentsPath, JSON.stringify(artifact)),
  ]);
  return {
    root,
    source,
    destination,
    dataFile,
    dataBytes,
    manifest,
    artifact,
    manifestPath,
    departmentsPath,
  };
}

async function dispose(value) {
  await fs.rm(value.root, { recursive: true, force: true });
}

async function writeBaseline(value, data) {
  await fs.mkdir(value.destination, { recursive: true });
  const dataFile = 'baseline.json';
  const manifest = {
    dataFile,
    academicYear: '2026年度',
    retrievedAt: '2026-04-01',
    subjectCount: Object.keys(data).length,
    source: value.manifest.source,
  };
  await fs.writeFile(
    path.join(value.destination, dataFile),
    JSON.stringify(data)
  );
  await fs.writeFile(
    path.join(value.destination, 'subjectDataManifest.json'),
    JSON.stringify(manifest)
  );
}

test('imports a fully validated Harvester generation', async () => {
  const value = await fixture();
  try {
    await importHarvesterGeneration({
      manifestPath: value.manifestPath,
      departmentsPath: value.departmentsPath,
      destinationDataDir: value.destination,
    });
    assert.deepEqual(
      await fs.readFile(path.join(value.destination, value.dataFile)),
      value.dataBytes
    );
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(
          path.join(value.destination, 'subjectDataManifest.json'),
          'utf8'
        )
      ),
      value.manifest
    );
  } finally {
    await dispose(value);
  }
});

test('check validates without writing', async () => {
  const value = await fixture();
  try {
    await importHarvesterGeneration({
      manifestPath: value.manifestPath,
      departmentsPath: value.departmentsPath,
      destinationDataDir: value.destination,
      check: true,
    });
    await assert.rejects(fs.access(value.destination));
  } finally {
    await dispose(value);
  }
});

test('CLI check prints a stable no-baseline guard report', async () => {
  const value = await fixture();
  try {
    const { stdout } = await execFileAsync(
      process.execPath,
      [
        'scripts/import-harvester-generation.mjs',
        '--manifest',
        value.manifestPath,
        '--departments',
        value.departmentsPath,
        '--check',
        '--destination-data-dir',
        value.destination,
        '--update-guard',
        path.resolve('data/updateGuard.json'),
      ],
      { cwd: process.cwd() }
    );
    assert.match(stdout, /"info": \[\n {4}"no baseline"/);
    assert.match(stdout, /Validated/);
  } finally {
    await dispose(value);
  }
});

test('review changes require acknowledgement while check remains write-free', async () => {
  const value = await fixture();
  try {
    await writeBaseline(value, subjectData('2026年度'));
    const baselinePath = path.join(value.destination, 'baseline.json');
    const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
    baseline['10000100']['開講部局'] = '旧部局';
    await fs.writeFile(baselinePath, JSON.stringify(baseline));
    const guard = JSON.parse(
      await fs.readFile('data/updateGuard.json', 'utf8')
    );
    guard.fields['開講部局'].hardMinUniqueRetention = 0;
    const guardPath = path.join(value.root, 'updateGuard.json');
    await fs.writeFile(guardPath, JSON.stringify(guard));
    const checked = await importHarvesterGeneration({
      manifestPath: value.manifestPath,
      departmentsPath: value.departmentsPath,
      destinationDataDir: value.destination,
      updateGuardPath: guardPath,
      check: true,
    });
    assert.ok(checked.guardReport.review.length > 0);
    await assert.rejects(
      execFileAsync(
        process.execPath,
        [
          'scripts/import-harvester-generation.mjs',
          '--manifest',
          value.manifestPath,
          '--departments',
          value.departmentsPath,
          '--destination-data-dir',
          value.destination,
          '--update-guard',
          guardPath,
        ],
        { cwd: process.cwd() }
      ),
      (error) =>
        error.code === 1 &&
        /Update guard review required:/.test(error.stderr) &&
        /旧部局/.test(error.stderr)
    );
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
        updateGuardPath: guardPath,
      }),
      /review required/
    );
    await importHarvesterGeneration({
      manifestPath: value.manifestPath,
      departmentsPath: value.departmentsPath,
      destinationDataDir: value.destination,
      updateGuardPath: guardPath,
      acceptReview: true,
    });
  } finally {
    await dispose(value);
  }
});

test('accept-review cannot bypass hard guard failures', async () => {
  const value = await fixture();
  try {
    const baseline = Object.fromEntries(
      Array.from({ length: 10 }, (_, index) => {
        const entry = subjectData('2026年度')['10000100'];
        entry['講義コード'] = String(index);
        return [String(index), entry];
      })
    );
    await writeBaseline(value, baseline);
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
        acceptReview: true,
      }),
      /hard failure/
    );
  } finally {
    await dispose(value);
  }
});

test('existing baseline with missing data aborts unchanged', async () => {
  const value = await fixture();
  try {
    await fs.mkdir(value.destination, { recursive: true });
    const manifest = {
      dataFile: 'missing.json',
      academicYear: '2026年度',
      retrievedAt: '2026-04-01',
      subjectCount: 1,
      source: value.manifest.source,
    };
    const bytes = JSON.stringify(manifest);
    await fs.writeFile(
      path.join(value.destination, 'subjectDataManifest.json'),
      bytes
    );
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
      }),
      /ENOENT/
    );
    assert.equal(
      await fs.readFile(
        path.join(value.destination, 'subjectDataManifest.json'),
        'utf8'
      ),
      bytes
    );
  } finally {
    await dispose(value);
  }
});

test('normal import re-evaluates baseline after taking the lock', async () => {
  const value = await fixture();
  try {
    await writeBaseline(value, subjectData('2026年度'));
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
        afterLock: async () => {
          const baseline = Object.fromEntries(
            Array.from({ length: 10 }, (_, index) => {
              const entry = structuredClone(
                subjectData('2026年度')['10000100']
              );
              entry['講義コード'] = String(index);
              return [String(index), entry];
            })
          );
          await writeBaseline(value, baseline);
        },
      }),
      /hard failure/
    );
    await assert.rejects(
      fs.access(path.join(value.destination, value.dataFile))
    );
  } finally {
    await dispose(value);
  }
});

test('rejects source paths that alias destination files', async () => {
  const value = await fixture();
  try {
    await fs.mkdir(value.destination, { recursive: true });
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.source,
      }),
      /must not alias/
    );
  } finally {
    await dispose(value);
  }
});

test('rejects a destination root symlink that aliases a source file', async (t) => {
  const value = await fixture();
  try {
    const linkedDestination = path.join(value.root, 'linked-data');
    try {
      await fs.symlink(value.source, linkedDestination, 'dir');
    } catch (error) {
      if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) {
        t.skip(`symlink unavailable: ${error.code}`);
        return;
      }
      throw error;
    }
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: linkedDestination,
      }),
      /must not alias/
    );
  } finally {
    await dispose(value);
  }
});

test('rejects artifact metadata and hash mismatches before mutation', async () => {
  for (const artifact of [
    { academicYear: '2026年度' },
    { retrievedAt: '2026-04-01' },
    { source: 'https://other.test/' },
    {
      subjectData: {
        dataFile: 'other.json',
        sha256: '0'.repeat(64),
        subjectCount: 1,
      },
    },
    {
      subjectData: {
        dataFile: 'subject_details_main_2027-04-01_deadbeef.json',
        sha256: '0'.repeat(64),
        subjectCount: 2,
      },
    },
  ]) {
    const value = await fixture({ artifact });
    try {
      await assert.rejects(
        importHarvesterGeneration({
          manifestPath: value.manifestPath,
          departmentsPath: value.departmentsPath,
          destinationDataDir: value.destination,
        })
      );
      await assert.rejects(fs.access(value.destination));
    } finally {
      await dispose(value);
    }
  }
});

test('rejects unsafe manifest dataFile and malformed input JSON', async () => {
  const value = await fixture({ manifest: { dataFile: '../outside.json' } });
  try {
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
      }),
      /dataFile/
    );
  } finally {
    await dispose(value);
  }

  const malformed = await fixture();
  try {
    await fs.writeFile(malformed.departmentsPath, '{');
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: malformed.manifestPath,
        departmentsPath: malformed.departmentsPath,
        destinationDataDir: malformed.destination,
      }),
      /Invalid Harvester department artifact JSON/
    );
  } finally {
    await dispose(malformed);
  }
});

test('rejects a different-byte destination collision without mutation', async () => {
  const value = await fixture();
  try {
    await fs.mkdir(value.destination, { recursive: true });
    await fs.writeFile(
      path.join(value.destination, value.dataFile),
      'different'
    );
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
      }),
      /collision/
    );
    assert.equal(
      await fs.readFile(path.join(value.destination, value.dataFile), 'utf8'),
      'different'
    );
  } finally {
    await dispose(value);
  }
});

test('final manifest failure restores the old department artifact and manifest', async () => {
  const value = await fixture();
  try {
    await writeBaseline(value, subjectData('2026年度'));
    const oldManifest = await fs.readFile(
      path.join(value.destination, 'subjectDataManifest.json'),
      'utf8'
    );
    const oldDepartments = '{"old":"departments"}\n';
    await fs.writeFile(
      path.join(value.destination, 'department_constants.json'),
      oldDepartments
    );
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
        replaceFile: async (filePath, bytes) => {
          if (path.basename(filePath) === 'subjectDataManifest.json')
            throw new Error('injected failure');
          await fs.writeFile(filePath, bytes);
        },
      }),
      /injected failure/
    );
    assert.equal(
      await fs.readFile(
        path.join(value.destination, 'subjectDataManifest.json'),
        'utf8'
      ),
      oldManifest
    );
    assert.equal(
      await fs.readFile(
        path.join(value.destination, 'department_constants.json'),
        'utf8'
      ),
      oldDepartments
    );
    await assert.rejects(
      fs.access(path.join(value.destination, value.dataFile))
    );
  } finally {
    await dispose(value);
  }
});

test('serializes imports with a destination lock', async () => {
  const value = await fixture();
  let allowFirstImport;
  const waitForFirstImport = new Promise((resolve) => {
    allowFirstImport = resolve;
  });
  let enteredDepartmentWrite;
  const entered = new Promise((resolve) => {
    enteredDepartmentWrite = resolve;
  });
  try {
    const first = importHarvesterGeneration({
      manifestPath: value.manifestPath,
      departmentsPath: value.departmentsPath,
      destinationDataDir: value.destination,
      replaceFile: async (filePath, bytes) => {
        if (path.basename(filePath) === 'department_constants.json') {
          enteredDepartmentWrite();
          await waitForFirstImport;
        }
        await fs.writeFile(filePath, bytes);
      },
    });
    await entered;
    await assert.rejects(
      importHarvesterGeneration({
        manifestPath: value.manifestPath,
        departmentsPath: value.departmentsPath,
        destinationDataDir: value.destination,
      }),
      /already locked/
    );
    allowFirstImport();
    await first;
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(
          path.join(value.destination, 'subjectDataManifest.json'),
          'utf8'
        )
      ),
      value.manifest
    );
  } finally {
    allowFirstImport?.();
    await dispose(value);
  }
});
