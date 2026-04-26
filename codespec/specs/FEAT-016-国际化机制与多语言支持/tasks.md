# FEAT-016 Tasks

## T-001: 创建 locale 类型定义与词条文件

**Write paths:** `packages/bi-engine/src/locale/`
**Verify:** unit test + build

- 创建 `src/locale/types.ts`：定义 `BILocale` 接口和 `LocaleKey` 类型
- 创建 `src/locale/zh-CN.ts`：中文词条默认包
- 创建 `src/locale/en-US.ts`：英文词条包
- 创建 `src/locale/index.ts`：barrel 导出 + LocaleProvider + useLocale
- 词条覆盖范围：
  - `chart.type.*`：bar, line, area, table, pie, scatter, radar, gauge, candlestick
  - `table.filter.*`：title, placeholder, confirm
  - `table.columnManager.*`：title, available, selected, emptyAvailable, emptySelected, cancel, confirm
  - `table.pagination.*`：total, pageSize
  - `table.empty.*`：noVisibleColumns, noData
  - `table.*`：noColumnsDefined

---

## T-002: 实现 LocaleProvider 和 useLocale

**Write paths:** `packages/bi-engine/src/locale/index.ts`
**Verify:** unit test

- 创建 React Context `LocaleContext`
- `LocaleProvider` 组件：接受 `locale` prop，注入到 Context
- `useLocale()` hook：返回当前 BILocale，默认 zh-CN
- `resolveLocale(input)` 工具函数：字符串 → 内置包，对象 → 直接使用

---

## T-003: BIEngine 集成 locale prop

**Write paths:** `packages/bi-engine/src/react/BIEngine.tsx`
**Verify:** build + existing tests pass

- `BIEngineProps` 新增 `locale?: 'zh-CN' | 'en-US' | BILocale`
- 在 BIEngine 内部用 `LocaleProvider` 包裹子组件
- 调用 `resolveLocale(props.locale)` 解析为 BILocale 对象
- 更新 `src/index.ts` 导出 locale 相关类型和常量

---

## T-004: chart-switch 词条国际化

**Write paths:** `packages/bi-engine/src/component-handlers/chart/chart-switch.ts`, `packages/bi-engine/src/component-handlers/chart/ChartSwitchToolbar.tsx`
**Verify:** unit test

- `getSwitchableTypes` 移除硬编码中文 label
- `SwitchTarget.label` 改为 `SwitchTarget.labelKey`（locale key）
- ChartSwitchToolbar 中通过 `useLocale()` 获取 label
- 或者：getSwitchableTypes 接受可选 locale 参数返回翻译后 label
- 保持纯函数无副作用的设计

---

## T-005: TableView 词条国际化

**Write paths:** `packages/bi-engine/src/component-handlers/table/TableView.tsx`
**Verify:** unit test + build

- 所有硬编码中文文案替换为 `locale.xxx` 调用
- 使用 `useLocale()` 获取当前 locale
- 插值文案使用 replace 处理（如 `"共 {count} 条".replace('{count}', n)`）
- 英文 "No columns defined." 也从 locale 获取
- 确保视觉无变化（中文默认行为不变）

---

## T-006: Playground 语言切换测试

**Write paths:** `apps/bi-playground/src/`
**Verify:** dev server visual check

- 在 Playground 布局中新增语言切换按钮组（zh-CN / en-US）
- 切换时更新传递给 BIEngine 的 locale prop
- 使用 React state 管理当前语言
- 仅影响 BIEngine 组件的 locale，不影响 Playground 自身 UI

---

## T-007: 单元测试

**Write paths:** `packages/bi-engine/src/__tests__/locale/`
**Verify:** tests pass

- locale 词条完整性测试：zh-CN 和 en-US 键一致
- resolveLocale 测试：字符串/对象/undefined 解析
- useLocale 测试：默认值、自定义值
- chart-switch 国际化后标签测试
- TableView 国际化后文案测试（如有需要）

---

## T-008: 集成验证

**Verify:** build + all tests pass

- `pnpm build:engine` 成功
- `pnpm test` 全部通过
- TypeScript 类型检查通过
- Playground 语言切换功能正常
