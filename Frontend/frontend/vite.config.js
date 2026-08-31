import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // <--- เพิ่มบรรทัดนี้ เพื่อให้เครื่องอื่นในวงแลน (เช่น มือถือ) เข้าถึงได้
    port: 5173, // (ระบุพอร์ตไว้ชัดเจนได้เลยครับ)
    proxy: {
      // เมื่อเรียก /api ในโค้ด จะถูกส่งไปยัง Backend อัตโนมัติ
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      // เมื่อเรียก /uploads จะถูกส่งไปยัง Backend เพื่อดึงรูปภาพ
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})