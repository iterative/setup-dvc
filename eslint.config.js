import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import neostandard from 'neostandard';

export default defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.browser,
        ...globals.commonjs,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
      }
    },
    rules: {
      camelcase: [
        1,
        {
          properties: 'never'
        }
      ],

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ]
    },
    plugins: {
      js
    }
  },
  js.configs.recommended,
  ...neostandard(),
  neostandard.plugins.n.configs['flat/recommended'],
  eslintPluginPrettierRecommended,
  globalIgnores(['assets/', 'dist/', 'node_modules/'])
]);
