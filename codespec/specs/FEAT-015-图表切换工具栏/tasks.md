# FEAT-015 Tasks

## T-001: 实现 getSwitchableTypes 映射函数

**Write paths:** `packages/bi-engine/src/component-handlers/chart/chart-switch.ts`
**Verify:** unit test

- 创建 `chart-switch.ts` 文件
- 实现 `getSwitchableTypes(seriesKind: SeriesKind): SwitchTarget[]`
- SwitchTarget 类型定义: `{ type: SeriesKind | 'table', label: string }`
- 轴类图表 (bar, line, area) 返回 [bar, line, area, table]
- 其他图表返回 [self, table]
- table 返回空数组
- 面积图用 'area' 作为独立标识（区分于 line）

---

## T-002: 实现 convertChartSchema 转换函数

**Write paths:** `packages/bi-engine/src/component-handlers/chart/chart-switch.ts`
**Verify:** unit test

- 实现 `convertSchema(schema: BIEngineComponent, targetType: SwitchTarget['type']): BIEngineComponent`
- chart → chart: 转换 series.type 和 subType
  - bar → line: series.type = 'line', 移除 subType/stack
  - line → bar: series.type = 'bar', 移除 subType
  - line → area: series.type = 'line', subType = 'area'
  - area → line: series.type = 'line', 移除 subType
  - bar → area: series.type = 'line', subType = 'area'
  - area → bar: series.type = 'bar', 移除 subType
- chart → table: 构造 TableComponent
  - columns 从 series[0].encode 推导：x 字段 + 所有 y 字段
  - 如果有 dataProperties.columns 则优先使用
  - data 保持不变
  - type 改为 'table'
- 不修改原始 schema

---

## T-003: 实现图表类型 SVG 图标组件

**Write paths:** `packages/bi-engine/src/component-handlers/chart/chart-icons.tsx`
**Verify:** visual inspection + snapshot

- 创建 `chart-icons.tsx` 文件
- 实现 9 个 SVG 图标组件: BarIcon, LineIcon, AreaIcon, TableIcon, PieIcon, ScatterIcon, RadarIcon, GaugeIcon, CandlestickIcon
- 每个图标接受 `active?: boolean` 和 `color?: string` props
- 图标映射表 `CHART_TYPE_ICONS: Record<string, React.FC<IconProps>>`

---

## T-004: 实现 ChartSwitchToolbar 组件

**Write paths:** `packages/bi-engine/src/component-handlers/chart/ChartSwitchToolbar.tsx`
**Verify:** unit test + snapshot

- 创建 `ChartSwitchToolbar.tsx` 组件
- Props: `{ currentType: SeriesKind | 'table'; switchableTypes: SwitchTarget[]; onSwitch: (target: SwitchTarget) => void; theme?: ThemeTokens }`
- 渲染图标列表，当前类型高亮
- 样式使用 ThemeTokens
- 纯展示组件，不含业务逻辑

---

## T-005: 在 ComponentView 集成切换 toolbar

**Write paths:** `packages/bi-engine/src/react/ComponentView.tsx`
**Verify:** unit test

- ComponentView 中检测组件类型
- chart 类型: 从 pipelineResult.model.data 获取 seriesKind
- 根据 seriesKind 调用 getSwitchableTypes
- 如果有可切换类型，渲染 ChartSwitchToolbar + 原内容
- table 类型: 不渲染 toolbar
- 切换触发时调用上层回调

---

## T-006: BIEngine 新增 onChartTypeChange 回调

**Write paths:** `packages/bi-engine/src/react/BIEngine.tsx`
**Verify:** unit test

- BIEngineProps 新增 `onChartTypeChange?: (newSchema: BIEngineComponent) => void`
- 内部状态管理：当 onChartTypeChange 存在时，使用受控模式
- 当 onChartTypeChange 不存在时，使用内部 schema 状态（非受控模式）
- 将回调传递到 ComponentView

---

## T-007: 更新 ComponentViewProps 和导出

**Write paths:** `packages/bi-engine/src/react/ComponentView.tsx`, `packages/bi-engine/src/index.ts`
**Verify:** build passes

- ComponentViewProps 新增 onChartTypeChange 回调
- 新增内部 schema 状态管理
- 从 chart-switch 导出公共类型和函数
- 更新 index.ts barrel 导出

---

## T-008: 单元测试

**Write paths:** `packages/bi-engine/src/__tests__/handlers/chart-switch.test.ts`
**Verify:** tests pass

- getSwitchableTypes 各类型测试
- convertSchema 各转换路径测试
- immutable 断言（原始 schema 不被修改）
- 边界情况：combo 类型、多 series

---

## T-009: 集成验证

**Verify:** build + all tests pass

- `pnpm build:engine` 成功
- `pnpm test` 全部通过
- TypeScript 类型检查通过
