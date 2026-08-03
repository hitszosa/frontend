# @hitszosa/ui

面向 Astro 的 HITSZ OSA 共享 UI 包，提供 OSA logo 资产、Tailwind 主题 token、共享主题样式、客户端主题逻辑，以及可复用的 Astro 组件。

## 工作区依赖

这是 Turborepo Just-in-Time internal package，仅供当前 Bun workspace 使用。应用通过 `workspace:*` 引用，源码由 Astro/Vite 在应用构建时直接编译，不生成或发布独立包产物。

## Astro 接入

在全局样式中引入共享 CSS：

```css
@import 'tailwindcss';
@config '@hitszosa/ui/tailwind/preset';
@source '../../node_modules/@hitszosa/ui/src/components';
@import '@hitszosa/ui/styles/theme.css';
```

`@source` 是 Tailwind CSS v4 必需的配置，因为 `node_modules` 默认不会被扫描。

如果你的全局样式文件不在 `src/styles/` 下，请按实际目录调整相对路径。

## 主题初始化

在根 `<html>` 元素上添加主题配置：

```astro
<html
  lang="zh"
  data-default-theme-mode="system"
  data-theme-storage-key="theme-preference"
>
</html>
```

然后在 layout 的 `<head>` 中引入共享初始化脚本：

```astro
<script>
  import '@hitszosa/ui/client/theme-init'
</script>
```

`data-default-theme-mode` 支持：

- `light`
- `dark`
- `system`

如果省略或填写了无效值，会默认回退到 `system`。

## 组件

```astro
---
import { ThemeToggle } from '@hitszosa/ui'
---

<ThemeToggle size="md" />
```

`ThemeToggle` 支持以下参数：

- `size`: `sm | md | lg`
- `defaultMode`: `light | dark | system`
- `storageKey`: localStorage key
- `class`: 外层包装类名

## 资产

```astro
---
import { osaLogoPub } from '@hitszosa/ui'
---

<img src={osaLogoPub.src} alt={osaLogoPub.alt} />
```

当前可用的 logo metadata 导出：

- `osaLogoDefault`
- `osaLogoMono`
- `osaLogoPub`
- `osaLogoAlt`
- `osaLogoVtuber`
- `osaLogoOld`
- `osaLogo01`

## 导出入口

- `@hitszosa/ui`
- `@hitszosa/ui/client/theme`
- `@hitszosa/ui/client/theme-init`
- `@hitszosa/ui/tailwind/preset`
- `@hitszosa/ui/styles/theme.css`
- `@hitszosa/ui/components/*`
- `@hitszosa/ui/assets/*`

## 开发

在仓库根目录执行：

```bash
bun install --filter @hitszosa/ui
bun run check
bun run lint
bun run format:check
```

UI 没有独立 `build` 任务；修改会在 Landing 或 Mirrors 构建时由应用打包器验证。
