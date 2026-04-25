---
id: ST-001
title: 全局标准化基础 Option 模板
priority: P0
status: draft
dependencies: []
---

## Story

作为 BI 引擎开发者，我希望有一套全局标准化的 ECharts 基础 Option 配置模板，使得所有图表类型共享统一的字体、配色、间距和通用组件（tooltip、legend、grid、title）样式，保证视觉一致性。

## Acceptance Criteria

- **AC-1**: 存在 `base-option.ts` 文件，导出 `getBaseOption()` 函数，返回包含 `color`、`textStyle`、`title`、`tooltip`、`legend`、`grid` 标准化配置的对象
- **AC-2**: 字体族为 `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`，标题字号 14px、图例 12px、坐标轴标签 12px
- **AC-3**: 色板至少包含 8 色，无高饱和度颜色
- **AC-4**: grid 默认 `{ left: 60, right: 40, top: 60, bottom: 40, containLabel: true }`
- **AC-5**: tooltip 统一背景色 `#fff`、边框 `#e0e0e0`、阴影 `0 4px 12px rgba(0,0,0,0.1)`
- **AC-6**: legend 默认底部居中、水平排列、单条时自动隐藏

---

---
id: ST-002
title: 分图表类型标准化 Option 模板
priority: P0
status: draft
dependencies: [ST-001]
---

## Story

作为 BI 引擎开发者，我希望每种图表类型都有独立的标准化 Option 模板，继承全局基础配置并补充图表特有配置（如折线平滑、柱状圆角、饼图防溢出），实现开箱即用。

## Acceptance Criteria

- **AC-1**: 为 line/bar/pie/scatter/radar/candlestick/gauge 各提供一个模板函数
- **AC-2**: 折线图模板包含 `smooth: false`、标记点默认样式、`connectNulls: true`
- **AC-3**: 柱状图模板包含柱宽自适应（`barMaxWidth: 40`）、圆角 `borderRadius: 4`
- **AC-4**: 饼图模板包含 `avoidLabelOverlap: true`、标签引导线规范、环形图 `radius: ['40%', '70%']`
- **AC-5**: 雷达图模板包含指示器名称样式、分隔线统一、面积半透明填充
- **AC-6**: 散点图模板包含默认 `symbolSize: 10`
- **AC-7**: 仪表盘模板包含指针和轴线样式默认值
- **AC-8**: 蜡烛图模板包含红涨绿跌配色

---

---
id: ST-003
title: 深度合并工具与扩展接口
priority: P0
status: draft
dependencies: [ST-001]
---

## Story

作为 BI 引擎的消费者（业务开发者/AI/设计器），我希望通过传入标准 ECharts Option 对象与基础模板配置合并，支持增量合并和全量覆盖两种模式，扩展配置优先级高于基础配置。

## Acceptance Criteria

- **AC-1**: 提供 `deepMergeOption(base, extension)` 函数，支持递归深度合并对象
- **AC-2**: 数组类型字段使用 extension 的值直接替换（不按索引合并）
- **AC-3**: 提供 `MergeMode` 类型，支持 `'merge'`（增量合并）和 `'override'`（全量覆盖）两种模式
- **AC-4**: `merge` 模式下 extension 的属性覆盖 base 的同名属性，base 中未指定的属性保留
- **AC-5**: `override` 模式下直接返回 extension，忽略 base
- **AC-6**: TypeScript 类型完整，输入输出均为 `EChartsOption` 类型

---

---
id: ST-004
title: 异常场景兜底优化
priority: P0
status: draft
dependencies: [ST-001, ST-002]
---

## Story

作为 BI 引擎使用者，我希望图表在空数据、单数据、海量数据等异常场景下展示正常，无报错、无排版错乱。

## Acceptance Criteria

- **AC-1**: 空数据时显示居中提示文案"暂无数据"，字号 14px，颜色 `#999`
- **AC-2**: 坐标轴 `min/max` 自适应数据范围，不超出可视区域
- **AC-3**: 饼图/雷达图标签 `avoidLabelOverlap: true`，防止标签重叠
- **AC-4**: 图表容器通过 ResizeObserver 自动适配尺寸变化（已有实现，确保不受影响）

---

---
id: ST-005
title: 集成到现有构建流程与测试
priority: P0
status: draft
dependencies: [ST-002, ST-003, ST-004]
---

## Story

作为 BI 引擎维护者，我希望标准化模板和合并工具能无缝集成到现有 ECharts 适配器构建流程中，且所有功能有充分的单元测试覆盖。

## Acceptance Criteria

- **AC-1**: 各 builder（buildLineOption 等）输出的 option 已包含标准化模板的基础配置
- **AC-2**: `mergeChartOption` 改用深度合并工具替代原有浅合并
- **AC-3**: `buildEChartsOption` 入口函数不变，对外接口保持兼容
- **AC-4**: 新增代码有对应的单元测试，覆盖率 >= 80%
- **AC-5**: 现有 53 个测试全部通过，无回归
