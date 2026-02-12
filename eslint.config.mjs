import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default [
  { ignores: ['node_modules/', 'dist/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.js', 'electron/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        DOMPurify: 'readonly',
        mermaid: 'readonly',
        console: 'readonly',
      },
    },
  },
  {
    files: ['lib/**/*.js'],
    languageOptions: {
      globals: {
        window: 'readonly',
        module: 'readonly',
        console: 'readonly',
      },
    },
  },
  eslintConfigPrettier,
];
