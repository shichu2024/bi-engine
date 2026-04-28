# FEAT-019: 模式系统重构与主题简化

## 状态: proposal

## 问题

当前 bi-engine 的模式系统仅有 `runtime` 和 `design` 两种模式，无法满足实际业务场景中"智能对话"、"编辑"、"只读查看"三种差异化的交互需求。同时，主题系统对外暴露了 `Partial<ThemeTokens>` 复杂接口，对于只需要 dark/light 切换的场景来说过于繁琐。

### 具体问题

1. **模式语义不精确**：`runtime` 既用于纯只读查看，也用于智能对话场景，但两者对图表切换的需求不同
2. **缺少 chat 模式**：智能对话模式下图表需要支持切换但文本不可编辑，当前 `runtime` 无法区分
3. **主题接口过于复杂**：`Partial<ThemeTokens>` 要求消费者理解 6 大类 30+ token，而多数场景只需 dark/light 切换

## 目标

1. 新增三模式系统：`chat`（智能对话）、`edit`（编辑）、`view`（只读查看）
2. 各模式行为明确：图表切换、文本编辑按模式差异控制
3. 主题 API 简化为 `theme?: 'dark' | 'light'`，内部自动解析为对应 token 集
4. Playground 同步支持三模式和主题切换测试

## 模式行为矩阵

| 能力 | chat | edit | view |
|------|------|------|------|
| 图表类型切换 | ✓ | ✓ | ✗ |
| 文本编辑 | ✗ | ✓ | ✗ |
| DesignableWrapper | ✗ | ✓ | ✗ |

## 范围

### 包含

- bi-engine: `RenderMode` 枚举重构为 `CHAT / EDIT / VIEW`
- bi-engine: `BIEngineProps.mode` 类型改为 `'chat' | 'edit' | 'view'`
- bi-engine: `BIEngineProps.theme` 简化为 `'dark' | 'light'`
- bi-engine: 内部按 mode 控制图表切换可见性、文本编辑可用性、DesignableWrapper
- bi-engine: 更新所有相关测试
- playground: 模式选择器从双模式改为三模式
- playground: 主题切换使用新的简化 API
- 向后兼容：`runtime` 映射为 `view`，`design` 映射为 `edit`

### 不包含

- 自定义 token 覆盖（保持内部能力，不对外暴露）
- 新组件类型
- 拖拽/属性面板（FEAT-006 范围）

## 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 破坏现有 `runtime`/`design` 消费者 | 高 | 向后兼容映射 |
| `chat` 模式未来可能需要更多差异化行为 | 中 | 预留 mode 扩展点 |
| 主题简化后无法细粒度定制 | 低 | 保留内部 ThemeTokens 机制 |

## 验收标准

1. `BIEngineProps.mode` 接受 `'chat' | 'edit' | 'view'`，也兼容旧值 `'runtime' | 'design'`
2. `BIEngineProps.theme` 接受 `'dark' | 'light'`
3. chat 模式：图表显示切换工具栏，文本只读
4. edit 模式：图表显示切换工具栏，文本可编辑
5. view 模式：图表无切换工具栏，文本只读
6. `pnpm build:engine && pnpm test` 全部通过
7. Playground 可测试所有三种模式 + dark/light 主题
