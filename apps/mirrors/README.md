# mirrors-frontend

## Introduction

This project is the Astro frontend for HITSZ OSA Mirrors.

Current and planned features are listed here: [features-and-roadmap.md](./docs/features-and-roadmap.md).

![showcase](./docs/assets/showcase.png)

## Usage

### Prerequisites

Make sure you have these development tools:

- [Bun](https://bun.sh/) 1.3+
- Visual Studio Code (recommended)

From the repository root, run `bun install --filter @hitszosa/mirrors`.

Now you are ready to go!

### Develop

默认命令不注入本地数据。需要完整的本地运行数据时，使用统一的 `MOCK=true` 模式：

- Monorepo 根目录：`bun run dev:mirrors:mock`
- 当前包目录：`bun run dev:mock`

Mock 模式由 Astro 集成直接响应 `mock/` 中的三个 JSON fixture，不会复制或写入 `public/`。生产模式继续从部署环境提供 `/tunasync_status.json`、`/static/res_link.json`，并从镜像帮助站读取帮助列表。

### Build and Deploy

生产构建执行 `bun run build:mirrors`，输出位于 `apps/mirrors/dist/`。需要可独立预览的 fixture 构建时，执行 `bun run build:mirrors:mock`；Mock JSON 只会写入 `dist/`。

典型验证流程：

1. 在仓库根目录运行 `bun install --filter @hitszosa/mirrors`
2. 运行 `bun run build:mirrors`
3. 部署 `apps/mirrors/dist/`

若要预览最近一次构建，在当前包目录运行 `bun run preview`。`MOCK` 只接受 `true` 或 `false`，生产部署不得设置 `MOCK=true`。

### News content

Mirrors 与 Landing 共用 Monorepo 根目录 `content/announcements/`。只有 frontmatter 的 `tags` 包含 `镜像站` 的公告才会生成 Mirrors 新闻列表和详情页；摘要字段统一使用 `summary`。

## Where to start

Here are some resources that might help you learn how to develop this project:

- Vue 3 Guide: <https://vuejs.org/guide/introduction.html>
- Vue 3 Composition API Reference: <https://vuejs.org/api>
- Astro Docs: <https://docs.astro.build>
- Astro Content Collections Docs: <https://docs.astro.build/en/guides/content-collections/>
- Tailwind CSS Docs: <https://tailwindcss.com/docs/installation>
- Pinia Guide: <https://pinia.vuejs.org/core-concepts>

We use IconPark Outline as the primary icon library. You can find the icons at:

- Icônes: <https://icones.js.org/collection/icon-park-outline>

## Coding conventions

Please refer to [coding-conventions.md](./docs/coding-conventions.md).
