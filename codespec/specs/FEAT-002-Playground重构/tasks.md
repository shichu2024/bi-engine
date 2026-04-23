# FEAT-002 Tasks (V1.0 MVP)

## 阶段一：项目脚手架与基础架构

### T-001: 项目依赖安装与 Vite 配置升级

- **story**: ST-001
- **status**: done
- **depends_on**: []
- **write_paths**:
  - `apps/bi-playground/package.json`
  - `apps/bi-playground/vite.config.ts`
  - `apps/bi-playground/tsconfig.json`
  - `apps/bi-playground/index.html`
- **read_paths**:
  - `packages/bi-engine/src/schema/**`
  - `apps/bi-playground/src/**`
  - `tooling/visual-regression/**`
- **description**: |
  1. 安装新依赖：antd, @ant-design/icons, zustand, react-router-dom, @monaco-editor/react, monaco-editor, pixelmatch, resemblejs, idb, vitest, @testing-library/react
  2. 更新 vite.config.ts：配置路径别名 (@/)、Monaco Editor worker、Ant Design 按需加载
  3. 更新 tsconfig.json：添加路径映射
  4. 确保 pnpm install 成功
- **verification**: `pnpm install` 成功，`pnpm --filter bi-playground build` 成功
- **parallel_group**: foundation

---

### T-002: 全局状态管理 (Zustand Stores)

- **story**: ST-001
- **status**: done
- **depends_on**: [T-001]
- **write_paths**:
  - `apps/bi-playground/src/stores/`
- **read_paths**:
  - `packages/bi-engine/src/schema/**`
  - `apps/bi-playground/src/**`
- **description**: |
  创建以下 Zustand stores：
  1. `useComponentStore` - 组件列表、当前选中组件、分类展开状态、搜索关键词
  2. `useThemeStore` - 主题模式(light/dark)、调色板配置
  3. `useEditorStore` - 当前 DSL 内容、原始 DSL、修改历史(最近10条)、编辑器设置(字号、换行)
  4. `useViewportStore` - 当前视口索引、自定义视口
  5. `useTestStore` - 测试用例列表、基准图索引、测试结果
  6. `useLayoutStore` - 侧栏宽度、折叠状态、当前视图模式(演示/编辑)
- **verification**: stores 可正常 import，TypeScript 类型正确，单元测试覆盖核心逻辑
- **parallel_group**: foundation

---

### T-003: 路由与页面骨架

- **story**: ST-001
- **status**: done
- **depends_on**: [T-001]
- **write_paths**:
  - `apps/bi-playground/src/App.tsx`
  - `apps/bi-playground/src/main.tsx`
  - `apps/bi-playground/src/pages/`
  - `apps/bi-playground/src/layouts/`
- **read_paths**:
  - `apps/bi-playground/src/**`
- **description**: |
  1. 引入 React Router，配置路由结构：
     - `/` -> SceneDemo 页面（组件场景演示中心）
     - `/editor/:componentId/:sceneId` -> Editor 页面（DSL 编辑+预览）
  2. 创建 `AppLayout` 布局组件（三栏式：TopNav + LeftSidebar + MainContent）
  3. 创建 `SceneDemoPage` 和 `EditorPage` 两个页面骨架
  4. 保留原有 App 的核心功能（ChartPreview、ThemeSwitcher、ViewportSwitcher）
- **verification**: `pnpm --filter bi-playground dev` 可正常启动，路由切换正常
- **parallel_group**: foundation

---

## 阶段二：全局布局与导航

### T-004: 顶部导航栏组件

- **story**: ST-001
- **status**: done
- **depends_on**: [T-002, T-003]
- **write_paths**:
  - `apps/bi-playground/src/components/layout/TopNavBar.tsx`
  - `apps/bi-playground/src/components/layout/TopNavBar.module.css`
- **read_paths**:
  - `apps/bi-playground/src/stores/**`
  - `apps/bi-playground/src/components/ThemeSwitcher.tsx`
