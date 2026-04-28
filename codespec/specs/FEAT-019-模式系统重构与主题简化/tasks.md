# FEAT-019 Tasks

## T-001: 重构 RenderMode 枚举与类型

**Story**: ST-001
**Status**: todo

### 描述

在 `platform/types.ts` 中将 `RenderMode` 枚举从 `RUNTIME | DESIGN` 改为 `CHAT | EDIT | VIEW`。保留旧枚举值作为兼容别名。

### 改动范围

- `packages/bi-engine/src/platform/types.ts`

### 验证

- `pnpm build:engine` 无错误

---

## T-002: 更新 RenderModeProvider 和 hooks

**Story**: ST-001
**Status**: todo
**Depends**: T-001

### 描述

更新 `platform/render-mode.tsx`：
- `RenderModeProvider` 接受新模式
- 新增 `useCanSwitchChart()` hook
- 新增 `useCanEditText()` hook
- `useIsDesignMode()` 重命名为 `useIsEditMode()`，旧名保留为别名

### 改动范围

- `packages/bi-engine/src/platform/render-mode.tsx`

### 验证

- `pnpm build:engine` 无错误

---

## T-003: 更新 BIEngineProps 接口

**Story**: ST-001, ST-002
**Status**: todo
**Depends**: T-001

### 描述

更新 `react/BIEngine.tsx`：
- `mode` 类型改为 `'chat' | 'edit' | 'view' | 'runtime' | 'design'`
- `theme` 类型改为 `'dark' | 'light'`
- mode 向后兼容映射：`runtime → VIEW`，`design → EDIT`
- theme 内部解析为对应 tokens
- 更新 `ChartThemeProvider` 的传值逻辑

### 改动范围

- `packages/bi-engine/src/react/BIEngine.tsx`

### 验证

- `pnpm build:engine` 无错误

---

## T-004: ComponentView 模式控制

**Story**: ST-003, ST-005
**Status**: todo
**Depends**: T-002

### 描述

更新 `react/ComponentView.tsx`：
- 使用 `useCanSwitchChart()` 控制图表切换 toolbar
- 使用 mode 判断 DesignableWrapper 包裹
- 移除对 `RenderMode.DESIGN` 的直接引用

### 改动范围

- `packages/bi-engine/src/react/ComponentView.tsx`

### 验证

- `pnpm build:engine` 无错误

---

## T-005: TextHandler 模式控制

**Story**: ST-004
**Status**: todo
**Depends**: T-002

### 描述

更新 `component-handlers/text/text-handler.tsx`：
- renderer 使用 `useCanEditText()` 判断是否渲染 DesignTextRenderer
- 移除对 `RenderMode.DESIGN` 的直接引用

### 改动范围

- `packages/bi-engine/src/component-handlers/text/text-handler.tsx`

### 验证

- `pnpm build:engine` 无错误

---

## T-006: 更新公共导出

**Story**: ST-001
**Status**: todo
**Depends**: T-002

### 描述

更新 `src/index.ts` 导出新增的 hooks 和类型。

### 改动范围

- `packages/bi-engine/src/index.ts`
- `packages/bi-engine/src/platform/index.ts`（如有导出）

### 验证

- `pnpm build:engine` 无错误

---

## T-007: 更新现有测试

**Story**: ST-006
**Status**: todo
**Depends**: T-003, T-004, T-005

### 描述

更新所有引用 `runtime`/`design` 模式的测试文件，确保向后兼容通过，并新增新模式测试。

### 改动范围

- `packages/bi-engine/src/__tests__/platform/render-mode.test.tsx`
- `packages/bi-engine/src/__tests__/bi-engine-onchange.test.tsx`
- `packages/bi-engine/src/__tests__/handlers/text-handler-edit.test.tsx`
- 其他引用 RenderMode 的测试文件

### 验证

- `pnpm test` 全部通过

---

## T-008: Playground 模式与主题 UI 更新

**Story**: ST-007
**Status**: todo
**Depends**: T-003

### 描述

更新 Playground：
- `useModeStore` 改为三模式（chat/edit/view）
- `EditorPage` 模式选择器改为 Segmented 组件
- `EditorPage` 使用新的简化 theme API
- `InteractivePreview` 使用新的 mode 和 theme
- 移除手动 `ChartThemeProvider` 包裹（由 BIEngine 内部处理）

### 改动范围

- `apps/bi-playground/src/stores/useModeStore.ts`
- `apps/bi-playground/src/pages/EditorPage.tsx`
- `apps/bi-playground/src/components/demo/InteractivePreview.tsx`

### 验证

- `pnpm dev:playground` 可正常访问
- 三模式切换正常
- 主题切换正常
