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
| `bun run dev`        | 根目录 `content/`                       | 使用正式内容启动开发服务器 |
| `bun run dev:mock`   | 根目录 `content/` 和 `examples/content/` | 使用示例动态开发页面       |
| `bun run build`      | 根目录 `content/`                       | 使用正式内容构建到 `dist/` |
| `bun run build:mock` | 根目录 `content/` 和 `examples/content/` | 构建包含示例动态的静态站点 |
| `bun run preview`    | `dist/`                                 | 预览最近一次构建结果       |

从 Monorepo 根目录可运行 `bun run dev:landing:mock` 或 `bun run build:landing:mock`。直接运行 `astro dev`、`astro build` 或未设置 `MOCK` 时使用正式内容；`MOCK` 只接受 `true` 或 `false`。

## 内容目录

```text
../../content/
  announcements/          # 两个站点共享的正式公告，使用 Markdown 或 MDX
  events/                 # 正式活动详情，使用 Markdown 或 MDX
  articles/               # 正式文章详情，使用 Markdown 或 MDX
  series/                 # 正式系列介绍，使用 Markdown 或 MDX
  services/               # 正式服务与项目，使用 category 区分
  friend-links/           # 正式友链

examples/content/
  events/                 # 页面开发使用的示例活动
  announcements/          # 页面开发使用的示例公告
  articles/               # 页面开发使用的示例文章
  series/                 # 页面开发使用的示例系列
```

所有正式内容均存放在 Monorepo 根目录 `content/`。公告、活动和文章以同等地位显示在首页和 `/updates` 动态页。

新增正式内容时，在对应目录创建文件：

- 公告（`.md` 或 `.mdx`）：`title`、`summary`、`date`，可选 `tags`、`level`、`pinned`、`importance`、`expires` 和封面；带有 `镜像站` 标签的公告也会显示在 Mirrors；
- 活动（`.md` 或 `.mdx`）：`title`、`summary`、`date`，可选 `type`、`location`、`status`、`pinned`、`importance` 和封面；
- 文章（`.md` 或 `.mdx`）：`title`、`summary`、`date`，可选 `author`、`pinned`、`importance` 和封面；
- 服务与项目（`.md`）：`name`、`description`、`href`，可选 `order`、`category`、`scope`、`status` 和 `since`；
- 友链（`.yaml`）：`name`、`href`，可选 `description`、`logo` 和 `order`。

活动 `status`（默认 `未开始`）为手动维护的状态：活动状态变化时手动改为 `进行中` 或 `已结束`，站点以不同颜色的徽章展示。`importance` 默认为 `normal`，普通内容不需要填写。只有需要进入首页展示板的内容才写 `importance: important`；展示板按日期倒序取最新三条，最新一条使用大卡片，其余两条使用小卡片。已结束的活动不会进入展示板；其余重要内容仍同时出现在普通动态列表中。

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

## 系列活动与内容关联

正式系列放在根目录 `content/series/`。本地开发可在 `examples/content/series/` 添加演示系列，仅在 `MOCK=true` 时加载。
系列使用 Markdown / MDX；`title`、`summary`、`start` 必填，`end` 可选且不能早于开始日期。
`status` 手动维护为 `未开始`（默认）、`进行中` 或 `已结束`；`tags` 默认空数组，`hide` 默认 `false`。
正文只维护系列介绍，活动列表由关联自动生成。

```yaml
---
title: Linux 101 · 2026 秋
summary: 从 Linux 入门到开源协作。
start: 2026-10-12
end: 2026-11-09
status: 未开始
tags: [Linux, 开源, 实践]
---
```

活动可增加 `series`（系列 ID）、`report`（主回顾文章 ID）和 `resources`：

```yaml
series: linux101-2026-autumn
report: linux101-first-review
resources:
  - label: 课件
    href: https://example.org/slides.pdf
```

文章、公告可增加 `series` 或 `event`（活动 ID）。单场内容填写 `event`，自动继承活动所属系列；
系列总预告、总结只填写 `series`。两者同时填写时必须一致。
引用使用内容集合的完整 ID（例如 `2026/09/example/index`），页面 URL 会按现有约定去掉 `/index`。
回顾文章的 `event` 如果填写，必须指向引用该文章的活动；系列归属也必须一致。
不存在的引用、冲突的归属、错误的日期范围会导致构建失败，隐藏内容同样接受校验。
资料链接支持 HTTP(S) 地址和以 `/` 开头的站内路径。

一场活动只保留一个活动文件。结束后手动更新状态，在原活动添加 `report` 与资料链接；
发布回顾文章不会增加活动场数。已作为主回顾展示的文章不会在系列页相关内容中重复出现。
关联导航由详情页自动生成，迁移旧内容时可删除正文中重复的回顾链接。
旧内容可以逐步添加关联字段，没有关联字段的内容仍保持原有行为。

隐藏系列不生成页面或卡片，其公开关联内容仍作为普通动态展示；隐藏活动、文章不生成公开入口。
活动回顾隐藏时，日程主入口退回活动信息。公告过期规则沿用动态页逻辑。
系列状态不会根据当前日期自动变化。

`/updates/` 展示按状态排序的系列卡片，以及默认折叠的系列动态。
系列详情位于 `/series/<id>/`，展示介绍、按时间升序排列的活动日程与关联内容。
首页、RSS 保持活动、公告、文章平铺展示，不推送系列本身，也不新增系列主导航。