- **description**: |
  1. 品牌标识区域：BI 组件库 Logo + 名称
  2. 版本切换器（预留，暂用固定版本）
  3. 主题切换开关（复用已有 ThemeSwitcher 逻辑）
  4. 右侧入口按钮：「API 文档」(外链)、「测试中心」(预留)、「GitHub」(外链)
  5. 全局搜索框（UI 就绪，搜索逻辑在 T-006 实现）
  6. 使用 Ant Design Layout.Header + Space + Button 组件
- **verification**: 导航栏正确渲染，主题切换全局生效
- **parallel_group**: navigation

---

### T-005: 左侧组件导航栏（分类树 + 列表）

- **story**: ST-002
- **status**: done
- **depends_on**: [T-002, T-003]
- **write_paths**:
  - `apps/bi-playground/src/components/layout/LeftSidebar.tsx`
  - `apps/bi-playground/src/components/layout/ComponentTree.tsx`
  - `apps/bi-playground/src/components/layout/ComponentTreeItem.tsx`
  - `apps/bi-playground/src/components/layout/Sidebar.module.css`
- **read_paths**:
  - `apps/bi-playground/src/stores/useComponentStore.ts`
  - `packages/bi-engine/src/schema/**`
  - `apps/bi-playground/src/components/FixtureSelector.tsx`
- **description**: |
  1. 左侧栏容器：默认 240px 宽，支持折叠至 64px（仅展示图标），支持拖拽调整宽度（200-400px）
  2. 组件分类树：6 个一级分类，支持展开/折叠，状态本地缓存
  3. 分类下的组件列表项：图标 + 名称 + 描述 + 测试状态标记（✅/❌/⚪）
  4. 选中组件项高亮，点击切换主内容区
  5. 折叠按钮（Ctrl+B 快捷键联动）
  6. 使用 Ant Design Tree 或 Menu + Sider 组件
  7. 从 bi-engine 的 fixture registry 获取组件列表数据
- **verification**: 组件树正确渲染，分类展开/折叠正常，选中联动正确
- **parallel_group**: navigation

---

### T-006: 组件搜索与过滤

- **story**: ST-002
- **status**: done
- **depends_on**: [T-005]
- **write_paths**:
  - `apps/bi-playground/src/components/layout/ComponentSearch.tsx`
  - `apps/bi-playground/src/components/layout/ComponentSearch.module.css`
- **read_paths**:
  - `apps/bi-playground/src/stores/useComponentStore.ts`
- **description**: |
  1. 搜索框位于分类树顶部，固定位置
  2. 输入关键词实时过滤组件列表（名称、描述匹配）
  3. 搜索结果高亮匹配关键词
  4. 无匹配结果时展示「暂无匹配组件」提示
  5. 搜索响应时间 <=200ms
  6. 回车快速选中首个匹配结果
  7. 全局快捷键 Ctrl+K 聚焦搜索框
- **verification**: 搜索过滤正确，高亮显示正常，快捷键生效
- **parallel_group**: navigation

---

## 阶段三：组件场景演示中心

### T-007: 组件概览与场景卡片

- **story**: ST-003
- **status**: done
- **depends_on**: [T-003]
- **write_paths**:
  - `apps/bi-playground/src/pages/SceneDemoPage.tsx`
  - `apps/bi-playground/src/components/demo/ComponentOverview.tsx`
  - `apps/bi-playground/src/components/demo/SceneCardList.tsx`
  - `apps/bi-playground/src/components/demo/SceneCard.tsx`
  - `apps/bi-playground/src/components/demo/SceneDemo.module.css`
- **read_paths**:
  - `apps/bi-playground/src/stores/**`
  - `packages/bi-engine/src/schema/**`
- **description**: |
  1. `SceneDemoPage` - 主内容区默认视图
  2. `ComponentOverview` - 顶部展示组件名称、版本、描述、能力标签（Tag 组件）
  3. `SceneCardList` - 场景卡片网格布局，每个卡片包含标题、描述
  4. `SceneCard` - 点击展开/收起详情面板
  5. 从 fixture registry 获取当前组件的场景数据
  6. 场景卡片支持测试状态标记
