# Repository Guidelines

## Project Overview

This repository is the HITSZ OSA frontend monorepo. It contains two independently deployed Astro static sites:

- `apps/landing`: the association portal at `www.osa.moe`.
- `apps/mirrors`: the software mirror index and help site at `mirrors.osa.moe`.

Shared brand, theme, layout, and client behavior live in the JIT package `@hitszosa/ui`. MirrorZ documentation is compiled by the framework-neutral `@hitszosa/mirrorz-parser` package. Bun workspaces and Turborepo manage the repository.

## Architecture & Data Flow

```text
content/**
  ├─> apps/landing Astro content collections ─> portal pages and /updates
  └─> apps/mirrors announcement collection
        └─> only entries tagged 镜像站 ─> mirror news links to www.osa.moe

vendor/mirrorz-help + content/mirrors/help-overrides
  └─> @hitszosa/mirrorz-parser
        └─> apps/mirrors/scripts/generate-help.ts
              └─> apps/mirrors/generated/help (ignored)
                    └─> /help/<mirror>/ Astro route and Vue islands

@hitszosa/ui source
  └─> compiled directly by each Astro/Vite build (no standalone UI build)
```

- **Landing content**: `apps/landing/src/content.config.ts` loads formal content from root `content/`. With `MOCK=true`, announcements, events, and articles use `apps/landing/examples/content/`; services and friend links remain formal root content. `src/lib/updates.ts` combines typed updates, filters expired announcements, and sorts pinned entries before date.
- **Mirrors data**: production expects same-origin `/tunasync_status.json` and `/static/res_link.json`; production help-list data comes from `https://mirrors-help.osa.moe/help_list.json`. `MOCK=true` serves/copies fixtures from `apps/mirrors/mock/` without modifying `public/`.
- **Mirror help**: local overrides take precedence over `vendor/mirrorz-help/zdoc/global`. The generator emits MDX, a manifest, and a help list. Do not hand-edit generated help; edit parser inputs or local overrides instead.
- **Shared UI**: `SiteLayout`, `SiteHeader`, `SiteFooter`, `ThemeToggle`, theme initialization, logo metadata, semantic color tokens, and the Tailwind preset belong in `packages/ui` rather than being reimplemented in an app.
- **Upstream boundary**: `vendor/mirrorz-help` is a pinned Git submodule and is not part of the root Bun workspace. Treat it as upstream input; do not apply root formatting or dependency commands inside it.

## Key Directories

- `apps/landing/src/`: portal routes, content schemas, update aggregation, and business components.
- `apps/landing/examples/content/`: mock-only content for responsive development and demo builds.
- `apps/mirrors/src/`: mirror list, download widget, news widget, help route, Vue islands, and client stores.
- `apps/mirrors/scripts/`: help generation and mock-data Astro integration.
- `apps/mirrors/mock/`: tunasync, download, and help-list fixtures used only with `MOCK=true`.
- `apps/mirrors/generated/help/`: generated output; ignored and recreated by `help:generate`.
- `packages/mirrorz-parser/src/`: ZDoc loading, config/input merging, Markdown/MyST compilation, and template runtime.
- `packages/mirrorz-parser/tests/`: Bun tests for parser behavior and all pinned upstream routes.
- `packages/ui/src/`: shared Astro components, theme CSS/tokens, Tailwind preset, client theme logic, and assets.
- `packages/eslint-config/`: shared ESLint flat configuration.
- `content/`: formal announcements, events, articles, services, friend links, and mirror help overrides.
- `vendor/mirrorz-help/`: pinned upstream MirrorZ implementation and documentation source.

## Development Commands

Run commands from `frontend/monorepo` unless noted:

```bash
bun install

# Development
bun run dev                         # Landing and Mirrors through Turbo
bun run dev:landing
bun run dev:mirrors
bun run dev:mock                    # both apps with fixtures/examples
bun run dev:landing:mock
bun run dev:mirrors:mock

# Production and mock builds
bun run build
bun run build:landing
bun run build:mirrors
bun run build:mock
bun run build:landing:mock
bun run build:mirrors:mock

# Quality
bun run check                       # Astro/TypeScript checks plus Sherif
bun run check:packages              # Sherif only
bun run lint
bun run format
bun run format:check
```

Package-specific commands:

```bash
cd apps/mirrors
bun run help:generate
bun run preview

cd ../../packages/mirrorz-parser
bun test
```

Mirrors `dev`, `check`, and `build` scripts run `help:generate` first. Turbo's `build` task also depends on upstream builds, `lint`, and `check`. Production deployments use only `apps/landing/dist/` and `apps/mirrors/dist/`; never deploy mock output or the monorepo root.

## Code Conventions & Common Patterns

