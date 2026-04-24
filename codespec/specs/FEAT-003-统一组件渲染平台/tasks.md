# FEAT-003 Tasks

## Phase 1: 类型与错误体系

### T-001: 创建 platform/types.ts
- **Story**: ST-001
- **输入**: 架构设计文档中的接口定义
- **输出**: `src/platform/types.ts`
- **写范围**: `src/platform/types.ts`
- **读范围**: `src/schema/bi-engine-models.ts`
- **验证**: tsc 编译零错误
- **内容**:
  - RenderMode 枚举
  - PipelineResult<T> 接口
  - ComponentError 接口
  - ComponentValidator / Normalizer / Resolver / ModelBuilder / Renderer 策略接口
  - ComponentHandler 聚合接口
  - ValidationOutput / ValidationWarning
  - NormalizedComponent / ResolvedData
  - RenderContext / ComponentEventHandlers

### T-002: 创建 platform/errors.ts
- **Story**: ST-001
- **输入**: ComponentError 接口
- **输出**: `src/platform/errors.ts`
- **写范围**: `src/platform/errors.ts`
- **读范围**: `src/platform/types.ts`, `src/core/chart-render-error.ts`
- **验证**: tsc 编译零错误
- **内容**:
  - 平台级错误工厂函数
  - 错误码常量 (UNSUPPORTED_COMPONENT_TYPE, VALIDATION_FAILED 等)
  - 兼容现有 ChartRenderErrorCategory

### T-003: 创建 platform/index.ts
- **Story**: ST-001
- **输入**: types.ts + errors.ts
- **输出**: `src/platform/index.ts`
- **写范围**: `src/platform/index.ts`
- **验证**: tsc 编译零错误
- **内容**: 统一导出 platform 层所有公共 API

---

## Phase 2: 注册表与管线

### T-004: 创建 platform/component-registry.ts
- **Story**: ST-002
- **输入**: ComponentHandler 接口
- **输出**: `src/platform/component-registry.ts`
- **写范围**: `src/platform/component-registry.ts`
- **读范围**: `src/platform/types.ts`
- **验证**: 单元测试 >= 80%
- **内容**:
  - ComponentRegistry 单例类 (register/registerOrReplace/get/getOrThrow/has/getRegisteredTypes/clear)
  - registerComponentHandler() / getComponentHandler() 便捷函数

### T-005: 创建 platform/render-mode.tsx
- **Story**: ST-003
- **输入**: RenderMode 枚举
- **输出**: `src/platform/render-mode.tsx`
- **写范围**: `src/platform/render-mode.tsx`
- **读范围**: `src/platform/types.ts`
- **验证**: tsc 编译零错误
- **内容**:
  - RenderModeContext
  - RenderModeProvider 组件
  - useRenderMode() hook
  - useIsDesignMode() hook

### T-006: 创建 pipeline/pipeline-engine.ts
- **Story**: ST-004
- **输入**: ComponentHandler 接口, ComponentRegistry
- **输出**: `src/pipeline/pipeline-engine.ts`
- **写范围**: `src/pipeline/pipeline-engine.ts`
- **读范围**: `src/platform/types.ts`, `src/platform/component-registry.ts`
- **验证**: 单元测试 >= 80%
- **内容**:
  - PipelineConfig 接口
  - PipelineExecutionResult 接口
  - PipelineEngine 类 (execute 方法)
  - defaultPipelineEngine 默认实例

### T-007: 创建 pipeline/index.ts
- **Story**: ST-004
- **输入**: pipeline-engine.ts
- **输出**: `src/pipeline/index.ts`
- **写范围**: `src/pipeline/index.ts`
- **验证**: tsc 编译零错误

---

## Phase 3: 适配器抽象

### T-008: 创建 adapters/index.ts (适配器接口)
- **Story**: ST-005
- **输入**: 架构设计文档
- **输出**: `src/adapters/index.ts`
- **写范围**: `src/adapters/index.ts` (新建，不覆盖 echarts/index.ts)
- **读范围**: `src/adapters/echarts/`
- **验证**: tsc 编译零错误
- **内容**:
  - ChartAdapter<TModel, TOutput> 接口
  - ChartAdapterRegistry 单例类