- **verification**: 切换组件时场景演示正确更新，卡片展开/收起正常
- **parallel_group**: demo

---

### T-008: 场景详情面板（交互预览 + DSL + 工具栏）

- **story**: ST-003
- **status**: done
- **depends_on**: [T-007]
- **write_paths**:
  - `apps/bi-playground/src/components/demo/SceneDetail.tsx`
  - `apps/bi-playground/src/components/demo/InteractivePreview.tsx`
  - `apps/bi-playground/src/components/demo/DslCodeSnippet.tsx`
  - `apps/bi-playground/src/components/demo/SceneToolbar.tsx`
  - `apps/bi-playground/src/components/demo/SceneDetail.module.css`
- **read_paths**:
  - `apps/bi-playground/src/components/ChartPreview.tsx`
  - `apps/bi-playground/src/components/JsonPreview.tsx`
  - `apps/bi-playground/src/stores/**`
- **description**: |
  1. `InteractivePreview` - 嵌入完整可交互的 ChartPreview 组件
  2. `DslCodeSnippet` - 展示 DSL JSON，语法高亮（可使用轻量级 highlighter 或 pre+code），右上角一键复制按钮
  3. `SceneToolbar` - 三个核心按钮：
     - 「在编辑器中打开」-> 导航到 `/editor/:componentId/:sceneId`
     - 「运行单场景测试」(预留，T-013 实现逻辑)
     - 「生成基准图」(预留，T-014 实现逻辑)
  4. 展开/收起动画
- **verification**: 场景详情面板正确渲染，组件可交互，DSL 复制正常，编辑器跳转正确
- **parallel_group**: demo

---

## 阶段四：DSL 编辑器与实时预览

### T-009: Monaco Editor 集成与工具栏

- **story**: ST-004
- **status**: done
- **depends_on**: [T-003]
- **write_paths**:
  - `apps/bi-playground/src/components/editor/DslEditor.tsx`
  - `apps/bi-playground/src/components/editor/EditorToolbar.tsx`
  - `apps/bi-playground/src/components/editor/DslEditor.module.css`
- **read_paths**:
  - `apps/bi-playground/src/stores/useEditorStore.ts`
  - `packages/bi-engine/src/schema/**`
- **description**: |
  1. 基于 `@monaco-editor/react` 集成 Monaco Editor
  2. 配置 JSON 语言模式，语法高亮、代码折叠、行号、右键菜单
  3. 编辑器工具栏（固定在顶部）：
     - 「重置」：恢复初始 DSL，二次确认
     - 「格式化」：一键格式化 JSON
     - 「复制 DSL」：复制完整配置
     - 「导出配置」：下载为 JSON 文件（组件名-场景名-时间戳.json）
     - 「保存为测试用例」：弹出弹窗（预留，T-015 实现）
     - 「运行测试」（预留，T-013 实现）
  4. 编辑器设置：字号、换行模式本地缓存
  5. DSL 修改历史本地缓存最近 10 次，支持回退
- **verification**: 编辑器正确渲染，JSON 语法高亮，工具栏按钮可用
- **parallel_group**: editor

---

### T-010: DSL 语法校验与自动补全

- **story**: ST-004
- **status**: done
- **depends_on**: [T-009]
- **write_paths**:
  - `apps/bi-playground/src/components/editor/dsl-schema.ts`
  - `apps/bi-playground/src/components/editor/monaco-setup.ts`
- **read_paths**:
  - `packages/bi-engine/src/schema/bi-engine-models.ts`
  - `packages/bi-engine/src/schema/index.ts`
- **description**: |
  1. 基于 bi-engine 的 TypeScript 类型定义，生成 JSON Schema（dsl-schema.ts）
  2. 注册 Monaco 的 JSON Schema 校验，实时标红错误（格式错误、参数类型错误）
  3. hover 错误标记时展示详细错误提示
  4. 自动补全：基于 JSON Schema 实现参数名、枚举值补全
  5. 补全响应时间 <=300ms
  6. monaco-setup.ts 封装所有 Monaco 配置注册逻辑
