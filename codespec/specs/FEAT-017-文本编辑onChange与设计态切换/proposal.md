# FEAT-017: 文本组件编辑 + onChange 回调 + Playground 设计态/运行态切换

## 状态: proposal

## 问题

当前 bi-engine 存在以下不足：

1. **文本组件只读**：TextComponent 的 renderer 仅做静态渲染，设计态无法编辑文本内容
2. **缺少统一变更通知**：图表切换（ChartSwitchToolbar）已有 `onChartTypeChange`，但它是 chart 专属回调；文本编辑等其它组件变更没有统一出口
3. **Playground 缺少模式切换**：playground 只能以 runtime 模式展示组件，无法验证设计态交互和变更事件

## 目标

1. 文本组件在设计态获得焦点后变为可编辑，编辑完成（失焦/回车）后触发变更
2. BIEngine 新增统一的 `onChange` 回调，在图表切换、文本编辑时触发，返回完整的变更后 schema
3. Playground 新增设计态/运行态切换功能，可实时测试编辑事件和 onChange 回调

## 范围

### 包含

- bi-engine: TextHandler renderer 在设计态渲染可编辑输入框
- bi-engine: `BIEngineProps` 新增 `onChange?: (newSchema: BIEngineComponent) => void`
- bi-engine: 图表切换和文本编辑统一走 `onChange` 通道
- bi-engine: 现有 `onChartTypeChange` 保留向后兼容
- playground: 新增 mode toggle（设计态/运行态）开关
- playground: 新增 onChange 日志面板，展示变更事件

### 不包含

- 拖拽调整组件位置/大小（FEAT-006 范围）
- 属性面板联动
- Markdown / CompositeTable 组件编辑
- 多组件场景（Dashboard / Report）

## 依赖

- FEAT-003（RenderModeProvider, DesignableWrapper 骨架）— done
- FEAT-006（设计态支持预留）— done
- FEAT-015（图表切换工具栏）— done

## 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| onChange 与 onChartTypeChange 并存可能混淆 | 中 | 文档明确优先级；onChartTypeChange 为向后兼容保留 |
| 设计态文本编辑可能触发 SelectionContext 冒泡 | 低 | 编辑时阻止事件冒泡 |
| playground 改动影响现有 editor 功能 | 低 | 模式切换独立于现有 editor 逻辑 |

## 预估规模

- 预计 Story: 4-5 个
- 预计 Task: 8-12 个
