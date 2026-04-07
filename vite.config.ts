import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { generateSubjectConstants } from './scripts/generate-subject-constants.mjs'

const jsonFile = path.resolve(__dirname, 'data', 'subjectConstants.json')

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES
    ? "momiji2"
    : "./",
  plugins: [
    react(),
    {
      name: 'subject-constants-generator',
      async buildStart() {
        await generateSubjectConstants()
      },
      configureServer(server) {
        server.watcher.add(jsonFile)
        server.watcher.on('change', async (changed) => {
          if (path.resolve(changed) === jsonFile) {
            await generateSubjectConstants()
            server.ws.send({ type: 'full-reload' })
          }
        })
      },
    },
  ],
})
