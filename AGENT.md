# AGENT.md

## Overview

- Project: `osa-moe-landing-page`
- Site: `https://www.osa.moe`
- Stack: Astro 6, Tailwind CSS v4, pnpm
- Shared UI package: `@hitszosa/ui` via GitHub dependency in `package.json`

## Commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Build: `pnpm build`
- Preview build: `pnpm preview`
- Lint: `pnpm lint`
- Fix lint issues: `pnpm lint:fix`
- Format: `pnpm format`
- Check formatting: `pnpm format:check`

## Code Structure

- `src/pages/index.astro`: landing page content and page-level data
- `src/components/`: reusable Astro components such as `LinkButton` and `Logo`
- `src/layouts/Layout.astro`: page shell and metadata
- `src/styles/global.css`: global Tailwind import and custom CSS
- `public/`: static assets served as-is

## Conventions

- Use `pnpm`, not npm or yarn
- Prefer single quotes and semicolons, matching Biome config
- Keep data in frontmatter and rendering in the template
- Prefer consuming shared logo metadata from `@hitszosa/ui`
- Keep site-specific visuals here; move reusable assets and tokens to `@hitszosa/ui`

## Git Hooks

- `pre-commit` runs `lint-staged`
- Staged Astro/CSS/JS/JSON/TS files are formatted with Biome
- Staged Astro/JS/TS files are auto-fixed with ESLint
