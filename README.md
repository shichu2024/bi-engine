# BI Engine

基于权威模型的 BI 组件渲染引擎，提供图表、表格、文本等组件的 DSL 驱动渲染能力。

## 项目结构

```
bi-engine/
├── packages/bi-engine          # 核心渲染引擎（npm 包）
├── apps/bi-playground          # Playground 文档站 + DSL 编辑器
├── tooling/visual-regression   # VRT 基线管理工具
└── pnpm-workspace.yaml
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 构建引擎
pnpm build:engine

# 运行单元测试
pnpm test

# 启动 Playground（http://localhost:3000）
pnpm dev:playground
```

> **Node**: >= 18 · **包管理器**: pnpm（workspace monorepo）

---

## packages/bi-engine

核心渲染引擎，将 BI 组件 DSL 转换为可交互的可视化视图。

### 设计理念

引擎采用 **权威模型驱动** 的架构——所有组件类型、字段名、枚举值由统一的 DSL 模型定义（`src/schema/bi-engine-models.ts`），渲染管线严格依据该模型进行校验、归一化、数据解析和视图构建。

### 渲染管线

```
DSL 输入 → validate → normalize → resolve → buildModel → render
```

| 阶段 | 说明 |
|------|------|
| **validate** | 校验 DSL 结构合法性，输出 `ValidationResult` |
| **normalize** | 补全默认值、展开简写，输出 `NormalizedComponent` |
| **resolve** | 解析数据源（静态/数据源/API），输出 `ResolvedData` |
| **buildModel** | 构建语义模型（`ChartSemanticModel`），生成系列数据 |
| **render** | 通过适配器（ECharts 等）生成渲染配置并绘制 |

### 组件支持

| 组件类型 | 系列 | 状态 |
|---------|------|------|
| **chart** | line, bar, pie, scatter, radar, gauge, candlestick | 已支持 |
| **text** | — | 已支持 |
| **table** | 普通表格、多级表头、合并单元格 | 已支持 |
| markdown | — | 路线图 |
| compositeTable | — | 路线图 |

### 主题系统

- 内置调色板（`DEFAULT_PALETTE`）与主题令牌（`DEFAULT_THEME_TOKENS`）
- `ChartThemeProvider` 提供全局主题注入
- `useChartTheme` 获取当前主题上下文
- 支持亮色/暗色模式切换
- 数值格式化器（`formatValue` / `createFormatter`）支持数字、百分比等格式

### 设计态

- `RenderModeProvider` 切换渲染/设计模式
- `DesignableWrapper` 包裹组件提供选中态
- `SelectionProvider` / `useSelection` 管理选中状态

### 包导出

```typescript
// 组件与类型
import { BIEngine, type ChartComponent, validateChartComponent } from 'bi-engine'

// Schema 独立入口
import type { Series, ChartOption, Axis } from 'bi-engine/schema'

// 测试工具与 fixtures
import { fixtures } from 'bi-engine/testing'
```

三个入口点对应 `package.json` 的 `exports` 字段：

| 入口 | 用途 |
|------|------|
| `bi-engine` | 运行时：渲染组件、校验、主题、管线 |
| `bi-engine/schema` | 仅类型：权威模型 DSL 类型定义 |
| `bi-engine/testing` | 测试：fixtures 与测试工具 |

### 构建

- **构建工具**: tsup（ESM + CJS + dts）
- **产物**: `dist/` 下生成 `.js` / `.cjs` / `.d.ts`
- **外部依赖**: `react`, `react-dom`, `echarts`（peerDependencies）

---

## apps/bi-playground

交互式组件文档站，提供组件浏览、DSL 在线编辑和 VRT 结果查看。

### 功能

- **组件总览**: 按类别（chart / text / table）浏览所有组件场景
- **DSL 编辑器**: 集成 Monaco Editor，支持语法高亮、校验和实时预览
- **主题切换**: 亮色/暗色模式一键切换
- **视口切换**: 模拟不同屏幕尺寸
- **键盘快捷键**: `Ctrl+S` 保存、`Ctrl+R` 渲染、`Ctrl+K` 搜索

### 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | React 19 + React Router 7 |
| UI 库 | Ant Design 6 |
| 状态管理 | Zustand |
| 编辑器 | Monaco Editor（懒加载） |
| 构建 | Vite 6 |
| 图表 | ECharts 5（通过 bi-engine 适配器） |

### 页面路由

| 路径 | 页面 |
|------|------|
| `/` | 组件总览（全部场景卡片） |
| `/:kind` | 按类型筛选（chart / text / table） |
| `/editor/:componentId/:sceneId` | DSL 编辑器 + 实时预览 |
| `/vrt-render` | VRT 专用渲染页（无 UI 干扰） |

---

## tooling/visual-regression

视觉回归测试（VRT）系统，确保组件渲染结果不会因代码变更而产生意外差异。

### 架构

```
                    ┌─────────────────┐
                    │  Playground App  │
                    │  (VrtRenderPage) │
                    └────────┬────────┘
                             │ html2canvas 截图
                    ┌────────▼────────┐
                    │  VRT Service     │
                    │  (IDB 持久化)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        capture.ts    comparator.ts   baseline-service.ts
        (截图)        (像素对比)      (基线管理)
```

### 核心模块

| 模块 | 说明 |
|------|------|
| `capture.ts` | 通过 html2canvas 对组件进行截图 |
| `comparator.ts` | 使用 pixelmatch / resemblejs 进行像素级对比 |
| `baseline-service.ts` | 基线生成、版本管理与对比流程 |
| `test-case-service.ts` | 测试用例 CRUD（IndexedDB 持久化） |
| `db.ts` | IndexedDB 数据库封装 |

### 测试数据模型

```typescript
interface TestCase {
  id: string
  componentId: string
  sceneId: string
  dsl: object              // 组件 DSL
  viewportWidth: number
  viewportHeight: number
  theme: 'light' | 'dark'
  ignoreRegions: IgnoreRegion[]  // 忽略对比的区域
}

interface TestRunResult {
  status: 'passed' | 'failed'
  diffPixelCount: number
  diffPercentage: number    // 差异像素占比
}
```

### VRT 工作流

```bash
# 1. 运行 VRT 测试（Playwright 截图 + 对比）
pnpm test:visual

# 2. 截图捕获（将当前渲染结果保存为候选基线）
pnpm test:visual:capture

# 3. 审批基线（接受候选基线为新基准）
pnpm test:visual:approve
```

测试结果输出到 `tests/visual/.runs/<timestamp>/`，包含：

- 截图对比 HTML 报告（`vrt-viewer.html`）
- 基线图片 / 当前图片 / 差异图片

### Playwright VRT

Playwright 测试通过 `/vrt-render` 路由渲染组件，该页面去除了所有 UI 装饰（导航栏、侧边栏等），确保截图纯净。

---

## 开发指南

### 常用命令

```bash
pnpm install              # 安装依赖
pnpm build                # 构建所有包
pnpm test                 # 运行所有测试
pnpm typecheck            # TypeScript 类型检查
pnpm clean                # 清理构建产物
```

### 包级命令

```bash
# bi-engine
pnpm --filter bi-engine build
pnpm --filter bi-engine test
pnpm --filter bi-engine test:watch

# playground
pnpm --filter bi-playground dev
pnpm --filter bi-playground build
```

### 发布

使用 [Changesets](https://github.com/changesets/changesets) 管理版本：

```bash
pnpm changeset            # 记录变更
pnpm version              # 消费 changeset，更新版本号
pnpm release              # 构建 + 发布
```
