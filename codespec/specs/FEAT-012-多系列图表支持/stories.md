# FEAT-012 Stories

## ST-001: 堆叠柱图 fixture 与渲染

**用户价值**: 展示同一类目下多系列柱体的堆叠效果，适用于总量-构成分析。

**验收标准**:
- [ ] 新增 `bar-stacked` fixture，包含 3 个 bar 系列
- [ ] 各系列配置 `stack` 属性（如 `'total'`）
- [ ] 注册到 `FIXTURE_REGISTRY`
- [ ] 通过 pipeline 全链路（validate → normalize → resolve → buildSeries → buildOption）无报错
- [ ] ECharts option 输出正确（含 stack 字段、正确图例、正确轴）
- [ ] 在 Playground bar 类目下可见并正确渲染

## ST-002: 多折线趋势图 fixture 与渲染

**用户价值**: 展示 3+ 系列的趋势对比，适用于多指标时序分析。

**验收标准**:
- [ ] 新增 `line-multi-trend` fixture，包含 3 条折线（不同于已有 line-multi 的 2 条）
- [ ] 注册到 `FIXTURE_REGISTRY`
- [ ] 通过 pipeline 全链路无报错
- [ ] ECharts option 输出正确（3 个 series、正确图例、tooltip）
- [ ] 在 Playground line 类目下可见并正确渲染

## ST-003: 混合柱线图 fixture 与渲染

**用户价值**: 展示柱状和折线混合在同一图表中，适用于量价对比等场景。

**验收标准**:
- [ ] 新增 `combo-bar-line` fixture，包含至少 1 个 bar 系列和 1 个 line 系列
- [ ] 确认 pipeline 能正确处理混合类型的 series（seriesKind 取首个系列类型）
- [ ] ECharts option 输出正确（含 bar 和 line 两种 series）
- [ ] 注册到 `FIXTURE_REGISTRY`（按 bar 分类，因为首个系列为 bar）
- [ ] 在 Playground bar 类目下可见并正确渲染

## ST-004: 多面积图 fixture 与渲染

**用户价值**: 展示多条面积线堆叠或不堆叠的效果，适用于流量构成分析。

**验收标准**:
- [ ] 新增 `line-area-multi` fixture，包含 2-3 个 area 系列
- [ ] 各系列 `subType: 'area'`
- [ ] 注册到 `FIXTURE_REGISTRY`
- [ ] 通过 pipeline 全链路无报错
- [ ] 在 Playground line 类目下可见并正确渲染
