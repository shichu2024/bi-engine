---
id: ST-001
title: 基础表格渲染
priority: P0
status: draft
dependencies: []
---

## Story

作为 BI 引擎使用者，我希望表格组件能渲染出具备边框、隔行色、hover 高亮、固定列宽的标准 HTML 表格，以便清晰直观地浏览结构化数据。

## Acceptance Criteria

- **AC-1**: 表格使用原生 HTML `<table>` 元素渲染，包含 `<thead>` 和 `<tbody>` 结构
- **AC-2**: 表头单元格加粗显示，背景色区分于数据行
- **AC-3**: 数据行隔行变色（偶数行与奇数行背景色不同）
- **AC-4**: 鼠标悬停数据行时，该行有高亮背景色反馈
- **AC-5**: 列配置中指定 `width` 时，对应列按指定宽度渲染；未指定时均分剩余空间
- **AC-6**: 表格具有统一的 1px 边框样式
- **AC-7**: 支持通过 `rowKey`（string 或 Function）为每行生成唯一 key
- **AC-8**: 数据为空时展示居中的空状态提示（如"暂无数据"）
- **AC-9**: 多级表头（Column 含 children）正确渲染为嵌套的 `<th>` 结构，父级表头跨列显示

---

---
id: ST-002
title: DSL-to-Props 转换与渲染器替换
priority: P0
status: draft
dependencies: [ST-001]
---

## Story

作为 BI 引擎维护者，我希望现有 `tableRenderer` 从 CSS Grid 内联实现替换为使用新的 `TableView` 组件，同时通过 DSL-to-Props 转换层将 `TableSemanticModel` 映射为表格组件的标准 props，以便渲染逻辑与数据处理解耦，且现有管线和测试无回归。

## Acceptance Criteria

- **AC-1**: `tableRenderer.render()` 内部调用 `TableView` 组件，不再直接生成 CSS Grid DOM
- **AC-2**: 存在 DSL-to-Props 转换函数，将 `TableSemanticModel` 的 columns/data/mergeRows/hasMerge 映射为 `TableView` 的标准 props（dataSource、columns、rowKey 等）
- **AC-3**: `TableSemanticModel` 扩展后的字段（如列级 sortable/filterable/render 配置）能通过转换层正确传递
- **AC-4**: 现有管线测试（table-handler.test.tsx）全部通过，无回归
- **AC-5**: `tableBasic` 和 `tableMultiHeader` 两个 fixture 的渲染结果与替换前功能等价

---

---
id: ST-003
title: 单列排序
priority: P0
status: draft
dependencies: [ST-001]
---

## Story

作为表格数据浏览者，我希望点击列头可以触发排序（默认 -> 升序 -> 降序循环），表头显示排序方向指示，文本列按字典序排序、数字列按数值排序，以便快速发现数据中的趋势和极值。

## Acceptance Criteria

- **AC-1**: 列配置中 `sortable: true` 的列，表头渲染可点击的排序触发区域
- **AC-2**: 点击排序触发区域，排序状态按 `default -> asc -> desc -> default` 三态循环
- **AC-3**: 排序生效时，表头显示当前排序方向的视觉指示（升序/降序箭头或图标）
- **AC-4**: 数字类型列（`type: 'int' | 'long' | 'double' | 'float'`）按数值排序，字符串类型按字典序排序
- **AC-5**: 排序逻辑封装在独立 Hook（如 `useTableSort`）中，输入为原始数据和排序状态，输出为排序后的数据
- **AC-6**: 同一时刻仅一列处于排序状态；点击新列排序时，原排序列恢复默认状态

---

---
id: ST-004
title: 列维度筛选
priority: P1
status: draft
dependencies: [ST-001]
---

## Story

作为表格数据浏览者，我希望在表头下方为各列提供独立的筛选输入框，输入文本后表格实时过滤出匹配的行，多列筛选取交集，以便在大量数据中快速定位目标记录。

## Acceptance Criteria

- **AC-1**: 列配置中 `filterable: true` 的列，在表头下方渲染一个筛选输入框
- **AC-2**: 在筛选输入框中键入文本，表格实时过滤，仅展示该列值包含输入文本的行（不区分大小写）
- **AC-3**: 多列同时存在筛选条件时，取交集（行需同时满足所有列的筛选条件）
- **AC-4**: 存在"清空筛选"或"重置"操作，一键清除所有列的筛选条件，恢复全量展示
- **AC-5**: 筛选逻辑封装在独立 Hook（如 `useTableFilter`）中，输入为原始数据和各列筛选值，输出为筛选后的数据
- **AC-6**: 筛选与排序组合使用时，先筛选后排序，结果正确

---

---
id: ST-005
title: 列显隐管理
priority: P1
status: draft
dependencies: [ST-001]
---

## Story

作为表格数据浏览者，我希望通过穿梭框弹窗管理表格的可见列，将列在"可选列"和"已选列"面板间移动，操作后表格列立即更新，以便按需关注感兴趣的列。

## Acceptance Criteria