### T-009: 创建 adapters/echarts/echarts-adapter.ts
- **Story**: ST-005
- **输入**: ChartAdapter 接口, 现有 buildEChartsOption
- **输出**: `src/adapters/echarts/echarts-adapter.ts`
- **写范围**: `src/adapters/echarts/echarts-adapter.ts`
- **读范围**: `src/adapters/echarts/index.ts`, `src/core/chart-semantic-model.ts`
- **验证**: tsc 编译零错误
- **内容**:
  - EChartsAdapter 类实现 ChartAdapter 接口
  - adapt() 委托给 buildEChartsOption()
  - echartsAdapter 默认实例

---

## Phase 4: React 组件层

### T-010: 创建 react/ComponentView.tsx
- **Story**: ST-006
- **输入**: PipelineEngine, ComponentRegistry, RenderMode
- **输出**: `src/react/ComponentView.tsx`
- **写范围**: `src/react/ComponentView.tsx`
- **读范围**: `src/platform/`, `src/pipeline/`, `src/react/ChartView.tsx`
- **验证**: tsc 编译零错误
- **内容**:
  - ComponentViewProps 接口
  - ComponentView 组件 (获取 handler → 执行管线 → 渲染)
  - ErrorFallback 内部组件

### T-011: 创建 design/ 目录骨架
- **Story**: ST-007
- **输入**: RenderMode, RenderContext
- **输出**: `src/design/selection-context.tsx`, `src/design/index.ts`
- **写范围**: `src/design/`
- **读范围**: `src/platform/render-mode.tsx`
- **验证**: tsc 编译零错误
- **内容**:
  - SelectionProvider / useSelection()
  - design/index.ts 统一导出

### T-012: 创建 react/DesignableWrapper.tsx
- **Story**: ST-007
- **输入**: RenderMode, SelectionContext
- **输出**: `src/react/DesignableWrapper.tsx`
- **写范围**: `src/react/DesignableWrapper.tsx`
- **读范围**: `src/platform/render-mode.tsx`, `src/design/selection-context.tsx`
- **验证**: tsc 编译零错误
- **内容**:
  - DesignableWrapper 组件 (RUNTIME 零包装, DESIGN 添加属性和边框)
  - DesignOverlay 内部组件 (手柄和操作按钮占位)

---

## Phase 5: 自动注册与导出

### T-013: 创建 component-handlers/ 骨架
- **Story**: ST-008
- **输入**: ComponentHandler 接口, 现有 core/ 代码
- **输出**: `src/component-handlers/chart/index.ts`, `src/component-handlers/index.ts`
- **写范围**: `src/component-handlers/`
- **读范围**: `src/platform/types.ts`, `src/core/`
- **验证**: tsc 编译零错误
- **内容**:
  - chart 骨架处理器：直接委托给现有 validateChartComponent / normalizeChartComponent / resolveChartData / buildSemanticModel
  - chartRenderer：委托给 EChartsAdapter + useChartInstance
  - table/text/markdown 骨架：返回 UNSUPPORTED_COMPONENT_TYPE

### T-014: 创建 platform/auto-registry.ts
- **Story**: ST-008
- **输入**: ComponentRegistry, 各骨架处理器
- **输出**: `src/platform/auto-registry.ts`
- **写范围**: `src/platform/auto-registry.ts`
- **读范围**: `src/component-handlers/`
- **验证**: tsc 编译零错误
- **内容**:
  - registerBuiltinHandlers() 函数
  - 注册 chart/table/text/markdown 四个骨架处理器

### T-015: 更新 src/index.ts 公共导出
- **Story**: ST-008
- **输入**: 所有新增模块
- **输出**: `src/index.ts` (更新)
- **写范围**: `src/index.ts`
- **读范围**: `src/platform/`, `src/pipeline/`, `src/react/ComponentView.tsx`
- **验证**: tsc 编译零错误 + pnpm build:engine 成功
- **内容**:
  - 新增 v2.0 导出：ComponentView, RenderModeProvider, useRenderMode, ComponentRegistry, PipelineEngine, registerBuiltinHandlers
  - 保留所有 v1.0 导出不变

---

## 任务依赖关系

```
T-001 ─→ T-002 ─→ T-003
  │                │
  ├─→ T-004        ├─→ T-005
  │                │
  ├─→ T-006 ─→ T-007
  │
  ├─→ T-008 ─→ T-009
  │
  ├─→ T-010 (依赖 T-004, T-005, T-006)
  │
  ├─→ T-011 ─→ T-012
  │
  └─→ T-013 ─→ T-014 ─→ T-015
```

**可并行的任务组**:
- 组 A: T-004 (注册表) + T-005 (渲染模式) + T-008 (适配器接口)
- 组 B: T-011 (设计骨架) 独立于 T-010
