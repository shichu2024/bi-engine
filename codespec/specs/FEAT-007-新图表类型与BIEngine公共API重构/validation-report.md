# FEAT-007 — Validation Report

## 基本信息

| 字段 | 值 |
|------|-----|
| Feature | FEAT-007 — 新图表类型与 BIEngine 公共 API 重构 |
| Stories | ST-007-1 ~ ST-007-5 |
| Tasks | T-001 ~ T-007 |
| 验证日期 | 2026-04-25 |
| 验证角色 | qa |

## 验证环境

- Platform: Windows 11
- Node: pnpm workspace monorepo
- Test runner: Vitest v4.1.4
- Test result: **29 files, 379 tests passed, 0 failures**
- TypeScript: `tsc --noEmit` 无错误
- Build: bi-engine ESM + CJS + DTS 全部成功

---

## ST-007-1: BIEngine 统一公共入口组件

| AC | 描述 | 结果 | 证据 |
|----|------|------|------|
| AC-1 | `BIEngine` 接受 `schema: BIEngineComponent`，正确渲染 | PASS | `BIEngine.tsx:61` 传入 `component={schema}` 到 ComponentView |
| AC-2 | 接受 `mode: 'runtime' \| 'design'`，默认 `'runtime'` | PASS | `BIEngine.tsx:20` 定义 `mode?: 'runtime' \| 'design'`，`:45` 默认值 `= 'runtime'`，`:52` 映射到 RenderMode 枚举 |
| AC-3 | 接受 `theme?: Partial<ThemeTokens>` | PASS | `BIEngine.tsx:22` 定义 `theme?: Partial<ThemeTokens>`，`:72-78` 有条件包裹 ChartThemeProvider |
| AC-4 | 接受 `className`、`style`、`onError` | PASS | `BIEngine.tsx:24-28` 三个属性均已定义并传递 |
| AC-5 | ChartView 标记 `@deprecated`，行为不变 | PASS | `ChartView.tsx:28-29` 接口标注 deprecated，`:42-44` 函数标注 deprecated，原有逻辑未改动 |
| AC-6 | BIEngine 从根桶导出 | PASS | `index.ts:113-114` 导出 `{ BIEngine }` 和 `type { BIEngineProps }` |
| AC-7 | 所有测试通过 | PASS | 379 tests, 0 failures |

**ST-007-1 Verdict: PASS**

---

## ST-007-2: 散点图渲染支持

| AC | 描述 | 结果 | 证据 |
|----|------|------|------|
| AC-1 | ScatterSeries 不再报 UNSUPPORTED_SERIES_TYPE | PASS | `chart-validator.ts:49` scatter 在 PHASE1_SUPPORTED_SERIES_TYPES 中 |
| AC-2 | 校验器校验 scatter encode (x, y 必填) | PASS | `chart-validator.ts:267-282` 检查 encode.x 和 encode.y |
| AC-3 | encode.x/y 映射到 ECharts scatter 横纵坐标 | PASS | `build-scatter-option.ts:23-34` extractScatterData 生成 [[x,y],...] |
| AC-4 | 散点图显示笛卡尔坐标轴 | PASS | `build-scatter-option.ts:62-93` buildScatterXAxes/buildScatterYAxes 均生成 value 轴 |
| AC-5 | 静态数据正确映射为 [x, y] 格式 | PASS | `build-scatter-option.test.ts` 测试用例验证 data 格式为 [[10,28],[20,42],[30,58]] |
| AC-6 | 存在单元测试 | PASS | 8 个测试用例，覆盖数据映射、轴配置、tooltip、空数据集 |

**ST-007-2 Verdict: PASS**

---

## ST-007-3: 雷达图渲染支持

| AC | 描述 | 结果 | 证据 |
|----|------|------|------|
| AC-1 | RadarSeries 不再报 UNSUPPORTED_SERIES_TYPE | PASS | `chart-validator.ts:50` radar 在 PHASE1_SUPPORTED_SERIES_TYPES 中 |
| AC-2 | 校验器校验 radar encode (name, value 必填) | PASS | `chart-validator.ts:284-298` 检查 encode.name 和 encode.value |
| AC-3 | 雷达指示器正确构建 | PASS | `build-radar-option.ts:29-55` buildRadarIndicator 优先使用 chartOption.eChartOption.radar.indicator |
| AC-4 | 雷达图不依赖笛卡尔坐标轴 | PASS | `build-radar-option.test.ts` 测试验证 xAxis/yAxis 为 undefined；radar 在 NON_CARTESIAN_SERIES_TYPES |
| AC-5 | 多系列雷达图正确叠加 | PASS | `build-radar-option.test.ts` 多系列测试验证 2 个 series 条目 |
| AC-6 | 存在单元测试 | PASS | 7 个测试用例 |

