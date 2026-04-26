# FEAT-017 Tasks

## T-001: TextHandler renderer 增加设计态编辑支持

- **Story**: ST-001
- **Status**: todo
- **Description**: 修改 `text-handler.tsx` 的 renderer，当 `RenderContext.mode === 'design'` 时渲染可编辑 textarea，blur 时调用 `context.onChange` 回调。
- **write_paths**:
  - `packages/bi-engine/src/component-handlers/text/text-handler.tsx`
- **verify**:
  - type: command
  - command: `pnpm --filter bi-engine test -- --run text-handler`

---

## T-002: RenderContext 新增 onChange 回调字段

- **Story**: ST-001, ST-002
- **Status**: todo
- **Description**: 在 `platform/types.ts` 的 `RenderContext` 接口中新增 `onChange?: (newSchema: BIEngineComponent) => void`，使 renderer 能上报变更。
- **Dependencies**: T-001 (RenderContext 定义需要先确认)
- **write_paths**:
  - `packages/bi-engine/src/platform/types.ts`
- **verify**:
  - type: command
  - command: `pnpm --filter bi-engine build`

---

## T-003: ComponentView 传递 onChange 到 RenderContext

- **Story**: ST-002
- **Status**: todo
- **Description**: 修改 `ComponentView.tsx`，将 `onChange` prop 传入 `RenderContext`，使所有 handler renderer 都能通过 context.onChange 上报变更。
- **Dependencies**: T-002
- **write_paths**:
  - `packages/bi-engine/src/react/ComponentView.tsx`
- **verify**:
  - type: command
  - command: `pnpm --filter bi-engine test -- --run ComponentView`

---

## T-004: BIEngineProps 新增 onChange，统一变更通道

- **Story**: ST-002
- **Status**: todo
- **Description**:
  1. `BIEngineProps` 新增 `onChange?: (newSchema: BIEngineComponent) => void`
  2. BIEngine 内部 `handleChartTypeChange` 同时调用 `onChange` 和 `onChartTypeChange`
  3. ComponentView 传入的 `onChartTypeChange` 内部包装为同时触发 `onChange`
  4. 传递 `onChange` 给 ComponentView → RenderContext
- **Dependencies**: T-003
- **write_paths**:
  - `packages/bi-engine/src/react/BIEngine.tsx`
  - `packages/bi-engine/src/react/ComponentView.tsx`
- **verify**:
  - type: command
  - command: `pnpm --filter bi-engine test -- --run BIEngine`

---

## T-005: ChartSwitchToolbar 操作触发 onChange

- **Story**: ST-002
- **Status**: todo
- **Description**: 确保 `ComponentView` 的 `handleSwitch` 在调用 `onChartTypeChange` 时同时触发 `onChange`。此逻辑在 T-004 的 BIEngine 层统一处理，ComponentView 只需透传。
- **Dependencies**: T-004
- **write_paths**: （无新增，T-004 已覆盖）
- **verify**:
  - type: command
  - command: `pnpm --filter bi-engine test -- --run chart-switch`

---

## T-006: Playground 模式切换功能

- **Story**: ST-003
- **Status**: todo
- **Description**: 在 Playground 预览页面新增设计态/运行态切换控件。使用 zustand store 管理 mode 状态，传递给 BIEngine 的 `mode` prop。
- **write_paths**:
  - `apps/bi-playground/src/stores/useModeStore.ts` (新建)
  - `apps/bi-playground/src/components/demo/InteractivePreview.tsx`
  - `apps/bi-playground/src/components/demo/SceneDetail.tsx`
- **verify**:
  - type: manual
  - command: `pnpm dev:playground`

---

## T-007: Playground onChange 事件日志面板

- **Story**: ST-004
- **Status**: todo
- **Description**: 新增事件日志面板组件，展示 onChange 触发的事件列表。包含时间戳、变更来源、schema 摘要、清除按钮。面板可折叠。
- **Dependencies**: T-006
- **write_paths**:
  - `apps/bi-playground/src/components/demo/EventLogPanel.tsx` (新建)
  - `apps/bi-playground/src/components/demo/SceneDetail.tsx`
  - `apps/bi-playground/src/components/demo/InteractivePreview.tsx`
- **verify**:
  - type: manual
  - command: `pnpm dev:playground`

---

## T-008: 测试 fixture 和单元/集成测试

- **Story**: ST-005
- **Status**: todo
- **Description**:
  1. 新增 `text-editable` fixture
  2. text-handler 编辑态单元测试
  3. BIEngine onChange 集成测试
  4. 覆盖率 ≥ 80%
- **Dependencies**: T-004, T-005
- **write_paths**:
  - `packages/bi-engine/src/testing/fixtures/text-editable/` (新建)
  - `packages/bi-engine/src/__tests__/text-handler-edit.test.tsx` (新建)
  - `packages/bi-engine/src/__tests__/bi-engine-onchange.test.tsx` (新建)
- **verify**:
  - type: command
  - command: `pnpm --filter bi-engine test -- --run`
