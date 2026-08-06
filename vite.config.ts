import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

import { generateSubjectConstants } from './scripts/generate-subject-constants.mjs';
import { validateManifest } from './scripts/validate-subject-data.mjs';

const jsonFile = path.resolve(__dirname, 'data', 'subjectConstants.json');
const departmentConstantsFile = path.resolve(
  __dirname,
  'data',
  'department_constants.json'
);
const manifestFile = path.resolve(
  __dirname,
  'data',
  'subjectDataManifest.json'
);

function getActiveDataFile() {
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  validateManifest(manifest);
  return path.resolve(__dirname, 'data', manifest.dataFile);
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const watchedSourceFiles = new Set([
    jsonFile,
    departmentConstantsFile,
    manifestFile,
    getActiveDataFile(),
  ]);

  return {
    base: process.env.GITHUB_PAGES ? 'momiji2' : './',
    plugins: [
      react(),
      {
        name: 'subject-constants-generator',
        async buildStart() {
          await generateSubjectConstants({ check: command === 'build' });
        },
        configureServer(server) {
          server.watcher.add([...watchedSourceFiles]);
          const regenerateForSourceChange = async (changed: string) => {
            const resolvedChanged = path.resolve(changed);
            if (!watchedSourceFiles.has(resolvedChanged)) {
              return;
            }

            try {
              if (resolvedChanged === manifestFile) {
                const activeDataFile = getActiveDataFile();
                watchedSourceFiles.add(activeDataFile);
                server.watcher.add(activeDataFile);
              }
              await generateSubjectConstants();
              server.ws.send({ type: 'full-reload' });
            } catch (error) {
              server.config.logger.error(
                `Subject data generation failed: ${error.message}`
              );
            }
          };
          server.watcher.on('change', regenerateForSourceChange);
          server.watcher.on('add', regenerateForSourceChange);
        },
      },
    ],
  };
});
