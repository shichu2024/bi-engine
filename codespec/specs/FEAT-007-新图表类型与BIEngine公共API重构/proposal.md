# FEAT-007 — 新图表类型与 BIEngine 公共 API 重构

## Problem

bi-engine 当前仅支持 line、bar、pie 三种图表系列。权威模型（`bi-engine-models.ts`）已定义了 ScatterSeries、RadarSeries、GaugeSeries、CandlestickSeries 四种系列类型及其 encode 结构，但渲染管线会对其抛出 `UNSUPPORTED_SERIES_TYPE` 错误。

同时，当前对外暴露的 `ChartView` 组件仅面向图表场景，属性命名（`component`）语义不够通用，且缺少对 `mode`（运行态/设计态）和 `theme`（主题定制）的一等支持。消费者需要直接接触内部平台层（`ComponentView`、`RenderModeProvider` 等）才能获得完整能力。

## Goal

1. **补全图表渲染能力**：scatter、radar、candlestick、gauge 四种系列类型从"模型已定义但不可渲染"变为"完整渲染支持"，包含校验、归一化、数据解析、语义建模和 ECharts 适配器。
2. **提供统一公共入口**：引入 `BIEngine` 组件作为面向外部消费者的唯一入口，隐藏 pipeline 细节，以 `schema`、`mode`、`theme` 三个核心属性暴露能力。

## In Scope

- scatter 散点图的完整渲染管线与 ECharts 适配
- radar 雷达图的完整渲染管线与 ECharts 适配
- candlestick 蜡烛图的完整渲染管线与 ECharts 适配
- gauge 仪表盘的完整渲染管线与 ECharts 适配
- `BIEngine` 组件设计与实现（替代 `ChartView` 作为推荐入口）
- `ChartView` 标记为 `@deprecated`，保持向后兼容
- `BIEngineProps` 接口：`schema`（BI DSL）、`mode`（runtime/design）、`theme`（主题覆盖）
- playground 演示页面对新图表类型和 BIEngine 的更新

## Out of Scope

- 数据源动态加载（datasource/api 类型仍然 unsupported）
- 多 Y 轴、dataZoom、visualMap 等高级 ECharts 交互特性
- 自定义主题包的持久化与加载机制
- 服务端渲染（SSR）支持
- 非 ECharts 渲染器（Canvas、SVG 原生等）
- radar 雷达指示器（radar indicator）的自动推导算法（首期使用模型显式配置）

## Risks

| 风险 | 影响 | 缓解策略 |
|------|------|----------|
| radar 需要雷达指示器配置，权威模型未定义 radar.indicator | 可能需要扩展 schema | 首期通过 ChartOption.platform 扩展字段传递，不修改权威模型 |
| candlestick 需要将扁平数据重排为 [open, close, low, high] 元组 | 数据解析层复杂度增加 | 在 build-series-data 中新增专用数据点类型 |
| BIEngine 重命名可能影响现有消费者 | 破坏性变更 | 保留 ChartView 作为 deprecated alias，双版本共存 |
| gauge 的 min/max/unit 配置映射到 ECharts 时存在平台差异 | 适配器层可能不够通用 | 在 GaugeSeries.config 中已定义，直接映射 |

## Dependencies

- 依赖 FEAT-005 建立的 component handler + pipeline 架构（已完成）
- 依赖 FEAT-006 的 RenderMode 和 DesignableWrapper（已完成）

## Open Questions

1. `BIEngine` 的 `mode` 属性是否需要支持更多模式（如 `readonly`、`editable`），还是仅 `runtime` / `design` 两种？
2. radar 的雷达指示器配置是否应加入权威模型，还是继续通过 platform 扩展传递？
3. `theme` 属性是否应接受完整 ThemeTokens，还是仅接受 palette 覆盖？
