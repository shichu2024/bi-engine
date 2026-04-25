# FEAT-007 — Tasks

## 依赖总览

```
T-001 (基础设施)
  ├──→ T-002 (scatter 适配器)  ──┐
  ├──→ T-003 (radar 适配器)    ──┤
  ├──→ T-004 (candlestick 适配器) ──┼──→ T-007 (集成验证)
  └──→ T-005 (gauge 适配器)    ──┘
T-006 (BIEngine 组件) ──────────────────→ T-007 (集成验证)
```

并行条件：T-002~T-005 之间 write_paths 不重叠，T-001 完成后可全部并行。T-006 无前置依赖，可与 T-001 并行。

---

## T-001: 管线基础设施扩展

**objective**: 扩展 chart handler pipeline 的校验器、语义模型、数据构建和适配器路由，使 scatter/radar/candlestick/gauge 四种系列类型通过管线前端校验和数据解析，不再抛出 UNSUPPORTED_SERIES_TYPE 错误。

**stories**: ST-007-2, ST-007-3, ST-007-4, ST-007-5（共享基础设施部分）

**depends_on**: 无

**read_paths**:
- `packages/bi-engine/src/component-handlers/chart/chart-validator.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-normalizer.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-resolver.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`
- `packages/bi-engine/src/component-handlers/chart/build-series-data.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-handler.tsx`
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`
- `packages/bi-engine/src/adapters/echarts/build-line-option.ts`
- `packages/bi-engine/src/adapters/echarts/build-pie-option.ts`
- `packages/bi-engine/src/schema/bi-engine-models.ts`
- `packages/bi-engine/src/roadmap/unsupported-series-map.ts`

**write_paths**:
- `packages/bi-engine/src/component-handlers/chart/chart-validator.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`
- `packages/bi-engine/src/component-handlers/chart/build-series-data.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-normalizer.ts`
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`

**interface_contract**:
```typescript
// chart-validator.ts
// PHASE1_SUPPORTED_SERIES_TYPES 扩展为包含 scatter/radar/candlestick/gauge
// 新增 scatter/radar/candlestick/gauge 的 encode 校验规则：
//   - scatter: { x, y } 必填，xAxisIndex/yAxisIndex 可选
//   - radar: { name, value } 必填
//   - candlestick: { open, close, low, high } 必填
//   - gauge: { value } 必填
// scatter/candlestick 归类为 CARTESIAN_SERIES_TYPES（需坐标轴）
// radar/gauge 归类为非笛卡尔（不需坐标轴）

// chart-semantic-model.ts
// SeriesKind 扩展为 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'candlestick' | 'gauge'

// build-series-data.ts
// 新增数据点类型：
//   ScatterDataPoint: { x: number; y: number }
//   RadarDataPoint: { name: string; value: number[] }
//   CandlestickDataPoint: { open: number; close: number; low: number; high: number; x?: string }
//   GaugeDataPoint: { value: number }
// 新增 Dataset 类型：
//   ScatterSeriesDataset, RadarSeriesDataset, CandlestickSeriesDataset, GaugeSeriesDataset
// buildSeriesData 函数扩展：根据 series.type 分发到对应的数据提取逻辑

// chart-normalizer.ts
// isCartesianChart 判断扩展：scatter/candlestick 为 cartesian，radar/gauge 为非 cartesian

// echarts-adapter.ts (adapt 方法路由)
// 新增 scatter/radar/candlestick/gauge 分支，暂返回空壳 option（适配器实现在 T-002~T-005）
```

**verify**:
- `pnpm build:engine` 通过
- `pnpm test` 现有测试全部通过
- 传入包含 ScatterSeries/RadarSeries/CandlestickSeries/GaugeSeries 的 ChartComponent 时，校验不再报错
- buildSeriesData 对四种新类型返回正确的 dataset 结构

**out_of_scope**:
- 不实现具体的 ECharts 选项构建（由 T-002~T-005 完成）
- 不修改权威模型 bi-engine-models.ts（类型已定义完毕）
- 不创建测试 fixture 文件（由 T-002~T-005 各自创建）

---

## T-002: Scatter 散点图适配器

**objective**: 实现 scatter 类型的 ECharts 选项构建函数，使散点图可以正确渲染。

