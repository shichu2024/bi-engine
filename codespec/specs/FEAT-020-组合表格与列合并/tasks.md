# 任务清单

## 索引

| ID | Story | 标题 | 状态 | 依赖 | 负责人 |
|----|-------|-------|--------|------------|-------|
| T-001 | ST-004 | MergeColumnInfo 模型扩展与测试 fixtures | todo | - | dev |
| T-002 | ST-001 | 基础表格值合并渲染 | todo | T-001 | dev |
| T-003 | ST-002 | 基础表格表头合并渲染 | todo | T-001 | dev |
| T-004 | ST-003 | 组合表格组件与 handler | todo | T-002, T-003 | dev |
| T-005 | ST-001,ST-002,ST-003 | 单元测试覆盖 | todo | T-004 | dev |
| T-006 | ST-003 | Playground 集成与主题适配 | todo | T-004 | dev |

## T-001 MergeColumnInfo 模型扩展与测试 fixtures

```yaml
id: T-001
story_id: ST-004
title: MergeColumnInfo 模型扩展与测试 fixtures
owner_role: dev
status: todo
depends_on: []
read_paths:
  - packages/bi-engine/src/schema/**
  - packages/bi-engine/src/testing/fixtures/**
write_paths:
  - packages/bi-engine/src/schema/bi-engine-models.ts
  - packages/bi-engine/src/testing/fixtures/table-merge-columns-value.ts
  - packages/bi-engine/src/testing/fixtures/table-merge-columns-header.ts
  - packages/bi-engine/src/testing/fixtures/composite-table-basic.ts
  - packages/bi-engine/src/testing/index.ts
verify:
  - type: command
    value: cd packages/bi-engine && pnpm build && pnpm test
```

### 目标

- 扩展 `MergeColumnInfo` 接口，新增 `isMergeValue?: boolean` 字段
- 创建 3 个测试 fixtures：值合并、表头合并、组合表格

### 交付物

- 更新后的 `MergeColumnInfo` 接口定义
- 3 个新增 fixture 文件并导出

### 备注

- `isMergeValue` 默认值为 `true`，需在 JSDoc 注释中说明
- fixture 数据应包含足够的行数以验证边界情况（如空值、多合并规则）

## T-002 基础表格值合并渲染

```yaml
id: T-002
story_id: ST-001
title: 基础表格值合并渲染
owner_role: dev
status: todo
depends_on: [T-001]
read_paths:
  - packages/bi-engine/src/component-handlers/table/**
  - packages/bi-engine/src/schema/bi-engine-models.ts
write_paths:
  - packages/bi-engine/src/component-handlers/table/TableView.tsx
  - packages/bi-engine/src/component-handlers/table/table-handler.tsx
  - packages/bi-engine/src/component-handlers/table/types.ts
verify:
  - type: command
    value: cd packages/bi-engine && pnpm build && pnpm test
```

### 目标

- TableView 接受 `mergeColumns` prop 并实现值合并渲染
- 合并后的表头为单行居中，表体将多列值合并为一个单元格

### 交付物

- 更新后的 `TableViewProps`、`TableSemanticModel`、`tableHandler`
- 值合并渲染逻辑

### 备注

- 值合并时被合并列在表体只占 1 列宽度（colSpan 为 1），非空值用 `<br>` 或换行分隔
- 需处理：表头 colSpan=被合并列数、表体隐藏被合并列、空值跳过

## T-003 基础表格表头合并渲染

```yaml
id: T-003
story_id: ST-002
title: 基础表格表头合并渲染
owner_role: dev
status: todo
depends_on: [T-001]
read_paths:
  - packages/bi-engine/src/component-handlers/table/**
write_paths:
  - packages/bi-engine/src/component-handlers/table/TableView.tsx
  - packages/bi-engine/src/component-handlers/table/types.ts
verify:
  - type: command
    value: cd packages/bi-engine && pnpm build && pnpm test
```