- **verification**: 输入错误 DSL 时标红，hover 展示错误，补全弹出正确建议
- **parallel_group**: editor

---

### T-011: 实时渲染预览与预览工具栏

- **story**: ST-004
- **status**: done
- **depends_on**: [T-009]
- **write_paths**:
  - `apps/bi-playground/src/components/editor/LivePreview.tsx`
  - `apps/bi-playground/src/components/editor/PreviewToolbar.tsx`
  - `apps/bi-playground/src/components/editor/LivePreview.module.css`
- **read_paths**:
  - `apps/bi-playground/src/components/ChartPreview.tsx`
  - `apps/bi-playground/src/stores/**`
- **description**: |
  1. `LivePreview` - 渲染容器，监听 DSL 变化，300ms 防抖触发重新渲染
  2. 渲染过程中展示 loading 动画（Spin 组件）
  3. 渲染失败展示友好错误提示（Alert 组件），标注错误原因与位置
  4. 使用 React ErrorBoundary 包裹渲染区域
  5. `PreviewToolbar` - 预览区顶部工具栏：
     - 「全屏预览」：隐藏编辑器，全屏展示，ESC 退出
     - 「主题切换」：与全局主题联动
     - 「视口切换」：PC(1920px) / 平板(1366px) / 移动端(375px) + 自定义
     - 「禁用动画」：开关控件
- **verification**: 修改 DSL 后 300ms 内预览更新，渲染失败显示错误，工具栏按钮可用
- **parallel_group**: editor

---

### T-012: 可拖拽分栏布局与编辑器页面集成

- **story**: ST-004
- **status**: done
- **depends_on**: [T-009, T-011]
- **write_paths**:
  - `apps/bi-playground/src/pages/EditorPage.tsx`
  - `apps/bi-playground/src/components/editor/SplitPane.tsx`
  - `apps/bi-playground/src/pages/EditorPage.module.css`
- **read_paths**:
  - `apps/bi-playground/src/stores/**`
- **description**: |
  1. `SplitPane` - 左右等分可拖拽分栏组件：
     - 拖拽调整宽度，最小占比 30%，最大 70%
     - 拖拽手柄清晰可见
  2. `EditorPage` - 组合 DslEditor + SplitPane + LivePreview
  3. 进入编辑器时自动加载当前场景的 DSL 配置
  4. 编辑器页面支持从场景演示页跳转（携带 componentId + sceneId）
- **verification**: 分栏可拖拽，限制范围生效，编辑器与预览区联动正常
- **parallel_group**: editor

---

## 阶段五：基础视觉回归测试

### T-013: 测试用例模型与 IndexedDB 存储

- **story**: ST-005
- **status**: done
- **depends_on**: [T-002]
- **write_paths**:
  - `apps/bi-playground/src/services/vrt/`
  - `apps/bi-playground/src/services/vrt/test-case-model.ts`
  - `apps/bi-playground/src/services/vrt/db.ts`
  - `apps/bi-playground/src/services/vrt/test-case-service.ts`
- **read_paths**:
  - `apps/bi-playground/src/stores/useTestStore.ts`
  - `apps/bi-playground/src/stores/useEditorStore.ts`
- **description**: |
  1. 定义测试用例数据模型（TestCase interface）：
     - id, name, componentId, sceneId, dsl, mockData, tags, priority
     - viewportSize, theme, environment config
     - ignoreRegions (矩形区域数组)
     - baselineImageId, createdAt, updatedAt
  2. 基于 idb 库封装 IndexedDB 操作：
     - test-cases store: CRUD + 索引（按组件、标签、优先级）
     - baseline-images store: 存储基准图 Blob + 元数据
     - test-results store: 存储测试结果
  3. TestCaseService 类：封装所有测试用例的 CRUD 操作
  4. 保存为测试用例弹窗 UI（Modal 组件）
- **verification**: IndexedDB 读写正常，CRUD 操作无报错
- **parallel_group**: vrt

---

### T-014: 基准图生成与像素对比引擎

