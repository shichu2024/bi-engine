# FEAT-015 Stories

## ST-001: 图表类型切换映射表

**As a** BI 组件开发者
**I want** 一个纯函数可以根据当前图表类型返回可切换的目标类型列表
**So that** 切换 toolbar 可以正确渲染可用的切换图标

**验收标准：**
- bar → [bar, line, area, table]
- line → [bar, line, area, table]
- area (LineSeries subType) → [bar, line, area, table]
- pie → [pie, table]
- scatter → [scatter, table]
- radar → [radar, table]
- gauge → [gauge, table]
- candlestick → [candlestick, table]
- table → [] (空数组，不展示切换)

---

## ST-002: Schema 转换函数

**As a** BI 组件开发者
**I want** 一个纯函数可以将 chart schema 转换为目标类型的 schema
**So that** 用户点击切换图标后能正确切换组件类型

**验收标准：**
- bar ↔ line 互换：series.type 变化，保留 encode、data、columns
- line ↔ area 互换：LineSeries.subType 在 'area' 和 undefined 之间切换
- 任何 chart → table：从 columns 或 series.encode 推导 table columns，保留 data
- 切换后保持 componentId 不变
- 切换后保持 title 不变
- 不修改原始 schema（immutable）

---

## ST-003: 切换图标 SVG 组件

**As a** BI 组件开发者
**I want** 每种图表类型对应一个 SVG 图标组件
**So that** 切换 toolbar 可以直观展示各类型图标

**验收标准：**
- 柱状图图标（bar icon）
- 折线图图标（line icon）
- 面积图图标（area icon）
- 表格图标（table icon）
- 饼图图标（pie icon）
- 散点图图标（scatter icon）
- 雷达图图标（radar icon）
- 仪表盘图标（gauge icon）
- K线图图标（candlestick icon）
- 当前类型高亮显示（active state）
- 支持 theme 颜色

---

## ST-004: ChartSwitchToolbar 组件

**As a** BI 组件使用者
**I want** 一个切换工具栏组件显示在图表/表格上方
**So that** 我可以通过点击图标切换视图类型

**验收标准：**
- 根据 getSwitchableTypes 渲染对应图标
- 当前类型图标高亮（primary color + active background）
- 非当前类型图标为次要颜色
- hover 时有视觉反馈
- 点击触发 onSwitch 回调
- 不影响图表/表格的渲染区域
- 适配亮色/暗色主题

---

## ST-005: BIEngine onChartTypeChange 回调

**As a** BI 组件消费者
**I want** BIEngine 组件支持 onChartTypeChange 回调
**So that** 我可以接收切换后的新 schema 并控制组件状态

**验收标准：**
- BIEngineProps 新增 `onChartTypeChange?: (newSchema: BIEngineComponent) => void`
- 用户点击切换图标时触发回调
- 回调参数为转换后的新 schema
- 回调可选，不提供时切换无效果（或内部自动切换）
- 不破坏现有 BIEngine API 兼容性

---

## ST-006: 受控切换模式

**As a** BI 组件消费者
**I want** 可以通过外部传入 schema 控制当前显示的组件类型
**So that** 我可以在应用层管理组件状态

**验收标准：**
- BIEngine 接收外部 schema 变化时正确重新渲染
- 切换后 toolbar 高亮状态与实际渲染类型一致
- 表格视图不展示 toolbar
