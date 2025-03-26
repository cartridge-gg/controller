import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/node/index.ts'],
  outDir: 'dist/node',
  format: ['esm', 'cjs'], 
  platform: 'node',
  splitting: false,
  sourcemap: true,
  clean: true, 
  dts: true, 
  "treeshake": {
    "preset": "recommended"
  },
});