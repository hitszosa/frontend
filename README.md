# HITSZ OSA - Landing Page

## Website

[osa.moe](https://www.osa.moe)

## Development Guide

### Prerequisites

- Node.js
- pnpm

### Set up

1. Use command `pnpm install` to install dependencies.
2. You're up!

_Recommended IDE: WebStorm_

### Deploy

Use `pnpm build` to generate the static site. The built output is in `dist/`.
Everything in the `main` branch will be built and deployed to production by Netlify, and every PR will trigger a preview deployment.

### Run locally

- `pnpm dev`: start the Astro development server
- `pnpm preview`: preview the production build locally

### Build

Use command `pnpm build` to build. The built product is in directory `dist`.

### Lint and format

- `pnpm lint`: run ESLint
- `pnpm lint:fix`: auto-fix ESLint issues
- `pnpm format`: format files with Prettier
- `pnpm format:check`: verify formatting without changing files

### Project structure

- `src/`: Source code for pages, components, layouts, and styles.
- `public/`: Static files served as-is.
- `dist/`: Locally built output.
