# 用户故事

## 索引

| ID | 标题 | 优先级 | 状态 | 依赖 |
|----|-------|----------|--------|------------|
| ST-001 | 基础表格列合并-值合并 | P0 | ready | - |
| ST-002 | 基础表格列合并-表头合并 | P0 | ready | - |
| ST-003 | 组合表格组件渲染 | P0 | ready | ST-001, ST-002 |
| ST-004 | MergeColumnInfo模型扩展与fixture | P0 | ready | - |

## ST-001 基础表格列合并-值合并

```yaml
id: ST-001
title: 基础表格列合并-值合并
priority: P0
status: ready
depends_on: []
```

### 故事

作为报表使用者，我希望基础表格能将多个列合并为一列展示（值合并），被合并列的值在同一单元格内换行展示，以便在有限空间内呈现关联信息。

### 验收标准

- `AC-1`: Given 表格配置 mergeColumns 中某项 isMergeValue=true（或省略），When 渲染表头，Then 被合并列显示为一个表头单元格，文本为 mergeColumn.title，colSpan 等于被合并列数，居中对齐
- `AC-2`: Given 表格配置 mergeColumns 中某项 isMergeValue=true，When 渲染表体，Then 被合并列的值合并到一个单元格内，非空值以换行分隔，空值不展示
- `AC-3`: Given 被合并列中某行全部为空值，Then 合并单元格显示为空
- `AC-4`: Given 多个 mergeColumns 规则，Then 各自独立生效不冲突，未配置的列正常展示

### 范围外

- 表头合并场景（isMergeValue=false）在 ST-002 中覆盖

## ST-002 基础表格列合并-表头合并

```yaml
id: ST-002
title: 基础表格列合并-表头合并
priority: P0
status: ready
depends_on: []
```

### 故事

作为报表使用者，我希望基础表格能将多个列的表头合并为一个（但不合并值），被合并列在表体仍各自独立展示，以便为相关列添加统一的分组标题。

### 验收标准

- `AC-1`: Given 表格配置 mergeColumns 中某项 isMergeValue=false，When 渲染表头，Then 被合并列的表头合并为一个单元格，文本为 mergeColumn.title，colSpan 等于被合并列数，居中对齐
- `AC-2`: Given 表格配置 mergeColumns 中某项 isMergeValue=false，When 渲染表体，Then 被合并列在表体仍各自独立展示，列宽按原有配置分配
- `AC-3`: Given 被合并列与未合并列共存，Then 列间无缝衔接，边框不断裂

## ST-003 组合表格组件渲染

```yaml
id: ST-003
title: 组合表格组件渲染
priority: P0
status: ready
depends_on: [ST-001, ST-002]
```

### 故事

作为报表使用者，我希望系统能将多个子表格无缝拼接为一个整体展示，每个子表格有灰色背景标题行，整体具有统一的主标题，且全局禁用排序/过滤/列管理/分页等操作，以便在一个紧凑的区域内呈现结构化的多表格数据。

### 验收标准

- `AC-1`: Given 组合表格配置含主标题和多个子表格，When 渲染，Then 主标题显示在顶部，样式与现有表格标题一致
- `AC-2`: Given 子表格配置含 dataProperties.title，When 渲染，Then 子表格标题渲染为灰色背景行，文字居中，与表格内容无缝衔接
- `AC-3`: Given 多个子表格，When 渲染，Then 子表格之间无间距（无 margin/padding），边框连贯，视觉上为一个整体
- `AC-4`: Given 组合表格，When 渲染，Then 全局禁用排序图标、过滤入口、列管理入口、分页控件
- `AC-5`: Given 子表格配置了 mergeColumns，When 渲染，Then 列合并功能与基础表格表现一致
- `AC-6`: Given 组件类型为 compositeTable，When 通过管道渲染，Then composite-table-handler 正确处理并输出组合表格

## ST-004 MergeColumnInfo模型扩展与fixture

```yaml
id: ST-004
title: MergeColumnInfo模型扩展与fixture
priority: P0
status: ready
depends_on: []
```

### 故事

作为开发者，我希望 MergeColumnInfo 接口扩展 isMergeValue 字段，并提供测试 fixtures，以便后续开发和测试有明确的输入数据。

### 验收标准

- `AC-1`: Given MergeColumnInfo 接口，Then 包含 title(必填)、columns(必填)、isMergeValue(可选，默认true) 三个字段
- `AC-2`: Given 创建了 table-merge-columns-value fixture，Then 包含值合并场景的完整配置
- `AC-3`: Given 创建了 table-merge-columns-header fixture，Then 包含表头合并场景的完整配置
- `AC-4`: Given 创建了 composite-table-basic fixture，Then 包含含主标题、2+子表格的完整配置
