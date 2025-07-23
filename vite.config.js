import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0', // ⭐ 외부 접속 허용
    port: 5173, // ⭐ 포트 명시
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // ⭐ 프록시 로깅 추가
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🚨 프록시 에러:', err.message)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 프록시 요청:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 프록시 응답:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
  build: {
    outDir: '../FINZ-Back-End-/src/main/webapp/resources',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`
          }
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  base: "/resources/",
})
