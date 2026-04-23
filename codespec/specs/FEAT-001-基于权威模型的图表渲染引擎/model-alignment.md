# 权威模型对齐说明

## 1. 唯一 schema 来源

当前特性的唯一权威 schema 是：

- [模型定义汇总.ts](./模型定义汇总.ts)

后续设计和实现必须以这份文件为准，不再另建平行 DSL。

## 2. 强制对齐规则

- 保留原始接口名、类型名、枚举名、字段名。
- 不新增与之平行的 `ChartSpec`、`FieldBinding`、`ChartType` 抽象。
- 允许在实现层定义内部语义模型，但输入输出契约必须仍然围绕权威模型。
- 实现层如果只支持权威模型的一个子集，必须通过“结构化 unsupported”表达，而不是修改 schema。
- 包名使用 `bi-engine`，因为长期宿主是 `BIEngineComponent`，而不只是 chart。

## 3. 首阶段强支持的模型子集

### 3.1 组件级

- `ChartComponent`

### 3.2 数据级

- `ChartDataProperty`
- `dataProperties.dataType = 'static'`
- `dataProperties.data`
- `dataProperties.columns`
- `dataProperties.series`

### 3.3 图表级

- `Axis`
- `ChartOption`

### 3.4 系列级

- `LineSeries`
- `BarSeries`
- `PieSeries`

## 4. 首阶段保留但不执行的能力

这些能力在 schema 中必须保留，但首阶段只做识别与报错，不做完整执行：

- `dataType = 'datasource' | 'api'`
- `ScatterSeries`
- `RadarSeries`
- `GaugeSeries`
- `CandlestickSeries`
- `interactions`
- `TextComponent`
- `TableComponent`
- `MarkdownComponent`
- `CompositeTable`

## 5. 推荐实现映射

建议在新项目里把权威模型文件镜像到：

```text
packages/bi-engine/src/schema/bi-engine-models.ts
```

镜像规则：

- 字段完全一致
- 类型名完全一致
- 允许补充 barrel export
- 不允许语义改名

## 6. 运行时输入契约

首阶段图表运行时推荐围绕这个契约设计：

```ts
component: ChartComponent
```

而不是：

```ts
spec: ChartSpec
rows: Record<string, unknown>[]
```

如果运行时需要外部注入数据，也只能作为 `ChartComponent` 的补充执行机制，而不能取代权威模型本身。

## 7. 校验要求

至少需要校验：

- `component.type === 'chart'`
- `dataProperties` 存在
- `series` 存在且首阶段只接受 `line / bar / pie`
- `xAxis / yAxis` 与 series encode 的关系正确
- `pie` 不误用笛卡尔轴
- `dataType = 'static'` 时 `data` 可用
- `datasource / api` 在首阶段返回结构化 unsupported

## 8. 后续扩展原则

未来即使扩展 `datasource / api / interaction / scatter / radar / gauge`，也必须继续建立在同一份权威模型上，而不是借扩展机会重新塑形。
