import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  root: 'code',
  publicDir: false,
  build: {
    outDir: '../dist',
  },
  plugins: [
    {
      name: 'copy-static-assets',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'code/nitt.glb'),
          resolve(__dirname, 'dist/nitt.glb')
        );
      },
    },
  ],
});