**stories**: ST-007-2

**depends_on**: T-001

**read_paths**:
- `packages/bi-engine/src/adapters/echarts/build-line-option.ts`（参考 cartesian 适配模式）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`
- `packages/bi-engine/src/component-handlers/chart/build-series-data.ts`
- `packages/bi-engine/tests/adapters/build-bar-option.test.ts`（参考测试模式）

**write_paths**:
- `packages/bi-engine/src/adapters/echarts/build-scatter-option.ts`（新建）
- `packages/bi-engine/src/testing/fixtures/scatter-basic.ts`（新建）
- `packages/bi-engine/tests/adapters/build-scatter-option.test.ts`（新建）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`（更新 scatter 分支调用）

**interface_contract**:
```typescript
// build-scatter-option.ts
export function buildScatterOption(model: ChartSemanticModel): Record<string, unknown>
// 输入：ChartSemanticModel（seriesKind='scatter'，axes 含 xAxis/yAxis，dataset 含 ScatterSeriesDataset）
// 输出：ECharts option 对象，包含：
//   - xAxis[]: 数值轴（type: 'value'）
//   - yAxis[]: 数值轴
//   - series[]: type='scatter'，data 为 [[x1,y1], [x2,y2], ...]
//   - tooltip: trigger='item'
//   - legend: 系列名称
// 参考 build-line-option.ts 中 extractCategoryData / buildXAxes / buildYAxes 的模式
```

**verify**:
- `pnpm build:engine` 通过
- scatter fixture 传入后生成合法 ECharts option
- series.data 格式为 `[[x, y], ...]`
- 双轴正确配置为 value 类型
- 适配器路由正确调用 buildScatterOption

**out_of_scope**:
- symbolSize / itemStyle 高级配置
- 多坐标轴分组（scatter 的 xAxisIndex/yAxisIndex 暂不实现）

---

## T-003: Radar 雷达图适配器

**objective**: 实现 radar 类型的 ECharts 选项构建函数，包含雷达指示器配置。

**stories**: ST-007-3

**depends_on**: T-001

**read_paths**:
- `packages/bi-engine/src/adapters/echarts/build-pie-option.ts`（参考非 cartesian 模式）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`
- `packages/bi-engine/src/component-handlers/chart/build-series-data.ts`
- `packages/bi-engine/src/schema/bi-engine-models.ts`（RadarSeries 定义）
- `packages/bi-engine/tests/adapters/build-pie-option.test.ts`

**write_paths**:
- `packages/bi-engine/src/adapters/echarts/build-radar-option.ts`（新建）
- `packages/bi-engine/src/testing/fixtures/radar-basic.ts`（新建）
- `packages/bi-engine/tests/adapters/build-radar-option.test.ts`（新建）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`（更新 radar 分支调用）

**interface_contract**:
```typescript
// build-radar-option.ts
export function buildRadarOption(model: ChartSemanticModel): Record<string, unknown>
// 输入：ChartSemanticModel（seriesKind='radar'，无笛卡尔轴，dataset 含 RadarSeriesDataset）
// 输出：ECharts option 对象，包含：
//   - radar: { indicator: [{ name, max }, ...] } — 指示器配置
//     indicator 来源：ChartOption.platform.radar.indicator 或从数据列推导
//   - series[]: type='radar'，data 为 [{ value: [v1, v2, ...], name: seriesName }]
//   - tooltip: trigger='item'
//   - legend: 系列名称
// 注意：radar 不使用 xAxis/yAxis
```

**verify**:
- `pnpm build:engine` 通过
- radar fixture 传入后生成合法 ECharts option
- radar.indicator 正确生成
- series.data 格式为 `[{ value: number[], name: string }]`
- 多系列雷达图正确叠加

**out_of_scope**:
- radar indicator 自动推导算法（首期使用显式配置）
- radar 形状配置（polygon/circle）

---

## T-004: Candlestick 蜡烛图适配器

**objective**: 实现 candlestick 类型的 ECharts 选项构建函数，将扁平数据重排为 OHLC 元组。

**stories**: ST-007-4

**depends_on**: T-001

