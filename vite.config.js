import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/mario/' : '/',
  server: {
    host: true,
    port: 5174
  },
  build: {
    target: 'es2020'
  }
}));
