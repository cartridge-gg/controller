import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/node/index.ts'],
  outDir: 'dist/node',
  format: ['esm', 'cjs'], 
  target: 'node16', 
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: false, 
  dts: false, 
});