**read_paths**:
- `packages/bi-engine/src/adapters/echarts/build-line-option.ts`（参考 cartesian + category 轴模式）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`
- `packages/bi-engine/src/component-handlers/chart/build-series-data.ts`
- `packages/bi-engine/src/schema/bi-engine-models.ts`（CandlestickSeries 定义）

**write_paths**:
- `packages/bi-engine/src/adapters/echarts/build-candlestick-option.ts`（新建）
- `packages/bi-engine/src/testing/fixtures/candlestick-basic.ts`（新建）
- `packages/bi-engine/tests/adapters/build-candlestick-option.test.ts`（新建）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`（更新 candlestick 分支调用）

**interface_contract**:
```typescript
// build-candlestick-option.ts
export function buildCandlestickOption(model: ChartSemanticModel): Record<string, unknown>
// 输入：ChartSemanticModel（seriesKind='candlestick'，axes 含 category x 轴，dataset 含 CandlestickSeriesDataset）
// 输出：ECharts option 对象，包含：
//   - xAxis[]: type='category'，data 为时间/类目标签
//   - yAxis[]: type='value'
//   - series[]: type='candlestick'，data 为 [[open, close, low, high], ...]
//   - tooltip: trigger='axis'
//   - legend: 系列名称
// 关键：数据从扁平 { open, close, low, high, x } 重排为 [open, close, low, high] 元组
```

**verify**:
- `pnpm build:engine` 通过
- candlestick fixture 传入后生成合法 ECharts option
- series.data 格式为 `[[open, close, low, high], ...]`
- xAxis 正确配置为 category 轴
- 数据重排逻辑正确

**out_of_scope**:
- K 线图样式自定义（涨跌颜色等）
- dataZoom 缩放交互

---

## T-005: Gauge 仪表盘适配器

**objective**: 实现 gauge 类型的 ECharts 选项构建函数，映射 config.min/max/unit。

**stories**: ST-007-5

**depends_on**: T-001

**read_paths**:
- `packages/bi-engine/src/adapters/echarts/build-pie-option.ts`（参考非 cartesian 单值模式）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`
- `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`
- `packages/bi-engine/src/component-handlers/chart/build-series-data.ts`
- `packages/bi-engine/src/schema/bi-engine-models.ts`（GaugeSeries 定义）

**write_paths**:
- `packages/bi-engine/src/adapters/echarts/build-gauge-option.ts`（新建）
- `packages/bi-engine/src/testing/fixtures/gauge-basic.ts`（新建）
- `packages/bi-engine/tests/adapters/build-gauge-option.test.ts`（新建）
- `packages/bi-engine/src/adapters/echarts/echarts-adapter.ts`（更新 gauge 分支调用）

**interface_contract**:
```typescript
// build-gauge-option.ts
export function buildGaugeOption(model: ChartSemanticModel): Record<string, unknown>
// 输入：ChartSemanticModel（seriesKind='gauge'，无笛卡尔轴，dataset 含 GaugeSeriesDataset）
// 输出：ECharts option 对象，包含：
//   - series[]: type='gauge'，data 为 [{ value: number, name: seriesName }]
//   - series[0].min: config.min ?? 0
//   - series[0].max: config.max ?? 100
//   - series[0].axisLabel.formatter: 含 config.unit 的格式化
//   - tooltip: trigger='item'
// 注意：gauge 不使用 xAxis/yAxis/radar
```

**verify**:
- `pnpm build:engine` 通过
- gauge fixture 传入后生成合法 ECharts option
- config.min/max/unit 正确映射
- 数值正确显示在指针位置

**out_of_scope**:
- 仪表盘样式自定义（指针颜色、刻度样式等）
- 多仪表盘组合布局

---

## T-006: BIEngine 统一公共入口组件

**objective**: 创建 BIEngine 组件作为面向外部消费者的推荐入口，封装 mode/theme 支持，保留 ChartView 作为 @deprecated 别名。

**stories**: ST-007-1

**depends_on**: 无（与 T-001 可并行）

**read_paths**:
- `packages/bi-engine/src/react/ChartView.tsx`
- `packages/bi-engine/src/react/ComponentView.tsx`
- `packages/bi-engine/src/platform/render-mode.ts`
- `packages/bi-engine/src/theme/theme-tokens.ts`
- `packages/bi-engine/src/theme/chart-theme-context.tsx`
- `packages/bi-engine/src/schema/bi-engine-models.ts`（BIEngineComponent 联合类型）
- `packages/bi-engine/src/index.ts`
- `packages/bi-engine/tests/react/chart-view.test.tsx`

**write_paths**:
- `packages/bi-engine/src/react/BIEngine.tsx`（新建）
- `packages/bi-engine/src/react/ChartView.tsx`（更新：添加 @deprecated 注释，改为 BIEngine 别名）
- `packages/bi-engine/src/index.ts`（更新导出）
- `packages/bi-engine/tests/react/bi-engine.test.tsx`（新建）

**interface_contract**:
```typescript
// BIEngine.tsx
export interface BIEngineProps {
  /** BI 标准 DSL，描述待渲染的组件 */
  schema: BIEngineComponent;
  /** 渲染模式：'runtime'（默认）或 'design' */
  mode?: 'runtime' | 'design';
  /** 主题覆盖：传入 Partial<ThemeTokens> 覆盖默认主题 */
  theme?: Partial<ThemeTokens>;
  /** 自定义 CSS 类名 */
  className?: string;
  /** 自定义内联样式 */
  style?: React.CSSProperties;
  /** 错误回调 */
  onError?: (error: { code: string; message: string }) => void;
  /** 设计态选中回调 */
  onSelect?: (componentId: string) => void;
}

