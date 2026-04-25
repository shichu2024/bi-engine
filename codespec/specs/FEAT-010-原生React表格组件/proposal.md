---
id: FEAT-010
title: 原生 React 表格组件
type: feature
priority: P0
dependencies: [FEAT-003]
---

## Problem

- 现有 `tableHandler` 的 renderer 使用 CSS Grid 实现了基础表格渲染（表头、数据行、多级表头、行合并），但缺乏交互能力：无排序、无筛选、无列显隐管理、无 hover 高亮、无隔行色、无自定义渲染函数
- 渲染器将所有逻辑内联在 `tableRenderer.render()` 中，视图层与数据处理层耦合，难以独立扩展
- 用户需求中的列级配置（sortable、filterable、render、rowSpan/colSpan 函数）在现有 `Column` DSL 类型中未定义，需要扩展语义模型并在 DSL-to-props 转换中桥接
- Playground 中尚无表格组件的交互式演示页面，无法直观验证表格各项能力

## Goals

- **基础表格体验升级**：替换现有 CSS Grid 最小实现，提供完整的 HTML `<table>` 渲染，包含固定列宽、边框、隔行色、hover 高亮、行 key 等标准表格能力
- **列显隐管理**：提供穿梭框弹窗，双面板（可选列/已选列），支持单个/批量移动，操作实时生效
- **排序能力**：单列排序，默认 -> 升序 -> 降序循环，文本/数字自动识别排序策略
- **筛选能力**：列维度独立筛选，模糊匹配输入，多列组合筛选，支持清空/重置
- **单元格合并**：支持跨行 (rowSpan) / 跨列 (colSpan)，兼容现有 `MergeRowConfig` 声明式配置，同时支持列级函数式合并
- **自定义渲染**：每列支持 render 函数 `(value, row, index, column) => ReactNode`
- **架构分层**：视图组件、排序逻辑、筛选逻辑、列控逻辑解耦为独立模块，渲染器只负责消费转换后的 props
- **Playground 演示**：在 Playground 中添加表格演示页面，覆盖不同用例

## Scope

### In Scope

1. 原生 React 表格视图组件（`TableView`），接收标准化 props 渲染 HTML `<table>`
2. 排序 Hook（`useTableSort`），纯逻辑层，输出排序后的数据
3. 筛选 Hook（`useTableFilter`），纯逻辑层，输出筛选后的数据
4. 列显隐管理组件（`ColumnManager`），穿梭框 UI
5. DSL-to-Props 转换层，将 `TableSemanticModel` 转换为 `TableView` 所需的标准化 props
6. 扩展 `TableSemanticModel`，桥接用户需求中的列级配置（sortable、filterable、render 等）
7. 替换现有 `tableRenderer` 中的 CSS Grid 实现为新的 `TableView` 组件
8. 单元格合并：兼容 `MergeRowConfig` + 列级 rowSpan/colSpan 函数
9. Playground 表格演示页面，包含多种用例 fixture
10. 单元测试覆盖

### Out of Scope

- 虚拟滚动 / 大数据量性能优化（后续迭代）
- 列固定 / 列冻结（sticky column）
- 树形数据展示
- 行选择 / 多选
- 行展开 / 折叠
- 分页
- 可编辑单元格
- 拖拽排序列
- 列宽拖拽调整
- 导出 Excel / CSV
- 主题系统与深色模式适配（除非主题系统已存在）
- `datasource` / `api` 数据类型（v1 仅支持 `static`）
- CompositeTable 组合表格（独立 feature）
- `Column.uiConfig.event` 交互事件

## Risks

| 风险 | 类型 | 缓解措施 |
|------|------|----------|
| 扩展列配置可能与现有 `Column` DSL 类型冲突 | 技术 | 在 `TableSemanticModel` 层扩展，不修改权威模型 `Column` 接口；通过 DSL-to-Props 转换映射 |
| rowSpan/colSpan 函数式合并与声明式 `MergeRowConfig` 的优先级 | 技术 | 明确优先级：函数式 > 声明式；在同一列上不混用两种模式 |
| 排序和筛选组合使用时状态管理复杂度 | 技术 | 使用独立 Hook 管理，组合顺序：先筛选后排序，逻辑分层 |
| 替换现有 CSS Grid 实现可能引入回归 | 技术 | 保留现有测试用例不变，确保所有现有测试通过 |
| 穿梭框组件复杂度可能膨胀 | 技术 | 穿梭框作为独立组件，不与表格核心耦合 |
| 多级表头 + 单元格合并的边界场景 | 技术 | 在 stories 中明确多级表头合并的边界约束 |

## User Value

- BI 引擎使用者可以通过 DSL 声明一个功能丰富的表格，包含排序、筛选、列管理和自定义渲染，无需依赖第三方 UI 库
- 表格组件保持轻量化，打包体积可控
- 架构分层确保后续扩展（分页、虚拟滚动等）可以独立迭代

## Acceptance Criteria (Feature Level)

- **AC-F1**: 给定一个 `TableComponent` DSL，通过管线处理后渲染出完整的 HTML 表格，包含表头、数据行、边框、隔行色、hover 高亮
- **AC-F2**: 用户可以点击列头触发排序，排序状态在表头有视觉指示
- **AC-F3**: 用户可以在列筛选输入框中输入文本，表格实时过滤匹配的行
- **AC-F4**: 用户可以打开列显隐管理弹窗，调整可见列后表格实时更新
- **AC-F5**: 给定包含 `mergeRows` 的 DSL，表格正确渲染合并单元格，被合并的单元格不显示
- **AC-F6**: 给定列配置中包含 render 函数，该列的单元格内容由 render 函数返回值决定
- **AC-F7**: 现有 53 个测试全部通过，无回归
- **AC-F8**: Playground 中可访问表格演示页面，展示至少 3 种不同配置的表格

## Open Questions

1. **列配置扩展方式**：`Column` DSL 权威模型中未定义 `sortable`、`filterable`、`render`、`rowSpan`、`colSpan` 等字段。是在 `TableSemanticModel` 中扩展映射，还是在 `Column.uiConfig` 或 `Column.basicProperties` 中承载？建议在语义模型层扩展，不修改权威模型。
2. **筛选交互形式**：筛选是嵌入表头的下拉面板，还是独立的筛选栏？用户需求描述为"列维度独立筛选 + 模糊匹配"，建议在表头下方展示筛选输入行。
3. **列显隐管理的默认可见列**：`FieldUI.displayPriority` 已定义 `high/normal/never` 三级，是否直接映射为列显隐管理的初始状态（`never` 默认隐藏，其余默认可见）？
4. **多级表头场景下的合并单元格**：`MergeRowConfig.columnKey` 引用的是叶子列还是任意层级列？现有 fixture 只在叶子列上有数据，建议仅支持叶子列合并。
