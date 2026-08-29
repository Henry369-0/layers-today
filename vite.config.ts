import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // 相对路径 base：同一构建可部署在任意子路径（GitHub Pages / 对象存储）
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
});
