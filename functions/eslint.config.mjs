import nodePlugin from 'eslint-plugin-n';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import stylisticTs from '@stylistic/eslint-plugin';

export default [
  nodePlugin.configs['flat/recommended-module'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      '@typescript-eslint': tsEslint,
      "@stylistic": stylisticTs
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      'n/no-unsupported-features/node-builtins': 'off',
      'prefer-spread': 'error',
      'n/no-missing-import': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'n/no-missing-require': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      'prefer-const': 'error',
      "eqeqeq": ["warn", "always"],
      "no-prototype-builtins": "error",
      "no-redeclare": "error",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/key-spacing": ["error"],
      "@stylistic/semi": "error",
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/member-delimiter-style": ["error", {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
      }],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/no-multi-spaces": ["error"],
      "@stylistic/no-multiple-empty-lines": ["error", {
        max: 2,
        maxEOF: 0,
        maxBOF: 1
      }],
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/no-trailing-spaces": ["error"],
      "@stylistic/max-len": ["error", {
        code: 130,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      }]
    },
  },
  {
    ignores: [
      'lib',
      'node_modules'
    ]
  }
];