- **Formatting**: root Biome uses two spaces, 80-column lines, single quotes, and semicolons as needed. `apps/mirrors/biome.json` overrides JavaScript to always use semicolons. Do not manually format ignored/generated files.
- **Linting**: use the shared flat config in `packages/eslint-config`; app-specific configs add Astro/Vue/browser or Node rules as needed.
- **Astro**: use TypeScript frontmatter, typed props, content collections, and shared `@hitszosa/ui` components. Pages should compose the shared `SiteLayout` instead of adding a second site shell.
- **Vue**: Mirrors uses Vue 3 Composition API and Pinia. Prefer `<script setup lang="ts">`, typed `defineProps`, small domain stores, and `client:load` only for interactive islands.
- **TypeScript**: prefer `const` arrow functions, immutable transformations, explicit domain types, and `Promise.all` for independent async reads. Preserve existing path aliases (`@/*`, `@components/*`, `@generated/*`).
- **Styling**: use Tailwind v4 classes and semantic tokens from `packages/ui/src/tailwind/preset.ts`; avoid a second Tailwind config or ad-hoc CSS. The `hocus` variant is used for paired hover/focus states. Shared CSS needs the UI theme, Tailwind, preset, and `@source` imports.
- **Content**: use schema-defined frontmatter. Formal announcements/events/articles use `title`, `summary`, and `date`; announcements may use `tags`, `level`, `pinned`, `importance`, `expires`, and cover fields. Only `tags` containing `镜像站` appear in Mirrors. Keep publishable content out of `examples/content/`.
- **Landing MDX**: detail routes auto-inject components from `apps/landing/src/components/content`; `RelatedLink` requires `href` and `description`, with an optional `label`.
- **Help overrides**: an existing page may contain only changed `zh.yaml` keys or block files; missing files fall back upstream. A new page needs `zh.yaml` and every declared block. A local `null` input removes an inherited input. Never author generated MDX, manifests, or status data in the override directory.
- **Parser contracts**: ZDoc uses `_` for the title, `block` for block names, and typed `option`, boolean, or text inputs. `{ztmpl}` directives/roles become `CodeBlock`, `CodeInline`, or `GlobalMenu`; invalid directives, inputs, or duplicate/invalid heading IDs should fail compilation rather than silently degrade.
- **Error boundaries**: `MOCK` must be exactly `true` or `false`; invalid values throw. Network-backed mirror stores should preserve loading/error fallbacks and response validation.

## Important Files

- `package.json`: Bun version, workspace globs, dependency catalogs, and root commands.
- `turbo.json`: task dependency graph, `content/**` global dependency, `MOCK` task environment, and build outputs.
- `biome.json`: repository formatting and file-scope rules.
- `apps/landing/astro.config.mjs`: Landing MDX and Tailwind Vite integration.
- `apps/landing/src/content.config.ts`: formal/mock content collection loaders and schemas.
- `apps/landing/src/lib/updates.ts`: typed update aggregation and ordering.
- `apps/mirrors/astro.config.mjs`: MDX, Vue, icon, and conditional mock integration setup.
- `apps/mirrors/scripts/generate-help.ts`: upstream/local help merge and generated route output.
- `apps/mirrors/src/pages/help/[...slug].astro`: generated help manifest route and MDX rendering.
- `apps/mirrors/scripts/mock-data-integration.mjs`: mock endpoint behavior.
- `packages/mirrorz-parser/src/{load,config,input,compile,runtime}.ts`: parser pipeline and template runtime.
- `packages/mirrorz-parser/tests/upstream.test.ts`: compilation coverage for all pinned upstream routes.
- `packages/ui/src/components/SiteLayout.astro`: shared site shell and site-specific metadata/layout modes.
- `packages/ui/src/styles/theme.css` and `packages/ui/src/tailwind/preset.ts`: semantic design tokens and Tailwind utilities.
- `content/mirrors/help-overrides/README.md`: local help override authoring contract.
- `.gitmodules`: upstream MirrorZ submodule location.

## Runtime/Tooling Preferences

- Use **Bun 1.3.14+** and the checked-in `bun.lock`; do not substitute pnpm or npm for root workspace commands.
- The root workspace covers only `apps/*` and `packages/*`. The `vendor/mirrorz-help` submodule has its own package manager and build context; do not include it in root Turbo work.
- Use Astro 6, TypeScript, Tailwind CSS 4, Vue 3, and Pinia according to the package being changed.
- `@hitszosa/ui` is a source-first JIT package with no standalone build task; validate it through `astro check` and an app build.
- `MOCK` is the only active monorepo runtime switch and accepts only `true` or `false`. Never enable it for production deployment.
- Keep `.env`, credentials, tokens, and private keys out of the repository. Production endpoint data is deployment-provided, not committed.

## Testing & QA

- The only automated test suite is the Bun test suite in `packages/mirrorz-parser/tests/`:
  - `input.test.ts`: input type/default conversion.
  - `config.test.ts`: config overlay and null deletion.
  - `load.test.ts`: upstream/local loading and local-only pages.
  - `compile.test.ts`: directives, roles, menus, fences, errors, TOC, and links.
  - `upstream.test.ts`: loads the pinned `vendor/mirrorz-help/src/routes.json` and compiles every upstream route; the vendor submodule and nested `zdoc/global` content must be initialized.
- Run parser tests with `cd packages/mirrorz-parser && bun test`. There is no root test script, no app/UI unit-test suite, no E2E framework, and no configured coverage command.
- `bun run check` runs Astro/TypeScript checks and Sherif; it does not run parser tests. `bun run build` is the static smoke test and is wired by Turbo to run lint/check and dependency builds first.
- For help changes, run parser tests, `cd apps/mirrors && bun run help:generate`, and an appropriate Mirrors check or build. Generated output should be inspected only as verification, not committed.
- For mock-only UI/data changes, exercise the corresponding `*:mock` dev or build command. Verify production behavior without `MOCK=true` when changing deployment paths or endpoint contracts.
- Before dependency or schema changes, use the minimum documented sequence: `bun install`, `bun run check`, `bun run build`, and `bun run format:check`.
