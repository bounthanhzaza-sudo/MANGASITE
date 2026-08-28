import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // สำคัญมากสำหรับโปรเจกต์ที่แยก Deploy แบบนี้
})