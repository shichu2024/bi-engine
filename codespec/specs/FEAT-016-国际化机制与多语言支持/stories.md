# FEAT-016 Stories

## ST-001: Locale 类型定义与默认词条

**As a** BI Engine 开发者
**I want** 一套类型安全的 locale 类型定义和默认中英文词条
**So that** 所有 UI 文案都有明确的键值映射，且编译期可检查

**验收标准：**
- 定义 `BILocale` 接口，覆盖所有 UI 文案键
- 提供 `zh-CN` 完整词条包
- 提供 `en-US` 完整词条包
- 词条类型为 `Record<string, string>` 或嵌套结构
- 支持简单插值模板（如 `{count}` 占位符）

---

## ST-002: LocaleProvider 与 useLocale

**As a** BI Engine 开发者
**I want** 一个 React Context 注入 locale，内部组件通过 hook 消费
**So that** 语言切换可以在 BIEngine 层统一控制，内部组件无感知

**验收标准：**
- `<LocaleProvider value={locale}>` 包裹引擎内部组件
- `useLocale()` hook 返回当前 locale 对象
- 默认值为 zh-CN
- 不引入第三方 i18n 库

---

## ST-003: BIEngine locale prop

**As a** BI Engine 消费者
**I want** BIEngine 组件支持 `locale` prop 来控制界面语言
**So that** 我可以在应用层切换引擎展示语言

**验收标准：**
- `BIEngineProps` 新增 `locale?: 'zh-CN' | 'en-US' | BILocale`
- 传入字符串时使用内置词条包
- 传入自定义 BILocale 对象时使用自定义词条
- 不传时默认 zh-CN
- 不破坏现有 API

---

## ST-004: chart-switch 词条提取

**As a** BI Engine 开发者
**I want** chart-switch.ts 中的图表类型标签从 locale 获取
**So that** 图表切换工具栏可以展示多语言标签

**验收标准：**
- 柱状图/折线图/面积图/表格等标签从 locale 获取
- 切换函数签名兼容（label 从外部注入或在渲染层获取）
- 原有 getSwitchableTypes 纯函数保持无副作用

---

## ST-005: TableView 词条提取

**As a** BI Engine 开发者
**I want** TableView.tsx 中所有硬编码中文文案从 locale 获取
**So that** 表格组件支持多语言展示

**验收标准：**
- 筛选弹窗：标题、输入提示、确定按钮
- 列管理弹窗：标题、可选列/已选列标题、空状态、取消/确认按钮
- 分页：共X条、X条/页
- 空状态：暂无可见列、暂无数据
- "No columns defined." 英文文案也从 locale 获取

---

## ST-006: Playground 语言切换测试

**As a** BI Engine 开发者
**I want** Playground 页面提供语言切换按钮
**So that** 我可以快速验证国际化效果

**验收标准：**
- Playground 新增语言切换按钮（zh-CN / en-US）
- 切换后所有 BI 组件 UI 文案跟随变化
- 切换不影响数据展示
- 仅在开发调试区域展示，不影响引擎包体积