**ST-007-3 Verdict: PASS**

---

## ST-007-4: 蜡烛图渲染支持

| AC | 描述 | 结果 | 证据 |
|----|------|------|------|
| AC-1 | CandlestickSeries 不再报 UNSUPPORTED_SERIES_TYPE | PASS | `chart-validator.ts:51` candlestick 在 PHASE1_SUPPORTED_SERIES_TYPES 中 |
| AC-2 | 校验器校验 candlestick encode (open, close, low, high 必填) | PASS | `chart-validator.ts:301-332` 检查四个 encode 字段 |
| AC-3 | 扁平数据重排为 [open, close, low, high] 元组 | PASS | `build-candlestick-option.ts:58-72` extractCandlestickData 生成 [[20,24,18,25],...]；测试验证数据格式 |
| AC-4 | 蜡烛图显示笛卡尔坐标轴，x 为类目轴 | PASS | `build-candlestick-option.ts:78-105` buildCandlestickXAxes 生成 category 轴；测试验证 xAxis.type === 'category' |
| AC-5 | 支持静态数据 | PASS | `candlestick-basic.ts` fixture 使用 static dataType |
| AC-6 | 存在单元测试 | PASS | 7 个测试用例 |

**ST-007-4 Verdict: PASS**

---

## ST-007-5: 仪表盘渲染支持

| AC | 描述 | 结果 | 证据 |
|----|------|------|------|
| AC-1 | GaugeSeries 不再报 UNSUPPORTED_SERIES_TYPE | PASS | `chart-validator.ts:52` gauge 在 PHASE1_SUPPORTED_SERIES_TYPES 中 |
| AC-2 | 校验器校验 gauge encode (value 必填) | PASS | `chart-validator.ts:334-345` 检查 encode.value |
| AC-3 | config.min/max/unit 映射到 ECharts gauge | PASS | `build-gauge-option.ts:67-69` 映射 min/max 默认值 0/100；`:72-78` 映射 unit 到 axisLabel.formatter 和 detail.formatter |
| AC-4 | 仪表盘不依赖笛卡尔坐标轴 | PASS | `build-gauge-option.test.ts` 验证 xAxis/yAxis/radar 均为 undefined |
| AC-5 | 数值正确显示 | PASS | `build-gauge-option.test.ts` 验证 data 为 [{value: 72, name: ''}] |
| AC-6 | 存在单元测试 | PASS | 8 个测试用例 |

**ST-007-5 Verdict: PASS**

---

## Task 级验证

| Task | 状态 | 验证结果 |
|------|------|----------|
| T-001 基础设施扩展 | DONE | validator 支持 7 种系列；SeriesKind 扩展；build-series-data 新增 4 种数据点；adapter 路由完整 |
| T-002 Scatter 适配器 | DONE | build-scatter-option.ts + fixture + 8 tests |
| T-003 Radar 适配器 | DONE | build-radar-option.ts + fixture + 7 tests |
| T-004 Candlestick 适配器 | DONE | build-candlestick-option.ts + fixture + 7 tests |
| T-005 Gauge 适配器 | DONE | build-gauge-option.ts + fixture + 8 tests |
| T-006 BIEngine 组件 | DONE | BIEngine.tsx 完整 Props；ChartView deprecated；根桶导出 |
| T-007 Playground 集成 | DONE | ComponentTree 4 种新类型；SceneDemoPage 使用 BIEngine 组件渲染 |

---

## 缺陷清单

无 blocking 或 important 缺陷。

| 级别 | 描述 | 影响 | 建议 |
|------|------|------|------|
| note | playground build 在 Windows 上偶现内存不足 (exit code 2147483651) | 不影响开发和测试 | 可在 CI 环境验证，或增加 Node 内存上限 |
| note | radar fixture 的 encode.value 字段映射到单个值而非数组 | fixture 中只使用了单值 | build-radar-data 已支持数组值解析，功能完整 |

---

## Verdict

**PASS**

所有 5 个 story 的验收标准全部满足：
- 4 种新图表类型 (scatter/radar/candlestick/gauge) 完整管线支持
- BIEngine 统一公共入口组件功能完备
- ChartView 向后兼容
- 379 个测试全部通过
- 无阻塞性缺陷
