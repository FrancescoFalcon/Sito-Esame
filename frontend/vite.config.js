import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = process.env.VITE_API_TARGET || env.VITE_API_TARGET || 'http://localhost:3000';
  
  console.log(`[Vite Config] Proxying API requests to: ${target}`);

  return {
    plugins: [vue()],
    server: {
      host: true,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
