# Mirror Help Overrides

此目录只保存 OSA 对上游 MirrorZ 文档的本地增量，不复制上游文档树。

目录约定：

```text
help-overrides/
└── <page-id>/
    ├── zh.yaml
    └── <block>.zh.md
```

- 修改现有页面：只放需要覆盖的 `zh.yaml` 或 Markdown block；缺失文件自动回退到 `vendor/mirrorz-help/zdoc/global`。
- 新增页面：创建新的 `<page-id>/zh.yaml`，定义标题、block 和输入；所有声明的 block 必须在同一目录提供。
- `zh.yaml` 按 Parser 规则与上游配置合并；值为 `null` 的 input 会删除上游定义。
- 不在这里维护生成的 MDX、route manifest 或镜像状态数据。

运行 `apps/mirrors` 的 `help:generate`、`dev`、`check` 或 `build` 时，覆盖内容会自动合并到 `apps/mirrors/generated/help/`。
