---
id: FEAT-021
title: Markdown通用组件
type: feature
priority: P0
depends_on: [FEAT-003, FEAT-017]
---

# 提案

## 问题

- 项目内缺乏统一的 Markdown 轻量文本编辑与渲染能力，备注说明、内容描述等场景只能依赖纯文本组件或外部富文本编辑器
- 现有 `text` 组件仅支持纯文本展示与编辑，无法解析和渲染 Markdown 格式化语法
- 权威模型已定义 `MarkdownComponent` 和 `MarkdownDataProperty`，但当前以 `unsupportedHandler` 占位，未实际实现

## 目标

- 在统一组件渲染平台中实现 `markdown` 类型组件处理器，完整支持标准 Markdown 常用语法渲染
- 支持只读渲染和编辑双模式切换，通过平台 `RenderMode` 控制状态
- 数据源统一为 `MarkdownDataProperty.content`，双模式共用同一数据源，状态切换数据实时同步

## 范围内

- `markdown` handler 完整管线实现：validator / normalizer / resolver / modelBuilder / renderer
- 只读模式：Markdown 原始文本 → 格式化渲染展示（标题、加粗、斜体、列表、引用、分割线、行内代码、链接等）
- 编辑模式：原生 textarea 展示原始 Markdown 源码，支持输入、删除、复制、粘贴、换行
- 双模式共用 `MarkdownDataProperty.content`，onChange 回调同步数据
- 统一 CSS 样式覆盖，保证渲染结果视觉一致
- 自适应容器宽度，支持嵌入表单、弹窗、详情卡片等多类业务容器
- playground 演示页面

## 范围外

- 图片语法支持（`![]()`）
- 表格语法支持
- 代码块语法高亮
- 自定义 Markdown 解析器扩展（后续可扩展）
- 语法白名单配置（后续预留）

## 风险

- Markdown 解析库选择需轻量、无外部运行时依赖，避免增大包体积
- XSS 风险：用户输入的 Markdown 可能包含恶意 HTML，需要做安全过滤
- 大文本性能：超长 Markdown 文本渲染可能导致性能问题，需做兼容处理

## 待确认问题

- 无
