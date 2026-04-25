# FEAT-007 — Stories

## ST-007-1: BIEngine 统一公共入口组件

**用户价值**：外部消费者通过一个语义清晰的组件即可使用 bi-engine 的全部渲染能力，无需关心内部 pipeline、registry 或平台层细节。

**描述**：将当前 `ChartView` 重构为 `BIEngine` 组件，作为面向外部消费者的推荐入口。`ChartView` 保留为 `@deprecated` 别名以维持向后兼容。

**验收标准**：

- AC-1：`BIEngine` 组件接受 `schema: BIEngineComponent` 属性（语义等同于原 `component`），能正确渲染所有已注册的组件类型
- AC-2：`BIEngine` 接受 `mode: 'runtime' | 'design'` 属性，控制渲染模式；缺省值为 `'runtime'`
- AC-3：`BIEngine` 接受 `theme?: Partial<ThemeTokens> | string` 属性，支持主题 token 覆盖
- AC-4：`BIEngine` 同时接受 `className`、`style`、`onError` 等通用属性
- AC-5：原有 `ChartView` 保持可用，标注 `@deprecated`，行为不变
- AC-6：`BIEngine` 从根桶 `packages/bi-engine/src/index.ts` 正式导出
- AC-7：现有所有测试通过，无回归

**依赖**：无（与 ST-007-2~5 可并行）

---

## ST-007-2: 散点图渲染支持

**用户价值**：BI 报告开发者可以在同一 DSL 框架内创建散点图，用于展示两个数值维度之间的相关性和分布。

**描述**：为 ScatterSeries 类型提供完整的渲染管线支持，从校验到 ECharts 输出。

**验收标准**：

- AC-1：传入 `ChartComponent` 包含 `ScatterSeries` 时，不再抛出 `UNSUPPORTED_SERIES_TYPE` 错误
- AC-2：校验器正确校验 scatter 的 encode 结构（`x`、`y` 必填，`xAxisIndex`/`yAxisIndex` 可选）
- AC-3：渲染器正确将 encode.x 和 encode.y 映射到 ECharts scatter 系列的横纵坐标
- AC-4：散点图正确显示笛卡尔坐标轴（xAxis / yAxis）
- AC-5：支持静态数据（`dataType: 'static'`），数据点正确映射为 `[x, y]` 格式
- AC-6：存在对应的单元测试覆盖校验、数据解析和选项构建

**依赖**：无基础设施依赖，但与 ST-007-3/4/5 共享校验器和语义模型的扩展点

---

## ST-007-3: 雷达图渲染支持

**用户价值**：BI 报告开发者可以创建雷达图，用于多维度指标对比（如能力评估、KPI 仪表板）。

**描述**：为 RadarSeries 类型提供完整的渲染管线支持。

**验收标准**：

- AC-1：传入 `ChartComponent` 包含 `RadarSeries` 时，不再抛出 `UNSUPPORTED_SERIES_TYPE` 错误
- AC-2：校验器正确校验 radar 的 encode 结构（`name`、`value` 必填）
- AC-3：渲染器正确构建雷达指示器（radar indicator）配置，维度来自数据列元数据或 ChartOption.platform 扩展
- AC-4：雷达图不依赖笛卡尔坐标轴
- AC-5：支持静态数据，多系列雷达图正确叠加显示
- AC-6：存在对应的单元测试

**依赖**：无

---

## ST-007-4: 蜡烛图渲染支持

**用户价值**：BI 报告开发者可以创建 K 线图（蜡烛图），用于金融场景下的开盘/收盘/最高/最低价格展示。

**描述**：为 CandlestickSeries 类型提供完整的渲染管线支持。

**验收标准**：

- AC-1：传入 `ChartComponent` 包含 `CandlestickSeries` 时，不再抛出 `UNSUPPORTED_SERIES_TYPE` 错误
- AC-2：校验器正确校验 candlestick 的 encode 结构（`open`、`close`、`low`、`high` 四个字段必填）
- AC-3：渲染器将扁平数据记录正确重排为 ECharts 所需的 `[open, close, low, high]` 元组格式
- AC-4：蜡烛图正确显示笛卡尔坐标轴，x 轴为类目/时间轴
- AC-5：支持静态数据
- AC-6：存在对应的单元测试

**依赖**：无

---

## ST-007-5: 仪表盘渲染支持

**用户价值**：BI 报告开发者可以创建仪表盘图表，用于单一 KPI 指标的可视化展示（如完成率、速度、温度等）。

**描述**：为 GaugeSeries 类型提供完整的渲染管线支持。

**验收标准**：

- AC-1：传入 `ChartComponent` 包含 `GaugeSeries` 时，不再抛出 `UNSUPPORTED_SERIES_TYPE` 错误
- AC-2：校验器正确校验 gauge 的 encode 结构（`value` 必填）
- AC-3：渲染器正确将 `GaugeSeries.config.min`、`config.max`、`config.unit` 映射到 ECharts gauge 选项
- AC-4：仪表盘不依赖笛卡尔坐标轴
- AC-5：支持静态数据，数值正确显示在仪表盘指针位置
- AC-6：存在对应的单元测试

**依赖**：无

---

## 依赖关系

```
ST-007-1 (BIEngine)  ←→  ST-007-2/3/4/5 (四种图表)
     ↕ 可并行              ↕ 可并行（共享基础设施扩展）
```

- ST-007-1 与 ST-007-2~5 无硬依赖，可并行实施
- ST-007-2~5 之间无硬依赖，但共享校验器和语义模型的扩展点，TA 需注意任务拆解时的合并策略

## Traceability

| Story | 对应 Proposal 范围 | 来源 |
|-------|---------------------|------|
| ST-007-1 | Goal #2：统一公共入口 | 用户需求原文 #2 |
| ST-007-2 | Goal #1：scatter 散点图 | 用户需求原文 #1 |
| ST-007-3 | Goal #1：radar 雷达图 | 用户需求原文 #1 |
| ST-007-4 | Goal #1：candlestick 蜡烛图 | 用户需求原文 #1 |
| ST-007-5 | Goal #1：gauge 仪表盘 | 用户需求原文 #1 |
