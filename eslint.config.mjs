import typescriptEslint from 'typescript-eslint';
import htmlEslint from '@html-eslint/eslint-plugin';

export default typescriptEslint.config(
  {
    files: ['**/*.ts', '**/*.html'],
  },

  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
    },
    languageOptions: {
      parser: typescriptEslint.parser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
      ],
      curly: 'warn',
      eqeqeq: 'warn',
      'no-throw-literal': 'warn',

      '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'arrow-parens': 'warn',
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
          imports: 'always-multiline',
          objects: 'always-multiline',
        },
      ],
      'max-classes-per-file': ['error', 1],
      'max-len': [
        'error',
        {
          code: 140,
          ignorePattern: '^(import|export) \\{[^}]+\\} from',
        },
      ],
      'no-unused-expressions': 'warn',
      quotes: ['error', 'single'],
      semi: 'error',
      'spaced-comment': 'off',
      'padding-line-between-statements': ['error', {blankLine: 'any', prev: '*', next: 'return'}],
    },
  },

  {
    files: ['**/*.html'],
    plugins: {
      '@html-eslint': htmlEslint,
    },
    language: '@html-eslint/html',
    rules: {
      ...htmlEslint.configs['flat/recommended'].rules,
      '@html-eslint/eqeqeq': 'error',
    },
  },
);
