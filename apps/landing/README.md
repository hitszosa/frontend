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

活动 `status`（默认 `未开始`）为手动维护的状态：活动状态变化时手动改为 `进行中` 或 `已结束`，站点以不同颜色的徽章展示。`pinned: true` 或 `importance: important` 均可进入首页展示板；先按置顶、再按日期倒序取三条，首条使用大卡片，其余两条使用小卡片。已结束的课次报道与活动仍按这两个字段参与选择，不因状态被排除；不需推荐时取消置顶并将 `importance` 设为 `normal`。展示板内容仍同时出现在普通动态列表中。

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

正文代码块使用共享的 GitHub Light / Dark 高亮主题，随站点主题切换；行内代码的背景与内边距不应用到代码块内部，长行仅在代码块内横向滚动。

## 系列活动与内容关联

正式系列放在根目录 `content/series/`。本地开发可在 `examples/content/series/` 添加演示系列，仅在 `MOCK=true` 时加载。
系列使用 Markdown / MDX；`title`、`summary`、`start` 必填，`end` 可选且不能早于开始日期。
`status` 手动维护为 `未开始`（默认）、`进行中` 或 `已结束`；`tags` 默认空数组，`hide` 默认 `false`。
系列同样支持 `pinned`（默认 `false`）、`importance`（默认 `normal`）、`cover` 与 `coverAlt`。`cover` 支持相对图片路径、站内绝对路径或 HTTP(S) 地址，用于首页 Banner、系列卡片缩略图及详情顶部最高 320px 的预览。`hideCover` 默认 `false`，设为 `true` 仅隐藏详情页顶部封面，不影响首页 Banner、系列卡片或正文插图；未配置封面的系列卡片使用状态图标。
系列文档本身也是一篇可发布的介绍文章；正文与图片只维护一份，活动列表由关联自动生成。

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

活动可增加 `series`（系列 ID）、`report`（活动报道文章 ID）和 `resources`：

```yaml
series: osa-recruitment-2026
report: 2026/09/recruitment_recap
resources:
  - label: 课件
    href: https://example.org/slides.pdf
```

文章、公告可增加 `series` 或 `event`（活动 ID）。单场内容填写 `event`，自动继承活动所属系列；
系列总预告、总结只填写 `series`。两者同时填写时必须一致。
引用使用 Astro 内容集合生成的 ID（例如 `2026/09/recruitment_recap` 或 `recruitment_2026`）；目录中的 `index.md` / `index.mdx` 不带 `/index` 后缀。系列 ID 为总览文件的相对路径，例如 `linux101/26`。
报道文章的 `event` 如果填写，必须指向引用该文章的活动；系列归属也必须一致。
不存在的引用、冲突的归属、错误的日期范围会导致构建失败，隐藏内容同样接受校验。
资料链接支持 HTTP(S) 地址和以 `/` 开头的站内路径。

一场活动只保留一个活动文件。结束后手动更新状态、标题、摘要与正文；若确有独立报道文章，可在原活动添加 `report`，资料链接通过 `resources` 维护。
未开始或进行中的活动以预告及现场信息为主；已结束且有公开报道时，系列日程使用报道标题、摘要与主入口，原活动预告保留为次要链接。日程日期、地点及资料仍取自活动本身，发布报道不会增加活动场数。
首页、动态列表和 RSS 在已有公开报道后不再重复展示已结束活动的预告，仅保留报道；系列页相关内容也不重复列出日程已展示的报道。关联导航由详情页自动生成。
旧内容可以逐步添加关联字段，没有关联字段的内容仍保持原有行为。

Linux101 统一维护在 `content/series/linux101/26/`：`index.md` 为系列总览，`01/index.mdx`、`02/index.md` 为各讲正文。海报与二维码位于总览的 `assets/`，每讲图片位于该讲的 `assets/`。对应链接为 `/series/linux101/26/`、`/series/linux101/26/01/`、`/series/linux101/26/02/`，课次填写 `series: linux101/26`。加载器将 `系列名/两位年份/两位课次/index.md(x)` 识别为课次，其余文档作为总览；仅总览生成系列卡片，课次进入日程、首页、RSS 与分支动态。预告、课后报道与笔记在同一课次页面维护，保留实际开讲时间，不另建 articles/events 副本或 `report` 关联。

录播使用 MDX 中的 `BilibiliVideo` 组件，传入 `bvid` 和 `title`；播放器保持 16:9、懒加载、不自动播放，并附原站观看链接。第一讲示例位于 `content/series/linux101/26/01/index.mdx`。

隐藏系列不生成页面、卡片、首页条目或 RSS，其公开关联内容仍作为普通动态展示；隐藏活动、文章不生成公开入口。
报道尚未提供或被隐藏时，已结束活动仍展示原活动信息，不产生空白或失效的报道入口。公告过期规则沿用动态页逻辑。
系列状态不会根据当前日期自动变化。

`/updates/` 展示按状态排序的系列卡片，以及默认折叠的系列动态；系列内部按时间倒序排列，不因单篇置顶改变顺序。
系列详情位于 `/series/<id>/`，沿用文章页的 768px 内容容器、正文样式与首尾间距；仅首部保留桌面双栏的系列信息与下一场活动，尾部展示按时间倒序排列的活动日程与关联内容。日程中地点位于日期下方，时间线底部止于最老节点、顶部越过最新节点向上延伸。“下一场活动”及高亮仍选择最近一场未开始的活动，而非倒序列表的第一场。
首页动态与 RSS 平铺展示活动、公告、文章和系列介绍；系列使用 `start` 作为展示与订阅日期，标签为“系列”。首页普通动态仅展示标题，不展示简介，Banner 展示摘要与封面；点击进入现有系列详情页。动态页仍以系列卡片提供介绍入口，不把介绍本身重复插入活动分支，也不新增系列主导航。
