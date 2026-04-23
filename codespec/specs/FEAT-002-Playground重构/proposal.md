# FEAT-002 Playground 重构

## 问题陈述

当前 `apps/bi-playground` 仅为一个极简的组件预览工具（~165 行代码），仅包含 fixture 下拉选择、JSON 预览和图表渲染三个基础组件，无法满足 BI 组件库的交互式文档、开发调试和视觉回归测试需求。

## 目标

将 Playground 重构为面向 BI 组件库的**官方交互式文档、开发调试工具、视觉回归测试一体化平台**，提供「组件浏览-场景体验-配置编辑-实时预览-样式合规测试」的全闭环能力。

## 范围

### V1.0 MVP（当前迭代，优先级最高）

1. **全局布局与导航**：三栏式布局 + 顶部导航栏 + 可折叠左侧组件列表
2. **组件浏览与场景演示**：分类导航、组件检索、场景卡片、交互预览、DSL 代码片段
3. **DSL 编辑器与实时预览**：Monaco Editor + JSON 校验/补全 + 300ms 防抖渲染 + 可拖拽分栏
4. **基础视觉回归测试**：用例 CRUD、基准图生成、pixelmatch 像素对比、差异展示

### V1.1 核心增强（后续迭代）

- 测试中心全量功能、批量测试、CLI 工具与 CI/CD 集成
- 智能差异类型识别、Mock 数据管理、API 文档联动

### V1.1 验收差距项（从 V1.0 conditional_pass 回流）

| ID | 严重度 | 来源 | 内容 |
|----|--------|------|------|
| DEF-ST002-01 | important | ST-002 | 组件分类补全至 6 个（增加表格组件/布局容器/筛选交互/文本展示） |
| DEF-ST002-02 | important | ST-002 | 分类展开/折叠 UI 接入（Store 已支持） |
| DEF-ST005-01 | important | ST-005 | SaveTestCaseModal 集成到 SceneDemoPage 和 EditorPage |
| DEF-ST002-03 | minor | ST-002 | 列表项补充图标、描述、测试状态标记 |
| DEF-ST005-02 | minor | ST-005 | 基准图导出/导入功能 |
| DEF-ST005-03 | minor | ST-005 | pixelmatch threshold 语义对齐（0.1% vs 0.1） |
| PERF-001 | minor | 构建 | Monaco Editor chunk >500KB，需 dynamic import 优化 |
| DEF-ST001-01 | note | ST-001 | 最近访问组件偏好持久化 |

### V1.2 / V2.0（远期规划）

- 配置保存与分享、历史版本管理、社区协作、企业级权限

## 技术栈

| 领域 | 选型 |
|------|------|
| 框架 | React 18+ / TypeScript 5.x（已具备） |
| 构建 | Vite 6.x（已具备） |
| UI 组件库 | Ant Design 5.x |
| 编辑器 | Monaco Editor (@monaco-editor/react) |
| 状态管理 | Zustand |
| 路由 | React Router v6 |
| 像素对比 | pixelmatch + Resemble.js |
| 浏览器自动化 | Playwright（已具备） |
| 单元测试 | Vitest |
| 本地存储 | IndexedDB（idb）+ localStorage |

## 约束

- 必须复用现有 `bi-engine` 包的组件渲染能力
- 必须与现有 `tooling/visual-regression` 工具链兼容
- 保持 monorepo workspace 结构，playground 作为 `apps/bi-playground`

## 风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| Monaco Editor 大体积影响首屏加载 | 中 | 动态 import + 懒加载 |
| pixelmatch 在浏览器端性能 | 低 | Web Worker 离线计算 |
| Ant Design 样式与自定义主题冲突 | 中 | CSS Variables + ConfigProvider |

## 参考

完整需求文档见 `codespec/playground重构文档.md`
