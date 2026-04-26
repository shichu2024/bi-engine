# FEAT-011 Tasks

## T-001: 设置 data-theme 属性同步

**story**: ST-001
**depends_on**: []

### 目标
在 App.tsx 中添加 useEffect，当 theme mode 变化时同步 `document.documentElement.dataset.theme`。

### write_paths
- `apps/bi-playground/src/App.tsx`

### read_paths
- `apps/bi-playground/src/stores/useThemeStore.ts`
- `apps/bi-playground/src/App.tsx`

### 实现步骤
1. 在 App.tsx 中导入 `useEffect`
2. 添加 effect：`useEffect(() => { document.documentElement.dataset.theme = mode; }, [mode])`
3. 在 `<html>` 标签上不设置硬编码初始值（由 JS 同步）

### 验证方式
- 启动 playground，切换主题，检查 `<html data-theme="dark">` 是否正确
- 刷新页面后检查属性是否与 localStorage 一致

---

## T-002: 新增 DARK_THEME_TOKENS 并导出

**story**: ST-002
**depends_on**: []

### 目标
在 bi-engine 包中新增暗色主题令牌预设常量并从 barrel 导出。

### write_paths
- `packages/bi-engine/src/theme/theme-tokens.ts`
- `packages/bi-engine/src/theme/index.ts`（如不存在则创建）
- `packages/bi-engine/src/index.ts`（barrel 导出）

### read_paths
- `packages/bi-engine/src/theme/theme-tokens.ts`
- `packages/bi-engine/src/theme/chart-theme-context.tsx`
- `packages/bi-engine/src/index.ts`

### 实现步骤
1. 在 `theme-tokens.ts` 中新增 `DARK_BACKGROUND_TOKENS`、`DARK_FONT_TOKENS`、`DARK_BORDER_TOKENS`、`DARK_THEME_TOKENS`
2. 暗色值参考：背景 `#1a1a2e`/`rgba(30,30,50,0.9)`/`transparent`，文字 `#e0e0e0`/`#999`，边框 `#555`/`#333`
3. 创建 `packages/bi-engine/src/theme/index.ts` barrel 文件，导出所有主题相关类型和常量
4. 在 root barrel `src/index.ts` 中添加 theme barrel 导出

### 验证方式
- `pnpm build:engine` 构建通过
- `pnpm test` 测试通过
- 新增单元测试验证暗色 tokens 结构

---

## T-003: 图表预览组件适配暗色主题

**story**: ST-003
**depends_on**: [T-002]

### 目标
在 ChartPreview 和 InteractivePreview 中，根据当前主题模式传递对应的 theme tokens 给 ChartThemeProvider。

### write_paths
- `apps/bi-playground/src/components/ChartPreview.tsx`
- `apps/bi-playground/src/components/demo/InteractivePreview.tsx`

### read_paths
- `apps/bi-playground/src/components/ChartPreview.tsx`
- `apps/bi-playground/src/components/demo/InteractivePreview.tsx`
- `apps/bi-playground/src/stores/useThemeStore.ts`
- `packages/bi-engine/src/theme/theme-tokens.ts`

### 实现步骤
1. ChartPreview：导入 `useThemeStore` 和 `DARK_THEME_TOKENS`，用 `ChartThemeProvider` 包裹 `BIEngine`，暗色模式下传入 dark tokens
2. InteractivePreview：同上逻辑
3. 确保主题切换时图表自动重新渲染（因为 tokens 变化触发 context 更新）

### 验证方式
- 首页切换暗色主题，检查图表背景变为深色、文字变为浅色
- 编辑器页面同上

---

## T-004: VRT 模块 CSS 暗色适配

**story**: ST-004
**depends_on**: [T-001]

### 目标
将 `Vrt.module.css` 中的硬编码颜色替换为 CSS 变量。

### write_paths
- `apps/bi-playground/src/components/vrt/Vrt.module.css`

### read_paths
- `apps/bi-playground/src/components/vrt/Vrt.module.css`

### 实现步骤
1. 将 `rgba(0, 0, 0, 0.65)` → `var(--ant-color-text-secondary, rgba(0, 0, 0, 0.65))`
2. 将 `#ff4d4f` → `var(--ant-color-error, #ff4d4f)` 或保留（语义色）
3. 将 `#d9d9d9` → `var(--ant-color-border, #d9d9d9)`
4. 将 `#fafafa` → `var(--ant-color-fill-quaternary, #fafafa)`
5. 将 `rgba(0, 0, 0, 0.45)` → `var(--ant-color-text-tertiary, rgba(0, 0, 0, 0.45))`
6. 将 `rgba(0, 0, 0, 0.65)` → `var(--ant-color-text-secondary, rgba(0, 0, 0, 0.65))`
7. 将 `#1677ff` → `var(--ant-color-primary, #1677ff)`
8. 将 `#cf1322` → `var(--ant-color-error, #cf1322)`
9. 将 `#ffccc7` → `var(--ant-color-error-border, #ffccc7)`

### 验证方式
- VRT 页面在暗色模式下无白色残留
- 浅色模式下视觉不变

---

## T-005: 全局页面背景跟随主题

**story**: ST-005
**depends_on**: [T-001]

### 目标
设置全局 body/html 背景色跟随主题，避免切换时白色闪烁。

### write_paths
- `apps/bi-playground/src/App.tsx`（添加 body 背景同步 effect）
- `apps/bi-playground/src/main.tsx`（如需设置初始背景）

### read_paths
- `apps/bi-playground/src/App.tsx`
- `apps/bi-playground/src/main.tsx`

### 实现步骤
1. 在 App.tsx 中添加 effect：同步 `document.body.style.backgroundColor` 为 Ant Design 的 `--ant-color-bg-layout` 值
2. 或更简单：在 App 组件外层添加 `useEffect` 设置 body 的 `backgroundColor` 基于 `isDark`
3. 暗色：`#141414`（Ant Design dark mode 的 bg-layout），浅色：`#f5f5f5`
4. 在 `index.html` 中为 `<body>` 设置初始内联样式 `style="background:#f5f5f5"` 避免白屏闪烁

### 验证方式
- 切换暗色主题，页面整体背景为深色
- 刷新页面无白屏闪烁
- 浅色模式下背景不变
