import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { setupMockServer } from './src/mock'

export default defineConfig(({ mode }) => {
  // 加载 .env 中全部变量（含非 VITE_ 前缀），用于开发代理目标
  const env = loadEnv(mode, process.cwd(), '')
  // 开发代理后端地址：默认本机 8000 端口，可在 .env 中通过 PROXY_TARGET 覆盖
  const proxyTarget = env.PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [
      vue(),
      // 开发环境启用 Mock 服务器
      ...(mode === 'development'
        ? [
            {
              name: 'dev-mock',
              configureServer(server: any) {
                setupMockServer(server)
              },
            },
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/health': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  }
})