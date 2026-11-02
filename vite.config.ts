import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // '' on a user site, '/<repo>' on a project site; set by the Pages workflow
  base: `${process.env.BASE_PATH ?? ''}/`,
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600,
  },
})
