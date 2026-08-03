# HITSZ OSA 落地页

HITSZ OSA 官方门户：[osa.moe](https://www.osa.moe)。项目使用 Astro、MDX 与 Tailwind CSS。

## 前置要求

- Node.js
- Bun

在仓库根目录运行 `bun install --filter @hitszosa/landing`，只安装 Landing 及其内部依赖。

## 开发与构建

默认命令使用正式内容。设置统一开关 `MOCK=true` 后，Landing 使用 `examples/content/` 中的示例内容；Mirrors 同时使用仓库内的 JSON fixtures。

| 命令                 | 内容源              | 用途                       |
| -------------------- | ------------------- | -------------------------- |
| `bun run dev`        | `src/content/`      | 使用正式内容启动开发服务器 |
| `bun run dev:mock`   | `examples/content/` | 使用示例动态开发页面       |
| `bun run build`      | `src/content/`      | 使用正式内容构建到 `dist/` |
| `bun run build:mock` | `examples/content/` | 构建包含示例动态的静态站点 |
| `bun run preview`    | `dist/`             | 预览最近一次构建结果       |

从 Monorepo 根目录可运行 `bun run dev:landing:mock` 或 `bun run build:landing:mock`。直接运行 `astro dev`、`astro build` 或未设置 `MOCK` 时使用正式内容；`MOCK` 只接受 `true` 或 `false`。

## 内容目录

```text
src/content/
  events/                 # 正式活动详情，使用 MDX
  announcements/          # 正式公告详情，使用 MDX
  articles/               # 正式文章详情，使用 MDX
  services/               # 正式服务与项目，使用 category 区分
  friend-links/           # 正式友链

examples/content/
  events/                 # 页面开发使用的示例活动
  announcements/          # 页面开发使用的示例公告
  articles/               # 页面开发使用的示例文章
```

公告、活动和文章分别存放在 `announcements/`、`events/` 和 `articles/`，但都以同等地位显示在首页和 `/updates` 动态页。目录和内容类型只用于组织文件、校验字段和选择详情页版式。

新增正式内容时，在 `src/content/` 对应目录创建 `.mdx` 文件：

- 公告：`title`、`summary`、`date`，可选 `level`、`pinned`、`importance`、`expires` 和封面；
- 活动：`title`、`summary`、`date`，可选 `type`、`location`、`upcoming`、`pinned`、`importance` 和封面；
- 文章：`title`、`summary`、`date`，可选 `author`、`pinned`、`importance` 和封面。

`importance` 默认为 `normal`，普通内容不需要填写。只有需要进入首页展示板的内容才写 `importance: important`；展示板按日期倒序取最新三条，最新一条使用大卡片，其余两条使用小卡片。重要内容仍同时出现在普通动态列表中。

不要把待发布的正式内容写进 `examples/`。示例内容只用于组件开发、响应式检查和演示构建。生产部署应执行 `bun run build`，不得设置 `MOCK=true`。

## MDX 内容组件

详情页可使用 `src/components/content/` 中的 MDX 组件。三个内容类型的详情路由会统一注入这些组件，正文中不需要 `import`。

需要提供相关链接时，在正文需要出现的位置使用：

```mdx
<RelatedLink
  href="https://example.com"
  description="说明这个链接提供什么内容。"
  label="查看资料"
/>
```

`href` 和 `description` 必填，`label` 默认为“打开链接”。外部链接会在新标签页打开，站内链接保持当前标签页。不使用组件时，详情页不会自动生成相关链接区域。

## 代码检查

- `bun run lint`：运行 ESLint
- `bun run lint:fix`：自动修复 ESLint 问题
- `bun run format`：使用 Biome 格式化支持的源码
- `bun run format:check`：使用 Biome 检查格式但不修改文件
