import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    build: {
      assetsInclude: ['**/*.png'],
      copyPublicDir: true
    },
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@poseidon': fileURLToPath(new URL('./Poseidon-Design-System/PoseidonDesignSys', import.meta.url)),
      '@poseidon-components': fileURLToPath(new URL('./Poseidon-Design-System/PoseidonDesignSys/lib/components', import.meta.url)),
      '@poseidon-styles': fileURLToPath(new URL('./Poseidon-Design-System/PoseidonDesignSys/lib/styles', import.meta.url)),
      '@poseidon-assets': fileURLToPath(new URL('./Poseidon-Design-System/PoseidonDesignSys/lib/assets', import.meta.url))
    }
  }
})
