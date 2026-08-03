import js from '@eslint/js';
import { createAstroConfig } from '@hitszosa/eslint-config';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astro from 'eslint-plugin-astro';

export default createAstroConfig({ js, astro, tsParser, tsPlugin });
