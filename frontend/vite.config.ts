import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8005",
        changeOrigin: true,
        secure: false
      },
      "/repos": {
        target: "http://localhost:8005",
        changeOrigin: true,
        secure: false
      },
      "/assets": {
        target: "http://localhost:8005",
        changeOrigin: true,
        secure: false
      },
      "/uploads": {
        target: "http://localhost:8005",
        changeOrigin: true,
        secure: false
      },
      "/temp": {
        target: "http://localhost:8005",
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
})
