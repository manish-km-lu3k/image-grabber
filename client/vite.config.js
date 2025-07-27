import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests starting with /api to your backend server
      '/api': {
        target: 'https://image-grabber-beta.vercel.app',
        changeOrigin: true,
        secure: true, // set to true if using https with valid cert
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