- **story**: ST-005
- **status**: done
- **depends_on**: [T-013]
- **write_paths**:
  - `apps/bi-playground/src/services/vrt/capture.ts`
  - `apps/bi-playground/src/services/vrt/comparator.ts`
  - `apps/bi-playground/src/services/vrt/baseline-service.ts`
- **read_paths**:
  - `apps/bi-playground/src/services/vrt/db.ts`
- **description**: |
  1. `capture.ts` - 截图捕获：
     - 使用 html2canvas 或 dom-to-image 对渲染区截图
     - 截图时禁用动画、固定 DPI
     - 等待组件完全渲染后截图
  2. `comparator.ts` - 像素对比引擎：
     - 集成 pixelmatch 做像素级对比
     - 集成 Resemble.js 做差异可视化渲染
     - 支持配置差异阈值（默认 0.1%）
     - 支持忽略区域掩码（矩形区域）
     - 输出差异像素数、差异占比、差异位置
  3. `baseline-service.ts` - 基准图管理：
     - 生成基准图并存储到 IndexedDB
     - 基准图与用例 ID + 版本绑定
     - 支持更新基准图（覆盖）
     - 支持导出/导入基准图（JSON + 图片打包）
- **verification**: 截图生成正确，像素对比可识别差异，基准图 CRUD 正常
- **parallel_group**: vrt

---

### T-015: 差异展示与测试结果 UI

- **story**: ST-005
- **status**: done
- **depends_on**: [T-014]
- **write_paths**:
  - `apps/bi-playground/src/components/vrt/DiffViewer.tsx`
  - `apps/bi-playground/src/components/vrt/TestResultCard.tsx`
  - `apps/bi-playground/src/components/vrt/SaveTestCaseModal.tsx`
  - `apps/bi-playground/src/components/vrt/Vrt.module.css`
- **read_paths**:
  - `apps/bi-playground/src/services/vrt/**`
  - `apps/bi-playground/src/stores/**`
- **description**: |
  1. `DiffViewer` - 三图对比布局（基准图 / 当前截图 / 差异高亮图）：
     - 差异区域红色标记，忽略区域灰色遮罩
     - 支持放大查看细节
     - 展示差异像素数、差异占比、差异类型
     - 操作按钮：更新基准图、跳转编辑器、忽略差异、重新测试
  2. `TestResultCard` - 单条测试结果卡片：
     - 通过/失败状态标记
     - 差异缩略图预览
     - 点击展开 DiffViewer
  3. `SaveTestCaseModal` - 保存测试用例弹窗：
     - 用例名称、标签、优先级、Mock 数据绑定
     - 与编辑器工具栏和场景工具栏集成
  4. 在场景演示页和编辑器页面集成测试操作按钮
- **verification**: 差异展示清晰，操作按钮可用，保存用例弹窗正常
- **parallel_group**: vrt

---

## 阶段六：集成与优化

### T-016: 全局集成、快捷键与响应式适配

- **story**: ST-001
- **status**: done
- **depends_on**: [T-004, T-005, T-008, T-012, T-015]
- **write_paths**:
  - `apps/bi-playground/src/hooks/`
  - `apps/bi-playground/src/components/layout/ResponsiveLayout.tsx`
  - `apps/bi-playground/src/App.tsx`
- **read_paths**:
  - `apps/bi-playground/src/**`
- **description**: |
  1. `useKeyboardShortcuts` hook：
     - Ctrl+K: 聚焦搜索框
     - Ctrl+S: 保存当前 DSL/测试用例
     - Ctrl+B: 折叠/展开侧栏
     - Ctrl+Enter: 手动触发渲染更新
  2. `useLocalCache` hook：缓存用户偏好（主题、侧栏宽度、最近访问组件、折叠状态）
  3. `ResponsiveLayout` - 响应式适配：
     - >=1200px: 完整三栏
     - 768-1200px: 侧栏收起，抽屉式浮层
     - <768px: 汉堡菜单 + 抽屉
  4. 页面状态恢复：刷新后自动恢复至上次状态
- **verification**: 快捷键全部生效，响应式布局在三个断点正常，刷新后状态恢复
- **parallel_group**: integration
