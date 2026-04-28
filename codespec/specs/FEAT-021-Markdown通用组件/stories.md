# 用户故事

## 索引

| ID | 标题 | 优先级 | 状态 | 依赖 |
|----|-------|----------|--------|------------|
| ST-001 | Markdown Handler 管线实现 | P0 | ready | - |
| ST-002 | 只读模式 Markdown 渲染 | P0 | ready | ST-001 |
| ST-003 | 编辑模式 Markdown 源码编辑 | P0 | ready | ST-001 |
| ST-004 | 双模式数据同步与状态切换 | P0 | ready | ST-002, ST-003 |
| ST-005 | Playground 演示页面 | P1 | ready | ST-004 |

## ST-001 Markdown Handler 管线实现

```yaml
id: ST-001
title: Markdown Handler 管线实现
priority: P0
status: ready
depends_on: []
```

### 故事

作为开发者，我希望 `markdown` 类型拥有完整的组件处理器管线（validator / normalizer / resolver / modelBuilder / renderer），以便平台能够识别、校验和渲染 Markdown 组件。

### 验收标准

- `AC-1`: Given 一个 `type: 'markdown'` 且 `dataProperties.content` 非空的组件，when 通过管线处理，then validator 返回 `ok: true`
- `AC-2`: Given 一个 `type: 'markdown'` 但 `content` 为空的组件，when validator 校验，then 返回 `ok: false` 且 error code 为 `MISSING_CONTENT`
- `AC-3`: normalizer 将 `MarkdownComponent` 转换为标准 `NormalizedComponent`，包含 id、type、properties
- `AC-4`: resolver 返回 `dataType: 'static'`，data 为 content 字符串
- `AC-5`: modelBuilder 构建出 `MarkdownSemanticModel`，包含 componentId 和 content
- `AC-6`: handler 在 `auto-registry.ts` 中注册替换原有的 unsupported handler

### 范围外

- 不涉及渲染逻辑（ST-002 和 ST-003 处理）

---

## ST-002 只读模式 Markdown 渲染

```yaml
id: ST-002
title: 只读模式 Markdown 渲染
priority: P0
status: ready
depends_on: [ST-001]
```

### 故事

作为用户，我希望在只读模式下，Markdown 原始文本被自动解析渲染为格式化富文本展示，隐藏语法标记符号，以便获得良好的阅读体验。

### 验收标准

- `AC-1`: 渲染器正确解析并展示标题语法（`# ~ ######`），不同层级有差异化字号和字重
- `AC-2`: 渲染器正确解析加粗（`**text**`）和斜体（`*text*`）
- `AC-3`: 渲染器正确解析无序列表（`- item`）和有序列表（`1. item`）
- `AC-4`: 渲染器正确解析引用（`> quote`），带左侧边框样式
- `AC-5`: 渲染器正确解析分割线（`---`）
- `AC-6`: 渲染器正确解析行内代码（`` `code` ``），带背景色样式
- `AC-7`: 渲染器正确解析链接（`[text](url)`），渲染为可点击超链接
- `AC-8`: 空内容时显示占位文案，不报错
- `AC-9`: 特殊字符（`<script>`、HTML 标签等）被安全过滤，不执行

### 范围外

- 图片语法、表格语法、代码块语法高亮

---

## ST-003 编辑模式 Markdown 源码编辑

```yaml
id: ST-003
title: 编辑模式 Markdown 源码编辑
priority: P0
status: ready
depends_on: [ST-001]
```

### 故事

作为用户，我希望在编辑模式下，Markdown 原始文本以 textarea 直接展示，完整保留所有语法标识符号，支持我直接修改编辑源码。

### 验收标准

- `AC-1`: 编辑模式下渲染为 textarea，完整展示原始 Markdown 源码文本
- `AC-2`: 支持常规文本编辑操作：输入、删除、复制、粘贴、换行
- `AC-3`: 支持自定义容器高度（通过 `basicProperties`）
- `AC-4`: 支持自定义占位文案
- `AC-5`: 编辑内容通过 `context.onChange` 回调同步更新
- `AC-6`: 仅在 `edit` 模式下可编辑，`chat` / `view` 模式下为只读渲染

### 范围外

- 工具栏按钮、快捷键
- 实时预览

---

## ST-004 双模式数据同步与状态切换

```yaml
id: ST-004
title: 双模式数据同步与状态切换
priority: P0
status: ready
depends_on: [ST-002, ST-003]
```

### 故事

作为用户，我希望在只读和编辑两种模式之间切换时，内容数据实时同步，不丢失、不截断、不错乱。

### 验收标准

- `AC-1`: 编辑模式修改内容后切回只读模式，渲染结果与最新内容一致
- `AC-2`: 只读模式切回编辑模式，textarea 中展示完整的原始 Markdown 源码
- `AC-3`: 多次切换模式后内容不丢失
- `AC-4`: 空内容状态下切换不报错
- `AC-5`: 包含特殊字符的内容切换后不丢失或错乱

### 范围外

- 无

---

## ST-005 Playground 演示页面

```yaml
id: ST-005
title: Playground 演示页面
priority: P1
status: ready
depends_on: [ST-004]
```

### 故事

作为开发者，我希望在 Playground 中有 Markdown 组件的演示页面，以便验证和展示 Markdown 组件的双模式功能。

### 验收标准

- `AC-1`: Playground 左侧导航有 Markdown 组件入口
- `AC-2`: 演示页面展示 Markdown 渲染效果（只读模式）
- `AC-3`: 演示页面支持切换到编辑模式
- `AC-4`: 包含覆盖常用语法的示例 Markdown 文本

### 范围外

- 无
