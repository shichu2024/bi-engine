# FEAT-019 Stories

## ST-001: RenderMode 枚举重构与向后兼容

### 用户故事

作为 bi-engine 消费者，我希望 mode 属性支持 `chat | edit | view` 三种新模式，同时旧的 `runtime | design` 值仍能正常工作，以便平滑迁移。

### 验收标准

1. `RenderMode` 枚举包含 `CHAT = 'chat'`、`EDIT = 'edit'`、`VIEW = 'view'`
2. `BIEngineProps.mode` 类型为 `'chat' | 'edit' | 'view' | 'runtime' | 'design'`
3. `runtime` 自动映射为 `VIEW`，`design` 自动映射为 `EDIT`
4. `useRenderMode()` hook 返回新枚举值
5. `useIsDesignMode()` 改为 `useIsEditMode()`，保留 `useIsDesignMode()` 作为别名
6. 新增 `useCanSwitchChart()` hook（chat/edit 返回 true）
7. 新增 `useCanEditText()` hook（仅 edit 返回 true）

### 优先级

P0

---

## ST-002: 主题 API 简化

### 用户故事

作为 bi-engine 消费者，我希望 theme 属性只需传入 `'dark'` 或 `'light'` 即可切换主题，无需了解内部 token 细节。

### 验收标准

1. `BIEngineProps.theme` 类型改为 `'dark' | 'light'`
2. 传入 `'dark'` 时自动使用 `DARK_THEME_TOKENS`，传入 `'light'` 时使用 `DEFAULT_THEME_TOKENS`
3. 不传 theme 时默认为 `'light'`
4. `ChartThemeProvider` 内部机制不变，仍支持 token 覆盖
5. `index.ts` 继续导出 `DARK_THEME_TOKENS` 和 `DEFAULT_THEME_TOKENS` 供高级用户使用

### 优先级

P0

---

## ST-003: 图表切换按模式控制

### 用户故事

作为 bi-engine 消费者，我希望图表切换工具栏的可见性由当前模式控制：chat 和 edit 模式显示，view 模式隐藏。

### 验收标准

1. chat 模式下 ChartSwitchToolbar 正常显示并可操作
2. edit 模式下 ChartSwitchToolbar 正常显示并可操作
3. view 模式下 ChartSwitchToolbar 不渲染
4. ComponentView 中使用 `useCanSwitchChart()` 控制 toolbar 构建

### 优先级

P0

---

## ST-004: 文本编辑按模式控制

### 用户故事

作为 bi-engine 消费者，我希望文本组件的编辑能力由当前模式控制：仅 edit 模式可编辑，chat 和 view 模式只读。

### 验收标准

1. edit 模式下 TextComponent 渲染 DesignTextRenderer（contentEditable）
2. chat 模式下 TextComponent 渲染只读内容
3. view 模式下 TextComponent 渲染只读内容
4. TextHandler renderer 使用 `useCanEditText()` 决定渲染方式

### 优先级

P0

---

## ST-005: DesignableWrapper 按模式控制

### 用户故事

作为 bi-engine 消费者，我希望 DesignableWrapper 仅在 edit 模式下生效，chat 和 view 模式下不渲染选中边框等交互元素。

### 验收标准

1. edit 模式下 ComponentView 包裹 DesignableWrapper
2. chat 模式下 ComponentView 直接渲染内容
3. view 模式下 ComponentView 直接渲染内容

### 优先级

P0

---

## ST-006: 测试更新

### 用户故事

作为开发者，我需要所有相关测试更新以覆盖新模式系统的行为差异。

### 验收标准

1. 现有 `runtime`/`design` 测试通过向后兼容继续通过
2. 新增 chat/edit/view 模式的渲染测试
3. 验证 chat 模式：图表切换可用、文本只读
4. 验证 edit 模式：图表切换可用、文本可编辑
5. 验证 view 模式：图表切换不可用、文本只读
6. 主题简化测试：`theme='dark'` 正确应用暗色 tokens
7. 测试覆盖率 ≥ 80%

### 优先级

P0

---

## ST-007: Playground 三模式与主题切换

### 用户故事

作为 Playground 用户，我希望在预览区域切换 chat/edit/view 三种模式和 dark/light 主题，以便验证不同模式下的组件行为。

### 验收标准

1. 模式选择器从 Switch 改为 Segmented/RadioGroup（chat/edit/view）
2. 主题选择器保持 light/dark 切换
3. 切换模式时 BIEngine 的 mode prop 实时更新
4. 切换主题时 BIEngine 的 theme prop 实时更新
5. InteractivePreview 组件同步更新
6. onChange 事件日志面板继续工作

### 优先级

P0
