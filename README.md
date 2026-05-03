# HITSZ OSA 落地页

## 网站地址

[osa.moe](https://www.osa.moe)

## 开发说明

### 前置要求

- Node.js
- bun

### 安装

运行 `bun install` 安装依赖。

### 本地运行

- `bun run dev`：启动 Astro 开发服务器
- `bun run preview`：本地预览生产构建结果

### 构建

运行 `bun run build` 生成静态站点，输出目录为 `dist/`。

### Lint 与格式化

- `bun run lint`：运行 ESLint
- `bun run lint:fix`：自动修复 ESLint 问题
- `bun run format`：使用 Prettier 格式化文件
- `bun run format:check`：检查格式但不修改文件

### 项目结构

- `src/`：页面、组件、布局和样式源码
- `public/`：原样对外提供的静态资源
- `dist/`：本地构建产物
