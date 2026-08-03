import js from '@eslint/js'
import { createAstroConfig } from '@hitszosa/eslint-config'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import astro from 'eslint-plugin-astro'
import vuePlugin from 'eslint-plugin-vue'
import globals from 'globals'
import vueParser from 'vue-eslint-parser'

export default [
  ...createAstroConfig({
    js,
    astro,
    tsParser,
    tsPlugin,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  }),
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        parser: tsParser,
        sourceType: 'module',
      },
    },
    plugins: {
      vue: vuePlugin,
    },
  },
]