- **AC-1**: 表格工具栏存在"列管理"按钮，点击弹出穿梭框弹窗
- **AC-2**: 穿梭框分为左（可选列/未选中）右（已选列/已选中）两个面板
- **AC-3**: 支持单个列的移动：点击列项 + 方向按钮，或双击列项
- **AC-4**: 支持批量移动：勾选多个列项后点击方向按钮
- **AC-5**: 确认操作后，表格根据已选列面板中的列重新渲染，列顺序与已选列面板中的排列一致
- **AC-6**: 列管理状态初始化时，`displayPriority: 'never'` 的列默认在可选面板，其余在已选面板
- **AC-7**: 列管理组件（`ColumnManager`）与表格核心解耦，作为独立 React 组件

---

---
id: ST-006
title: 单元格合并
priority: P1
status: draft
dependencies: [ST-001]
---

## Story

作为 BI 引擎使用者，我希望表格支持跨行 (rowSpan) 和跨列 (colSpan) 的单元格合并，既兼容现有 `MergeRowConfig` 声明式配置，又支持列级函数式合并，以便展示具有分组或层级结构的数据。

## Acceptance Criteria

- **AC-1**: 给定 `TableSemanticModel` 中包含 `mergeRows`（类型 `MergeRowConfig[]`），表格按声明式配置渲染合并单元格：首行显示合并内容，后续行对应单元格隐藏
- **AC-2**: 合并后的单元格具有 `rowSpan` 属性，视觉上跨越多行
- **AC-3**: 列配置中支持 `rowSpan` 函数 `(value, row, index) => number`，返回值大于 1 时该单元格纵向合并，被覆盖的单元格自动隐藏
- **AC-4**: 列配置中支持 `colSpan` 函数 `(value, row, index) => number`，返回值大于 1 时该单元格横向合并
- **AC-5**: 当同一列同时存在声明式 `MergeRowConfig` 和列级 `rowSpan` 函数时，列级函数优先
- **AC-6**: 冗余单元格（被合并覆盖的单元格）不出现在 DOM 中或以 `display: none` 隐藏，不留空白间隙

---

---
id: ST-007
title: 自定义列渲染
priority: P1
status: draft
dependencies: [ST-001]
---

## Story

作为 BI 引擎使用者，我希望每列可配置 render 函数来控制单元格的展示内容，以便实现枚举值映射、数值格式化、状态标签、操作按钮等定制化展示。

## Acceptance Criteria

- **AC-1**: 列配置中支持 `render` 函数，签名为 `(value, row, index, column) => ReactNode`
- **AC-2**: 配置了 `render` 的列，单元格内容完全由 render 返回值决定，不做额外格式化
- **AC-3**: 未配置 `render` 的列，使用默认格式化逻辑（`String(value)`）
- **AC-4**: 当列存在 `enumConfig` 但未配置 `render` 时，自动将值映射为对应的 `title` 显示
- **AC-5**: `render` 函数在 `TableSemanticModel` 层桥接，通过 DSL-to-Props 转换传递给表格组件

---

---
id: ST-008
title: Playground 表格演示页面
priority: P0
status: draft
dependencies: [ST-002, ST-003, ST-004, ST-005, ST-006, ST-007]
---

## Story

作为 BI 引擎评估者，我希望在 Playground 中访问表格演示页面，看到不同配置的表格用例（基础表格、排序表格、筛选表格、合并单元格表格、自定义渲染表格），以便直观验证表格组件的各项能力。

## Acceptance Criteria

- **AC-1**: Playground 路由中新增表格演示页面，可通过导航菜单访问
- **AC-2**: 页面包含至少 4 个独立的表格用例卡片：
  - 基础表格（含多级表头）
  - 可排序 + 可筛选表格
  - 含行合并 + 列合并的表格
  - 含自定义渲染 + 枚举映射的表格
- **AC-3**: 每个用例卡片有标题和简要说明
- **AC-4**: 列显隐管理弹窗可在至少一个用例中触发和验证
- **AC-5**: 所有用例使用 `TableComponent` DSL fixture 驱动，通过 `ComponentView` 或 `BIEngine` 渲染

---

---
id: ST-009
title: 单元测试覆盖
priority: P0
status: draft
dependencies: [ST-002, ST-003, ST-004, ST-005, ST-006, ST-007]
---

## Story

作为 BI 引擎维护者，我希望新增的表格组件、排序 Hook、筛选 Hook、列管理组件和 DSL-to-Props 转换层都有充分的单元测试覆盖，以便保障功能正确性和后续迭代的安全性。

## Acceptance Criteria

- **AC-1**: 排序 Hook 有独立单元测试，覆盖升序、降序、默认三态，覆盖数字排序和文本排序
- **AC-2**: 筛选 Hook 有独立单元测试，覆盖单列筛选、多列组合筛选、清空筛选
- **AC-3**: DSL-to-Props 转换函数有单元测试，覆盖字段映射和边界情况
- **AC-4**: 合并单元格逻辑有单元测试，覆盖声明式 `MergeRowConfig`、列级 rowSpan/colSpan 函数、优先级冲突
- **AC-5**: 新增代码测试覆盖率 >= 80%
- **AC-6**: 现有全部测试通过，无回归
