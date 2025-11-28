import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    esModule: true,
    file: 'dist/index.js',
    inlineDynamicImports: true
  },
  plugins: [commonjs(), nodeResolve({ preferBuiltins: true }), json()]
};
