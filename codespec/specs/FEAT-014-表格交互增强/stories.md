---
id: ST-001
title: 列管理齿轮图标 + 对外开关
priority: P0
status: draft
dependencies: []
---

## Story

作为表格使用者，我希望列管理以齿轮图标固定在表格最后一列的位置展示，并通过 `showColumnManager` 开关控制，以便快速管理列显隐。

## Acceptance Criteria

- **AC-1**: 齿轮图标作为虚拟最后一列渲染在表头和数据行中
- **AC-2**: 点击齿轮图标弹出列管理穿梭框弹窗
- **AC-3**: 移除列后表格立即不显示该列
- **AC-4**: `showColumnManager` 为 false 或未设置时，不渲染齿轮列
- **AC-5**: 齿轮列宽度固定，不可拖拽调整

---
---
id: ST-002
title: 排序图标优化
priority: P0
status: draft
dependencies: []
---

## Story

作为表格使用者，我希望排序以直观的图标展示在表头文字的右侧，通过 column 的 `sortable` 开关控制，以便快速识别可排序列。

## Acceptance Criteria

- **AC-1**: sortable 列的表头文字右侧显示排序图标
- **AC-2**: 点击排序图标或表头触发三态循环（default→asc→desc）
- **AC-3**: 排序激活时图标高亮显示当前方向
- **AC-4**: 非 sortable 列不显示排序图标

---
---
id: ST-003
title: 筛选漏斗图标 + 下拉面板
priority: P0
status: draft
dependencies: []
---

## Story

作为表格使用者，我希望筛选以漏斗图标展示在表头，点击弹出筛选面板，通过 column 的 `filterable` 开关控制，以便按列过滤数据。

## Acceptance Criteria

- **AC-1**: filterable 列的表头显示漏斗图标
- **AC-2**: 点击漏斗图标弹出筛选输入面板（非表头下方常驻输入框）
- **AC-3**: 输入文本后表格实时过滤匹配的行
- **AC-4**: 多列筛选取交集
- **AC-5**: 筛选激活时漏斗图标高亮
- **AC-6**: 点击面板外部关闭面板

---
---
id: ST-004
title: 分页支持
priority: P0
status: draft
dependencies: []
---

## Story

作为表格使用者，我希望表格支持分页，参考 antd 分页组件，控制每页展示数量和数据，与排序和筛选联动。

## Acceptance Criteria

- **AC-1**: 表格底部显示分页组件，包含页码、每页条数选择器、总数显示
- **AC-2**: 默认每页 10 条，支持切换（10/20/50/100）
- **AC-3**: 数据管线：先筛选→排序→分页，结果正确
- **AC-4**: 筛选/排序变化时自动重置到第一页
- **AC-5**: 数据量不超过一页时，分页组件隐藏或显示单页状态

---
---
id: ST-005
title: 列宽拖拽调整
priority: P1
status: draft
dependencies: []
---

## Story

作为表格使用者，我希望通过拖拽列边框来调整列宽，以便灵活控制各列的显示宽度。

## Acceptance Criteria

- **AC-1**: 鼠标移到列右边框时显示拖拽光标
- **AC-2**: 按住拖拽可调整列宽，实时反馈
- **AC-3**: 设定最小列宽（如 50px），不允许拖到更小
- **AC-4**: 拖拽过程中不触发排序等操作

---
---
id: ST-006
title: 表头文字省略 + tooltip + 图标保底
priority: P0
status: draft
dependencies: [ST-002, ST-003]
---

## Story

作为表格使用者，我希望表头文字超过列宽时省略展示并提供 tooltip，排序和筛选图标始终可见不被截断。

## Acceptance Criteria

- **AC-1**: 表头文字超出列宽时显示省略号（text-overflow: ellipsis）
- **AC-2**: 鼠标悬停被省略的表头时，显示 tooltip 展示完整文字
- **AC-3**: 排序图标和筛选漏斗图标始终可见，不被文字截断
- **AC-4**: 使用 `tableLayout: fixed` 配合列宽拖拽

---
---
id: ST-007
title: 单元测试覆盖
priority: P0
status: draft
dependencies: [ST-001, ST-002, ST-003, ST-004, ST-005, ST-006]
---

## Story

作为维护者，我希望所有新增功能有充分的单元测试覆盖。

## Acceptance Criteria

- **AC-1**: 分页 Hook 独立测试
- **AC-2**: 列管理开关测试
- **AC-3**: 表头省略 + tooltip 测试
- **AC-4**: 数据管线（筛选→排序→分页）组合测试
- **AC-5**: 全部测试通过，无回归
