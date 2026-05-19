import { defineConfig } from 'vite';

export default defineConfig(() => ({
  base: process.env.GITHUB_ACTIONS ? '/mario/' : '/',
  server: {
    host: true,
    port: 5174
  },
  build: {
    target: 'es2020'
  }
}));
