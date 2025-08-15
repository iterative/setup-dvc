/* eslint-disable n/no-unpublished-require */
const { defineConfig, globalIgnores } = require('eslint/config');
const globals = require('globals');
const js = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const neostandard = require('neostandard');

module.exports = defineConfig([
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
