---
feature: FEAT-010
title: Tasks — 原生 React 表格组件
last_updated: 2026-04-26
---

## T-001: 创建 TableView 基础组件

- **Story**: ST-001
- **Description**: 创建 `TableView` React 组件，使用原生 HTML `<table>` 渲染。支持：表头/表体、边框、隔行色、hover 高亮、列宽、rowKey、空状态、多级表头。附带独立 CSS 模块文件。
- **Dependencies**: 无
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
  - `packages/bi-engine/src/component-handlers/table/table-view.css`
  - `packages/bi-engine/src/component-handlers/table/types.ts`
- **verify**: 单元测试渲染 `<table>` 元素，含 `<thead>`/`<tbody>`，隔行色 class，hover 高亮，空状态文本

## T-002: 实现 useTableSort Hook

- **Story**: ST-003
- **Description**: 创建 `useTableSort` Hook。输入原始数据和排序状态 `{ columnKey, direction }`，输出排序后数据。支持数字/文本自动识别，单列排序。direction 三态循环：default → asc → desc。
- **Dependencies**: 无（纯逻辑）
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/useTableSort.ts`
- **verify**: 单元测试覆盖三态循环、数字排序、文本排序、点击新列重置旧列

## T-003: 实现 useTableFilter Hook

- **Story**: ST-004
- **Description**: 创建 `useTableFilter` Hook。输入原始数据和各列筛选文本 map，输出筛选后数据。模糊匹配（不区分大小写），多列取交集。
- **Dependencies**: 无（纯逻辑）
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/useTableFilter.ts`
- **verify**: 单元测试覆盖单列筛选、多列交集、清空筛选、空关键词不过滤

## T-004: 创建 ColumnManager 列显隐管理组件

- **Story**: ST-005
- **Description**: 创建 `ColumnManager` React 组件（穿梭框弹窗）。双面板（可选列/已选列），支持单个/批量移动，确认后更新可见列。纯原生实现，不依赖第三方。
- **Dependencies**: 无（独立 UI 组件）
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/ColumnManager.tsx`
  - `packages/bi-engine/src/component-handlers/table/column-manager.css`
- **verify**: 单元测试覆盖列移动、批量移动、弹窗打开/关闭、displayPriority 映射

## T-005: DSL-to-Props 转换层 + 替换 tableRenderer

- **Story**: ST-002
- **Description**: 1) 扩展 `TableSemanticModel` 类型，增加列级扩展字段（sortable, filterable, render, rowSpan, colSpan）。2) 创建 `dslToTableProps()` 转换函数。3) 替换 `tableRenderer.render()` 内部调用 `TableView`。4) 更新 `index.ts` 导出。保留所有辅助函数兼容性。
- **Dependencies**: T-001
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/table-handler.tsx`
  - `packages/bi-engine/src/component-handlers/table/index.ts`
- **verify**: 现有 table-handler 测试全部通过，无回归

## T-006: 集成排序/筛选/列管理到 TableView

- **Story**: ST-003, ST-004, ST-005
- **Description**: 在 `TableView` 中集成 `useTableSort`、`useTableFilter`、`ColumnManager`。添加排序表头 UI（可点击排序图标）、筛选行（输入框）、列管理入口按钮。组合顺序：先筛选后排序。
- **Dependencies**: T-001, T-002, T-003, T-004, T-005
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
  - `packages/bi-engine/src/component-handlers/table/table-view.css`
- **verify**: 手动验证排序/筛选/列管理交互；单元测试覆盖组合场景

## T-007: 单元格合并支持

- **Story**: ST-006
- **Description**: 在 `TableView` 中支持 rowSpan/colSpan 合并。兼容声明式 `MergeRowConfig` 和列级函数式合并。自动隐藏冗余单元格。优先级：列级函数 > 声明式配置。
- **Dependencies**: T-005
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 单元测试覆盖声明式合并、函数式合并、优先级冲突、冗余单元格隐藏

## T-008: 自定义列渲染 + 枚举映射

- **Story**: ST-007
- **Description**: 在 `TableView` 中支持列级 `render` 函数 `(value, row, index, column) => ReactNode`。未配置 render 时使用默认格式化。存在 `enumConfig` 时自动映射 value → title。
- **Dependencies**: T-005
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 单元测试覆盖自定义 render、enumConfig 映射、默认格式化

## T-009: 创建表格 Fixture 并扩展 Registry

- **Story**: ST-008
- **Description**: 创建多个表格 fixture（基础、排序、筛选、合并、自定义渲染、空数据），扩展 fixture-registry 支持 table 类型。每个 fixture 使用 `TableComponent` DSL 定义。
- **Dependencies**: T-005
- **write_paths**:
  - `packages/bi-engine/src/testing/fixtures/table-*.ts`（新增多个）
  - `packages/bi-engine/src/testing/fixture-registry.ts`
  - `packages/bi-engine/src/testing/index.ts`
- **verify**: 所有 fixture 可被 registry 查询，渲染无报错

## T-010: Playground 表格演示页面

- **Story**: ST-008
- **Description**: 在 Playground 中新增表格演示页面。更新路由、侧边栏导航、SceneDemoPage 支持 table kind。展示多种表格用例，每个用例可通过 BIEngine 渲染。
- **Dependencies**: T-009
- **write_paths**:
  - `apps/bi-playground/src/pages/SceneDemoPage.tsx`
  - `apps/bi-playground/src/components/demo/InteractivePreview.tsx`
  - `apps/bi-playground/src/components/ChartPreview.tsx`
  - `apps/bi-playground/src/components/layout/LeftSidebar.tsx`（或 ComponentTree）
- **verify**: 访问 `/table` 路由可看到表格用例列表，每个用例可正常渲染和交互

## T-011: 单元测试覆盖

- **Story**: ST-009
- **Description**: 为所有新增模块补充单元测试。覆盖排序 Hook、筛选 Hook、DSL-to-Props 转换、合并逻辑、自定义渲染。确保总覆盖率 >= 80%。所有现有测试通过。
- **Dependencies**: T-005, T-006, T-007, T-008
- **write_paths**:
  - `packages/bi-engine/src/__tests__/handlers/table-handler.test.tsx`（更新）
  - `packages/bi-engine/src/__tests__/handlers/useTableSort.test.ts`（新增）
  - `packages/bi-engine/src/__tests__/handlers/useTableFilter.test.ts`（新增）
  - `packages/bi-engine/src/__tests__/handlers/table-merge.test.ts`（新增）
- **verify**: `pnpm test` 全部通过，覆盖率 >= 80%
