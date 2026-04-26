# FEAT-011: 深色与浅色主题支持

## 问题

Playground 已有基本的暗色主题切换框架（useThemeStore、Ant Design ConfigProvider），但多个关键区域未正确适配深色主题：

1. **`data-theme` 属性未设置**：CSS 中 `:global([data-theme="dark"])` 选择器无法生效（DslEditor、LivePreview 的暗色覆盖无法触发）
2. **图表引擎无暗色主题预设**：`theme-tokens.ts` 只有浅色默认值（白底、深色文字），无深色变体
3. **图表预览不跟随主题**：ChartPreview / InteractivePreview 未在暗色模式下传递深色 tokens
4. **VRT 模块使用硬编码颜色**：`Vrt.module.css` 的颜色不会随主题变化
5. **全局 body 背景缺失**：切换暗色主题时页面根背景不变

## 目标

1. Playground 整体在暗色/浅色主题间完全切换，无视觉残留
2. 图表引擎提供 `DARK_THEME_TOKENS` 预设，消费者可零成本切换
3. 所有 CSS 模块正确响应主题变化
4. 保持向后兼容，不影响已有 API

## 范围

### 包含
- 设置 `document.documentElement.dataset.theme` 属性（解决 data-theme 失效）
- bi-engine 包：新增 `DARK_THEME_TOKENS` 预设 + 导出
- Playground：ChartPreview / InteractivePreview 适配暗色主题 tokens
- Playground：Vrt.module.css 硬编码颜色改为 CSS 变量
- Playground：全局 body 背景跟随主题
- 验证所有页面（首页、编辑器页、VRT 页）在两种主题下的表现

### 不包含
- 新增主题色自定义 UI（已有 palette 机制）
- ECharts 内置主题替换（已有 palette 机制覆盖）
- 第三方库内部样式的修改（Ant Design / Monaco 已内置支持）
- 系统偏好检测（prefers-color-scheme）— 作为后续增强

## 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| CSS 变量覆盖范围遗漏 | 部分区域在暗色下不可读 | 逐文件审查 + 视觉验证 |
| 图表暗色 token 值不协调 | 图表在暗色背景下视觉不协调 | 参考 ECharts dark theme 标准色值 |
| body 背景闪烁 | 主题切换时出现白屏闪烁 | CSS transition + 内联初始值 |

## 验收标准

1. 切换主题后，所有页面（首页、编辑器、VRT）无白色残留区域
2. 图表在暗色背景下文字可读、背景透明或深色
3. Monaco 编辑器正确切换 vs-dark / light 主题（已实现，仅验证）
4. 代码高亮在暗色模式下使用 Dark token colors（已实现，仅验证）
5. `pnpm build:engine && pnpm test` 全部通过
6. `pnpm dev:playground` 手动验证

## 依赖

- 依赖已有的 `useThemeStore`、`ChartThemeProvider`、Ant Design ConfigProvider
- 无外部新增依赖

## 优先级

P1 — 用户体验增强，不影响核心功能
