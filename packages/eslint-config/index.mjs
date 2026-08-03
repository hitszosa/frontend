export const sharedIgnores = [
  '**/dist/**',
  '**/node_modules/**',
  '**/.astro/**',
  '**/.nuxt/**',
  '**/.output/**',
]

export const createAstroConfig = ({
  js,
  astro,
  tsParser,
  tsPlugin,
  globals = {},
}) => [
  {
    ignores: sharedIgnores,
  },
  {
    languageOptions: {
      globals,
    },
  },
  js.configs.recommended,
  ...astro.configs['flat/recommended'],
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-undef': 'off',
    },
  },
]