export function BIEngine(props: BIEngineProps): React.ReactElement;

// 实现要点：
// 1. 用 RenderModeProvider 包裹，传入 mode（默认 'runtime'）
// 2. 用 ChartThemeProvider 包裹，传入 theme 覆盖
// 3. 内部渲染 ComponentView（传入 schema 作为 component）
// 4. 导出 BIEngine 和 BIEngineProps
```

**verify**:
- `pnpm build:engine` 通过
- `pnpm test` 现有测试通过（ChartView 行为不变）
- BIEngine 组件接受 schema/mode/theme 并正确渲染
- ChartView 标记为 @deprecated，功能不回归
- 根桶导出 BIEngine 和 BIEngineProps

**out_of_scope**:
- 主题字符串解析（theme 属性仅接受 Partial<ThemeTokens>）
- 主题持久化与加载
- SSR 支持

---

## T-007: Playground 集成与全量验证

**objective**: 在 playground 中添加四种新图表类型的演示场景，使用 BIEngine 组件，并执行全量构建和测试验证。

**stories**: ST-007-1~5（集成验证）

**depends_on**: T-001, T-002, T-003, T-004, T-005, T-006

**read_paths**:
- `apps/bi-playground/src/` 全局
- `packages/bi-engine/src/index.ts`
- `packages/bi-engine/src/testing/fixtures/` 全部 fixture

**write_paths**:
- `apps/bi-playground/src/components/demo/` 下的演示组件（按需新增或修改）
- `apps/bi-playground/src/pages/` 下的页面文件（按需修改）

**interface_contract**:
```typescript
// Playground 演示更新要求：
// 1. 新增 scatter/radar/candlestick/gauge 的演示场景
// 2. 使用 BIEngine 组件替代 ChartView（演示新 API）
// 3. 每种图表类型至少一个基础 demo
// 4. 侧边栏组件树中新增四种图表类型入口
```

**verify**:
- `pnpm build:engine` 通过
- `pnpm test` 全部通过
- `pnpm dev:playground` 可正常启动
- 四种新图表在 playground 中可正确渲染
- BIEngine 组件在 playground 中正确使用

**out_of_scope**:
- playground 大幅 UI 改版
- 复杂交互 demo（dataZoom、联动等）

---

## Traceability

| Task | Stories | AC 覆盖 |
|------|---------|---------|
| T-001 | ST-007-2~5 共享 | AC-1（不再报错）的基础前提 |
| T-002 | ST-007-2 | AC-1~6 |
| T-003 | ST-007-3 | AC-1~6 |
| T-004 | ST-007-4 | AC-1~6 |
| T-005 | ST-007-5 | AC-1~6 |
| T-006 | ST-007-1 | AC-1~7 |
| T-007 | ST-007-1~5 | 集成验证 |
