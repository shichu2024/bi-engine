# ADR-002: bi-engine 深色/浅色主题系统架构设计

## 执行摘要

当前主题实现碎片化：`base-option.ts` 等 60+ 处硬编码颜色，`ThemeTokens` 已定义但未被消费。
本设计提出统一主题消费机制，使 bi-engine 包和 Playground 均能正确响应主题切换。

## 数据流

```
useThemeStore (mode)
    ├─> App.tsx (data-theme 属性)
    ├─> ConfigProvider (Ant Design darkAlgorithm)
    └─> ChartThemeProvider (tokens=DARK/DEFAULT_THEME_TOKENS)
            └─> ComponentView → RenderContext.theme
                    ├─> chart-handler → echartsAdapter.adapt(model, theme)
                    │       └─> buildEChartsOption(model, theme)
                    │               └─> getBaseOption(theme) → 消除硬编码
                    ├─> TableView → useTableStyles(theme) → 消除硬编码
                    └─> ChartStateView / DesignableWrapper → theme 语义色
```

## 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 非React 代码主题传递 | 函数参数扩展（可选） | 纯函数保持纯粹，测试友好 |
| TableView 样式方案 | Hook 生成 inline style | 与现有架构一致 |
| 降级行为 | DEFAULT_TOKENS | 向后兼容 |
| CSS 变量命名 | `--bi-*` 前缀 | 避免与 `--ant-*` 冲突 |

## Token 扩展设计

新增 `SemanticTokens`（error/warning/success/info）和 `TableTokens`（headerBg/cellBorder/rowHoverBg 等）。
所有新增字段提供 DEFAULT 和 DARK 两套值。函数参数均为可选，不传时降级到 DEFAULT。

## 实施阶段

- Phase 1: 扩展 ThemeTokens + DARK tokens
- Phase 2: base-option.ts / empty-data-option.ts 主题参数化
- Phase 3: React 组件（ComponentView、TableView、ChartStateView、DesignableWrapper）
- Phase 4: Playground 集成（ThemeBridgeProvider）
- Phase 5: 测试与验证
