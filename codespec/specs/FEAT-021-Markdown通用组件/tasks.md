# 任务清单

## 索引

| ID | Story | 标题 | 状态 | 依赖 | 负责人 |
|----|-------|-------|--------|------------|-------|
| T-001 | ST-001 | 实现 markdown handler 管线 | todo | - | dev |
| T-002 | ST-002 | 实现 Markdown 渲染器（只读模式） | todo | T-001 | dev |
| T-003 | ST-003 | 实现 Markdown 编辑器（编辑模式） | todo | T-001 | dev |
| T-004 | ST-004 | 集成双模式切换与数据同步 | todo | T-002, T-003 | dev |
| T-005 | ST-005 | Playground 演示页面 | todo | T-004 | dev |
| T-006 | ST-001~ST-004 | 单元测试与集成测试 | todo | T-004 | dev |

## T-001 实现 markdown handler 管线

```yaml
id: T-001
story_id: ST-001
title: 实现 markdown handler 管线
owner_role: dev
status: todo
depends_on: []
read_paths:
  - packages/bi-engine/src/component-handlers/**
  - packages/bi-engine/src/platform/**
  - packages/bi-engine/src/schema/**
write_paths:
  - packages/bi-engine/src/component-handlers/markdown/**
  - packages/bi-engine/src/component-handlers/index.ts
  - packages/bi-engine/src/platform/auto-registry.ts
verify:
  - type: command
    value: pnpm test
  - type: manual
    value: 确认 validator/normalizer/resolver/modelBuilder 正常工作
```

### 目标

- 创建 `component-handlers/markdown/` 目录，实现完整管线阶段
- 替换 `auto-registry.ts` 中的 unsupported handler 为正式 handler
- 导出 handler 并注册到 component-handlers/index.ts

### 交付物

- `packages/bi-engine/src/component-handlers/markdown/markdown-handler.tsx`
- 更新 `component-handlers/index.ts` 导出
- 更新 `platform/auto-registry.ts` 注册

### 备注

- 参照 `text-handler.tsx` 的管线模式
- `MarkdownSemanticModel` 包含 `componentId` 和 `content`

---

## T-002 实现 Markdown 渲染器（只读模式）

```yaml
id: T-002
story_id: ST-002
title: 实现 Markdown 渲染器（只读模式）
owner_role: dev
status: todo
depends_on: [T-001]
read_paths:
  - packages/bi-engine/src/component-handlers/markdown/**
  - packages/bi-engine/src/schema/**
write_paths:
  - packages/bi-engine/src/component-handlers/markdown/**
  - packages/bi-engine/src/component-handlers/markdown/markdown-renderer.tsx
  - packages/bi-engine/src/component-handlers/markdown/markdown-styles.css
verify:
  - type: command
    value: pnpm test
  - type: manual
    value: 确认常用 Markdown 语法正确渲染
```

### 目标

- 实现轻量级 Markdown 解析器，支持常用语法（标题、加粗、斜体、列表、引用、分割线、行内代码、链接）
- 实现只读渲染器组件
- 实现 XSS 安全过滤
- 实现配套 CSS 样式

### 交付物

- `markdown-parser.ts` — 轻量 Markdown → HTML 解析
- `markdown-renderer.tsx` — 只读渲染 React 组件
- `markdown-styles.css` — 渲染样式

### 备注

- 不引入外部 Markdown 解析库，自行实现轻量解析器，避免增大包体积
- XSS 过滤需转义 HTML 标签

---

## T-003 实现 Markdown 编辑器（编辑模式）

```yaml
id: T-003
story_id: ST-003
title: 实现 Markdown 编辑器（编辑模式）
owner_role: dev
status: todo
depends_on: [T-001]
read_paths:
  - packages/bi-engine/src/component-handlers/markdown/**
  - packages/bi-engine/src/component-handlers/text/text-handler.tsx
  - packages/bi-engine/src/platform/render-mode.ts
write_paths:
  - packages/bi-engine/src/component-handlers/markdown/markdown-editor.tsx
verify:
  - type: command
    value: pnpm test
  - type: manual
    value: 确认编辑模式功能正常
```

### 目标

- 实现编辑模式的 textarea 组件
- 通过 `useCanEditText()` 和 `useIsEditMode()` 控制编辑权限
- 支持 onChange 回调同步数据

### 交付物

- `markdown-editor.tsx` — 编辑模式 React 组件

### 备注

- 仅在 `edit` 模式下可编辑，`chat` / `view` 退回到只读渲染
- 支持自定义高度和占位文案

---

## T-004 集成双模式切换与数据同步

```yaml
id: T-004
story_id: ST-004
title: 集成双模式切换与数据同步
owner_role: dev
status: todo
depends_on: [T-002, T-003]
read_paths:
  - packages/bi-engine/src/component-handlers/markdown/**
  - packages/bi-engine/src/platform/render-mode.ts
write_paths:
  - packages/bi-engine/src/component-handlers/markdown/markdown-handler.tsx
verify:
  - type: command
    value: pnpm test
  - type: manual
    value: 确认双模式切换数据同步正常
```

### 目标

- 在 handler renderer 中根据 RenderMode 选择渲染器或编辑器
- 确保双模式切换时数据不丢失

### 交付物

- 更新 `markdown-handler.tsx` 中的 renderer 实现

### 备注

- 复用平台 `RenderMode` 和 `useCanEditText()` 机制

---

## T-005 Playground 演示页面

```yaml
id: T-005
story_id: ST-005
title: Playground 演示页面
owner_role: dev
status: todo
depends_on: [T-004]
read_paths:
  - apps/bi-playground/src/**
  - packages/bi-engine/src/component-handlers/markdown/**
write_paths:
  - apps/bi-playground/src/pages/**
verify:
  - type: manual
    value: 在浏览器中确认演示页面功能正常
```

### 目标

- 在 Playground 中添加 Markdown 组件演示页面
- 左侧导航增加入口
- 包含覆盖常用语法的示例 Markdown 文本

### 交付物

- Playground 演示页面文件

### 备注

- 参考其他组件的演示页面结构

---

## T-006 单元测试与集成测试

```yaml
id: T-006
story_id: ST-001~ST-004
title: 单元测试与集成测试
owner_role: dev
status: todo
depends_on: [T-004]
read_paths:
  - packages/bi-engine/src/component-handlers/markdown/**
  - packages/bi-engine/src/__tests__/**
write_paths:
  - packages/bi-engine/src/__tests__/handlers/markdown-handler.test.tsx
  - packages/bi-engine/src/__tests__/handlers/markdown-parser.test.ts
verify:
  - type: command
    value: pnpm test
  - type: manual
    value: 确认测试覆盖率 >= 80%
```

### 目标

- 为 markdown handler 管线编写单元测试
- 为 markdown parser 编写单元测试
- 为渲染器和编辑器编写组件测试

### 交付物

- `__tests__/handlers/markdown-handler.test.tsx`
- `__tests__/handlers/markdown-parser.test.ts`

### 备注

- 参照现有 text-handler 测试结构
