import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "https://yacms-git.dev.lan",
        changeOrigin: true,
        secure: false
      },
      "/repos": {
        target: "https://yacms-git.dev.lan",
        changeOrigin: true,
        secure: false
      },
      "/assets": {
        target: "https://yacms-git.dev.lan",
        changeOrigin: true,
        secure: false
      },
      "/uploads": {
        target: "https://yacms-git.dev.lan",
        changeOrigin: true,
        secure: false
      },
      "/temp": {
        target: "https://yacms-git.dev.lan",
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