### 目标

- 实现 isMergeValue=false 时的表头合并渲染
- 表头合并为一个单元格，表体保留所有列独立展示

### 交付物

- 表头合并渲染逻辑
- 复用值合并的表头部分，表体保持分列

### 备注

- 表头合并与值合并共享表头处理逻辑，仅表体不同
- 被合并列需紧凑排列，列宽按原有配置分配

## T-004 组合表格组件与 handler

```yaml
id: T-004
story_id: ST-003
title: 组合表格组件与 handler
owner_role: dev
status: todo
depends_on: [T-002, T-003]
read_paths:
  - packages/bi-engine/src/component-handlers/**
  - packages/bi-engine/src/platform/**
  - packages/bi-engine/src/schema/**
  - packages/bi-engine/src/locale/**
  - packages/bi-engine/src/design/**
  - packages/bi-engine/src/index.ts
write_paths:
  - packages/bi-engine/src/component-handlers/composite-table/**
  - packages/bi-engine/src/component-handlers/index.ts
  - packages/bi-engine/src/platform/auto-registry.ts
  - packages/bi-engine/src/locale/zh-CN.ts
  - packages/bi-engine/src/locale/en-US.ts
  - packages/bi-engine/src/locale/types.ts
verify:
  - type: command
    value: cd packages/bi-engine && pnpm build && pnpm test
```

### 目标

- 创建 CompositeTableView 组件，渲染多个子表格无缝拼接
- 创建 composite-table-handler 注册到组件管道
- 子表格标题灰色背景行、全局禁用操作、支持列合并

### 交付物

- `composite-table/CompositeTableView.tsx`
- `composite-table/composite-table-handler.tsx`
- `composite-table/index.ts`
- handler 注册到 auto-registry

### 备注

- CompositeTableView 内部复用 TableView 渲染每个子表格
- 子表格传给 TableView 时禁用：sortable、filterable、showColumnManager、pagination
- 子表格间通过负 margin 或 borderCollapse 消除间距

## T-005 单元测试覆盖

```yaml
id: T-005
story_id: ST-001,ST-002,ST-003
title: 单元测试覆盖
owner_role: dev
status: todo
depends_on: [T-004]
read_paths:
  - packages/bi-engine/src/__tests__/**
  - packages/bi-engine/src/component-handlers/**
write_paths:
  - packages/bi-engine/src/__tests__/handlers/table-merge-columns.test.tsx
  - packages/bi-engine/src/__tests__/handlers/composite-table.test.tsx
verify:
  - type: command
    value: cd packages/bi-engine && pnpm test
  - type: manual
    value: 确认所有测试通过，覆盖率 >= 80%
```

### 目标

- 值合并场景测试：表头合并、表体值合并、空值处理、多规则
- 表头合并场景测试：表头合并、表体分列
- 组合表格测试：主标题、子表格标题、无缝拼接、操作禁用、列合并继承

### 交付物

- 2 个测试文件
- 全部测试通过

## T-006 Playground 集成与主题适配

```yaml
id: T-006
story_id: ST-003
title: Playground 集成与主题适配
owner_role: dev
status: todo
depends_on: [T-004]
read_paths:
  - apps/bi-playground/src/**
  - packages/bi-engine/src/design/**
  - packages/bi-engine/src/theme/**
write_paths:
  - packages/bi-engine/src/design/utils.ts
  - packages/bi-engine/src/index.ts
  - apps/bi-playground/src/components/editor/dsl-schema.ts
verify:
  - type: command
    value: pnpm build && pnpm test
  - type: manual
    value: 在 Playground 中预览组合表格和列合并效果
```

### 目标

- design/utils.ts 中添加 compositeTable 的 displayName 和 icon
- Playground DSL schema 支持组合表格配置
- 导出更新

### 交付物

- 更新后的 design/utils.ts
- 更新后的 dsl-schema.ts
- 更新后的 barrel exports
