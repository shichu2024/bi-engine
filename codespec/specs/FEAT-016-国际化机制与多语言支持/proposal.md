# FEAT-016: 国际化机制与多语言支持

## 问题

BI Engine 包中存在大量硬编码的中文字符串（图表类型标签、表格 UI 文案、空状态提示等），无法支持多语言场景。需要设计一套轻量级国际化机制，使消费方可以自由切换语言。

## 目标

- 设计一套零依赖、类型安全的 i18n 机制，集成到 bi-engine 包内部
- 将所有硬编码 UI 文案提取到 locale 文件中
- 默认支持中文（zh-CN）和英文（en-US）
- 提供 `locale` prop 让消费方控制语言
- Playground 提供语言切换测试入口，但 Playground 自身不需要国际化

## 范围

### 包含
- i18n 核心：LocaleProvider 上下文 + useLocale hook + 默认 locale 包
- 中英文词条文件（zh-CN / en-US）
- chart-switch.ts 中图表类型标签提取
- TableView.tsx 中所有 UI 文案提取（筛选、列管理、分页、空状态）
- text-handler.tsx 中错误消息提取
- BIEngine 组件新增 `locale` prop
- Playground 新增语言切换测试按钮
- 单元测试覆盖

### 不包含
- Playground 自身的国际化（仅提供测试切换功能）
- Fixture 测试数据的中英文切换（属于测试数据，非 UI 文案）
- 消费方自定义词条扩展（后续 feature）
- 日期/数字格式化（由消费方自行处理）

## 技术方案

### 核心设计

1. **Locale 包结构**：`src/locale/` 目录，包含类型定义、默认词条、Provider
2. **词条键设计**：使用点分隔命名空间（如 `chart.type.bar`、`table.filter.placeholder`）
3. **注入方式**：通过 React Context 在 BIEngine 层注入，内部组件通过 hook 消费
4. **零依赖**：不引入 i18next 等第三方库，使用原生 React Context

### 词条分布

| 模块 | 词条数 | 示例 |
|------|--------|------|
| chart types | 9 | chart.type.bar → "柱状图"/"Bar" |
| table filter | 3 | table.filter.placeholder → "输入筛选关键词" |
| table column manager | 6 | table.columnManager.title → "列管理" |
| table pagination | 2 | table.pagination.total → "共 {n} 条" |
| table empty states | 2 | table.empty.noData → "暂无数据" |
| error messages | 2 | error.unsupportedType → "不支持的组件类型" |

## 风险

- 词条键设计需要考虑未来扩展性，避免频繁重构
- Playground 的语言切换仅为测试用途，不应对引擎包产生负担
- 部分 UI 文案含插值（如 "共 {n} 条"），需要简单模板支持

## 用户价值

消费方可以在不同语言环境下使用 BI Engine，提升产品国际化能力。
