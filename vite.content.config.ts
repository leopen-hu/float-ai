import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/workjs/background.ts'),
        contentScript: resolve(__dirname, 'src/content-script/contentScript.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
})
