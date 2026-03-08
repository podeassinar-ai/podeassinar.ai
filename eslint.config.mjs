import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

const typescriptRecommended = tseslint.configs['flat/recommended'];

export default [
  {
    ignores: ['.next/**', 'next-env.d.ts', 'node_modules/**', 'supabase/.temp/**'],
  },
  js.configs.recommended,
  ...typescriptRecommended,
  nextPlugin.flatConfig.coreWebVitals,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
