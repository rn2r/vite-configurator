import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser'

export default {
  input: './src/index.ts',
  output: {
    name: 'vite-merge',
    file: './dist/index.js',
    format: 'es',
  },
  plugins: [terser(), typescript()],
}