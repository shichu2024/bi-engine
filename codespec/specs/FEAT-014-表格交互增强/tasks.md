---
feature: FEAT-014
title: Tasks — 表格交互增强
last_updated: 2026-04-26
---

## T-001: 重构 TableView 主框架 + 类型扩展

- **Story**: ST-001, ST-004, ST-006
- **Description**: 1) 扩展 `TableViewProps` 增加 `showColumnManager`、分页相关 props。2) 扩展 `TableColumn` 增加 `minWidth`。3) 重构 `TableView` 使用 `tableLayout: fixed`。4) 添加数据管线：筛选→排序→分页。5) 齿轮列作为虚拟最后列渲染。
- **Dependencies**: 无
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/types.ts`
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 现有测试通过，齿轮列渲染正确，分页显示正确

## T-002: 列管理齿轮图标组件

- **Story**: ST-001
- **Description**: 将列管理按钮从工具栏移至齿轮图标，固定在表格最后一列。齿轮列宽度固定 40px，不可拖拽。`showColumnManager` 开关控制。
- **Dependencies**: T-001
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 齿轮列在最后位置，开关关闭时不显示

## T-003: 排序图标优化

- **Story**: ST-002
- **Description**: 排序图标显示在表头文字右侧，优化图标样式使其更直观。确保与省略文字共存时图标始终可见。
- **Dependencies**: T-001
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 排序图标在文字右侧，三态循环正确

## T-004: 筛选漏斗图标 + 下拉面板

- **Story**: ST-003
- **Description**: 移除表头下方常驻筛选行，改为漏斗图标点击触发下拉筛选面板。面板使用 Portal 定位。筛选激活时图标高亮。
- **Dependencies**: T-001
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
  - `packages/bi-engine/src/component-handlers/table/FilterDropdown.tsx`
- **verify**: 漏斗图标显示，点击弹出面板，筛选正确

## T-005: 分页组件

- **Story**: ST-004
- **Description**: 实现 `useTablePagination` Hook 和分页 UI 组件。参考 antd：页码、每页条数选择器、总数。与筛选/排序联动。
- **Dependencies**: T-001
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 分页显示，切换页码/条数正确，与排序筛选联动

## T-006: 列宽拖拽

- **Story**: ST-005
- **Description**: 在表头 `<th>` 的右边缘添加拖拽手柄，mousedown+mousemove 实现拖拽调整列宽。最小宽度 50px。
- **Dependencies**: T-001
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 拖拽调整列宽，最小宽度限制

## T-007: 表头文字省略 + tooltip

- **Story**: ST-006
- **Description**: 表头使用 flex 布局：文字区域 `overflow: hidden; text-overflow: ellipsis`，图标区域 `flex-shrink: 0`。鼠标悬停时检测是否溢出，溢出则显示 tooltip。
- **Dependencies**: T-003, T-004
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/TableView.tsx`
- **verify**: 文字省略正确，tooltip 显示完整文字，图标始终可见

## T-008: DSL-to-Props 转换更新 + Fixture 更新

- **Story**: ST-001, ST-004
- **Description**: 更新 `dslToTableColumns` 和 `tableRenderer` 传递 `showColumnManager` 等新 props。更新现有 table fixture 添加 sortable/filterable 配置。
- **Dependencies**: T-002, T-005
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/table/table-handler.tsx`
  - `packages/bi-engine/src/testing/fixtures/table-*.ts`
- **verify**: 通过 DSL 渲染的表格具备新功能

## T-009: 单元测试覆盖

- **Story**: ST-007
- **Description**: 补充分页 Hook 测试、列管理开关测试、表头省略 tooltip 测试、数据管线组合测试。确保无回归。
- **Dependencies**: T-002, T-003, T-004, T-005, T-006, T-007
- **write_paths**:
  - `packages/bi-engine/src/__tests__/handlers/table-view.test.tsx`
- **verify**: `pnpm test` 全部通过
