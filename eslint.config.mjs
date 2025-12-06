import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: ['dist/', 'node_modules/', 'uploads/', 'data/', '**/*.js', '**/*.d.ts']
  },
  ...compat.extends('airbnb-base', 'prettier'),
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier
    },
    rules: {
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'no-console': 'off',
      'no-use-before-define': 'off',
      'no-undef': 'off',
      'no-param-reassign': 'off',
      'no-useless-constructor': 'off',
      'consistent-return': 'off',
      'prettier/prettier': 'error',
      'max-classes-per-file': 'off',
      'class-methods-use-this': 'off',
      'no-underscore-dangle': 'off',
      'no-empty': 'off',
      'no-plusplus': 'off',
      'no-empty-function': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'prefer-destructuring': [
        'error',
        {
          object: true,
          array: false
        }
      ],
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'guard-for-in': 'off',
      'no-useless-escape': 'off',
      'default-case': 'off',
      'no-continue': 'off'
    }
  }
];
