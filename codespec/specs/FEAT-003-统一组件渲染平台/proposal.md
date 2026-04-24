# FEAT-003: 统一组件渲染平台

## 问题

当前 bi-engine 是纯图表渲染引擎，管线硬编码为 `ChartComponent → validate → normalize → resolve → buildSemanticModel → buildEChartsOption → ChartView`。权威模型已定义 TextComponent、TableComponent、MarkdownComponent、CompositeTable 等组件类型，但引擎仅支持 chart 一种。

核心限制：
1. **Chart-Only 管线**：所有 core/ 函数硬编码为图表专用
2. **ECharts 紧耦合**：ChartView 直接 import buildEChartsOption，use-chart-instance 直接 import echarts
3. **无扩展机制**：没有注册表、插件系统或适配器抽象
4. **无模式概念**：不支持设计态/运行态切换

## 目标

建立统一的组件渲染平台层，使引擎能支持任意组件类型：

1. **统一渲染管线**：`BIEngineComponent → Registry 分发 → Handler(validate → normalize → resolve → buildModel) → Renderer → React Node`
2. **组件注册表**：单例 ComponentRegistry，按 `component.type` 分发到对应处理器
3. **适配器抽象**：ChartAdapter 接口解耦渲染库依赖
4. **渲染模式**：RenderMode (DESIGN/RUNTIME) Context 注入，预留设计态扩展点
5. **向后兼容**：现有 ChartView API 不 break，渐进迁移

## 范围

### 包含
- `src/platform/` — 注册表、渲染模式、错误类型
- `src/pipeline/` — 统一管线引擎
- `src/adapters/` — 适配器抽象接口 + ChartAdapterRegistry
- `src/react/ComponentView.tsx` — 统一组件视图
- `src/react/DesignableWrapper.tsx` — 设计态包装器（骨架）
- `src/design/` — 设计态 Context 骨架
- `src/index.ts` 更新 — 新增 v2.0 导出 + v1.0 兼容

### 不包含
- 具体 table/text/markdown 处理器实现（FEAT-005）
- 图表处理器迁移（FEAT-004，将 core/ 代码迁到 component-handlers/chart/）
- 设计态完整交互（FEAT-006，拖拽、属性面板等）
- CompositeTable 处理器

## 依赖

- FEAT-001（图表渲染引擎）已完成，提供基础管线代码
- 无外部依赖新增

## 风险

| 风险 | 影响 | 缓解 |
|------|------|------|
| 管线抽象过度设计 | 增加不必要的复杂度 | 只抽象必要的 5 个策略，避免通用化陷阱 |
| 向后兼容 break | 现有 Playground 功能异常 | Phase 1 不改 core/，只新增 platform/ |
| 注册表单例测试困难 | 全局状态泄漏 | 提供 clear() 方法，每个测试重置 |

## 验收标准

1. `ComponentRegistry` 单例可注册/获取组件处理器，支持 `has()`/`getOrThrow()`/`clear()`
2. `PipelineEngine` 执行四阶段管线，failFast 模式下首个失败即停止
3. `ComponentView` 根据 `component.type` 从注册表获取处理器并执行管线
4. `RenderModeProvider` 注入 DESIGN/RUNTIME 模式，`useRenderMode()` 正确读取
5. `DesignableWrapper` 在 RUNTIME 模式下零开销（不添加额外 DOM），DESIGN 模式下包裹选中态 UI 骨架
6. 现有 `ChartView` 功能不受影响（零改动 core/）
7. TypeScript 编译零错误，新增代码测试覆盖率 >= 80%
