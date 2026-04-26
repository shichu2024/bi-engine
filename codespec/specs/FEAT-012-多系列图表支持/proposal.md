# FEAT-012: 多系列图表支持

## 问题

柱状图和折线图的多系列功能在引擎层面已实现（schema、pipeline、ECharts builders 均支持），但缺乏足够丰富的多系列示例来展示和验证这一能力。Playground 中仅有 `line-multi` 和 `bar-multi` 两个基础多系列 fixture，无法覆盖常见业务场景。

## 目标

1. 扩充多系列图表 fixture，覆盖常见业务场景（堆叠柱图、多面积图、混合图表等）
2. 确保 Playground 能正确展示所有新增多系列示例
3. 补充对应的单元测试和集成测试

## 范围

### 包含
- 新增多系列 fixture（堆叠柱图、多折线趋势、混合柱线图、多面积图）
- 注册到 fixture-registry
- Playground 自动继承（通过 `getUnifiedFixturesByKind`）
- 对应的 pipeline 和 ECharts option 构建测试

### 不包含
- 数据源动态查询（仅 static dataType）
- 新增图表类型
- 破坏性 API 变更
- 交互式图例/缩放等高级 ECharts 特性

## 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 堆叠柱图需要 stack 属性支持 | 若 schema 不支持需扩展 | BarSeries.encode 已有 stack 支持，需确认 |
| 混合图表类型需要单一 seriesKind 外的多类型 | seriesKind 为首个系列类型 | 验证 pipeline 是否正确处理混合类型 |

## 用户价值

BI 用户可以直观看到多系列图表的实际效果，开发者可以通过 fixture 快速复用多系列配置模式。
