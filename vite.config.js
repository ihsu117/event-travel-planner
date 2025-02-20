import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig((mode) => {
  // Load environment variables from both .env.shared and .env.frontend
  const env = loadEnv(mode, process.cwd(), '');

  console.log(process.cwd());

  return {
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
    },
    define: {
      // Merge variables from .env.shared and .env.frontend, preferring frontend if both exist
      'import.meta.env.server_url': JSON.stringify(env.server_url)
    }
  }
});
