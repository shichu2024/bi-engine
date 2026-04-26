# FEAT-017 Stories

## ST-001: 文本组件设计态可编辑

### 用户故事

作为报告设计者，在设计态下，我希望点击文本组件后能直接编辑文本内容，编辑完成后变更自动保存，以便快速修改报告中的文字。

### 验收标准

1. 文本组件在 `mode='design'` 时，获得焦点后呈现可编辑的 textarea/contentEditable
2. 编辑前显示原始文本内容，placeholder 提示"点击编辑文本"
3. 编辑完成（失焦 blur）时，触发 onChange 回调，返回更新后的 TextComponent schema
4. 编辑时不触发 DesignableWrapper 的选中边框冒泡
5. `mode='runtime'` 时保持原有只读渲染行为不变

### 优先级

P0

---

## ST-002: BIEngine 统一 onChange 回调

### 用户故事

作为平台开发者，我希望 BIEngine 提供统一的 `onChange` 回调，在图表切换或文本编辑时都能通过同一接口获取变更后的完整 schema，以便简化上层状态管理。

### 验收标准

1. `BIEngineProps` 新增 `onChange?: (newSchema: BIEngineComponent) => void`
2. 图表切换（ChartSwitchToolbar 操作）触发 onChange，传入转换后的新 schema
3. 文本编辑（ST-001 失焦）触发 onChange，传入 content 更新后的 TextComponent
4. `onChange` 与 `onChartTypeChange` 可同时存在；`onChartTypeChange` 优先调用以保持向后兼容
5. 非受控模式（不传 onChange）：图表切换和文本编辑仍正常工作，内部状态自洽

### 优先级

P0

---

## ST-003: Playground 设计态/运行态切换

### 用户故事

作为 Playground 用户，我希望能在页面上切换设计态和运行态，以便测试组件在不同模式下的交互行为。

### 验收标准

1. Playground 预览区域新增设计态/运行态切换开关（Switch/Toggle）
2. 切换到设计态后，BIEngine 的 mode 传入 'design'，文本组件可编辑
3. 切换到运行态后，BIEngine 的 mode 传入 'runtime'，所有组件只读
4. 切换时不清空当前 schema 状态，保持编辑内容
5. 默认为运行态

### 优先级

P0

---

## ST-004: Playground onChange 事件日志面板

### 用户故事

作为 Playground 用户，我希望看到 onChange 触发的变更事件日志，以便调试和理解组件变更行为。

### 验收标准

1. Playground 新增事件日志面板，显示 onChange 每次触发的变更摘要
2. 每条日志显示：时间戳、变更来源（chart-switch / text-edit）、变更后 schema 摘要
3. 日志面板可折叠/展开，不影响主预览区域
4. 清除日志按钮

### 优先级

P1

---

## ST-005: 文本组件 fixture 和测试

### 用户故事

作为开发者，我需要文本组件编辑功能的测试 fixture 和单元测试，以确保功能正确性。

### 验收标准

1. 新增 text-editable fixture（TextComponent with content）
2. 文本编辑 renderer 的单元测试覆盖：design 模式渲染编辑框、blur 触发回调、runtime 模式只读
3. BIEngine onChange 的集成测试：图表切换触发 onChange、文本编辑触发 onChange
4. 测试覆盖率 ≥ 80%

### 优先级

P1
