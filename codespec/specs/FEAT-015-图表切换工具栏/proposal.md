# FEAT-015: 图表切换工具栏

## 问题

当前 BI 组件的表格和图表是两种独立的组件类型，用户无法在表格视图和图表视图之间快速切换，也无法在不同图表类型之间转换。需要一种在组件头部 toolbar 展示可转换图标的方式，让用户一键切换视图。

## 目标

在 BI 组件的头部新增图表切换功能：
- 所有 ECharts 图表都可以转化为表格视图
- 柱状图、折线图、面积图三种图表类型可以互相转换
- 其他图表类型（饼图、散点图等）只能转换为表格
- 表格视图不展示切换功能

## 范围

### 包含
- 图表类型切换映射表（bar ↔ line ↔ area，任意图表 → table）
- 切换图标组件（SVG 图标 + 高亮状态）
- BIEngine 层面的 `onChartTypeChange` 回调机制
- ComponentView 层面渲染切换 toolbar
- 主题适配（亮色/暗色）

### 不包含
- 表格转图表（表格不展示切换功能）
- combo 类型的额外处理
- 设计态交互

## 技术方案

### 切换映射

| 当前类型 | 可切换到 |
|---------|---------|
| bar | line, area, table |
| line | bar, area, table |
| line(area) | bar, line, table |
| pie | table |
| scatter | table |
| radar | table |
| gauge | table |
| candlestick | table |
| table | 无（不展示切换） |

### 实现层次

1. **BIEngine 层**：新增 `onChartTypeChange` 回调 prop，接收切换后的新组件 schema
2. **ComponentView 层**：在 chart 渲染结果外包裹切换 toolbar
3. **ChartSwitchToolbar 组件**：独立的切换图标栏组件
4. **Schema 转换工具**：将当前 schema + 目标类型转为新 schema 的纯函数

## 风险

- 面积图在 Schema 中是 `LineSeries.subType='area'`，切换时需要正确处理 subType
- combo 类型（混合 bar+line）不在本次互换范围内
- 表格需要从 chart 的 data + columns + series 推导列定义

## 用户价值

用户可以在同一数据上快速切换不同可视化方式，提升数据分析效率。
