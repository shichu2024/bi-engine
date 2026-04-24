# FEAT-003 Stories

## ST-001: 平台类型与错误体系

**用户价值**: 为所有组件类型提供统一的类型定义和错误处理基础。

**验收标准**:
1. 定义 `RenderMode` 枚举 (RUNTIME/DESIGN)
2. 定义 `PipelineResult<T>` 接口 (ok/data/error)
3. 定义 `ComponentError` 接口 (code/message/stage)
4. 定义 `ComponentHandler` 接口及其 5 个策略子接口 (validator/normalizer/resolver/modelBuilder/renderer)
5. 定义 `RenderContext` 接口 (mode/theme/componentId/selected/events)
6. 所有类型仅定义在 `src/platform/types.ts`，其他文件通过 import 引用
7. TypeScript 编译零错误

---

## ST-002: 组件注册表

**用户价值**: 提供单例注册表，支持运行时注册和发现组件处理器。

**验收标准**:
1. `ComponentRegistry` 单例模式，`getInstance()` 返回唯一实例
2. `register(type, handler)` 注册处理器，重复注册抛错
3. `registerOrReplace(type, handler)` 覆盖注册
4. `get(type)` 获取处理器，未注册返回 undefined
5. `getOrThrow(type)` 获取处理器，未注册抛错
6. `has(type)` 检查是否已注册
7. `getRegisteredTypes()` 返回所有已注册类型
8. `clear()` 清空注册表（测试用）
9. 便捷函数 `registerComponentHandler()` / `getComponentHandler()`
10. 单元测试覆盖率 >= 80%

---

## ST-003: 渲染模式 Context

**用户价值**: 支持设计态/运行态切换，组件根据模式自适应行为。

**验收标准**:
1. `RenderModeContext` 提供 DESIGN/RUNTIME 值
2. `RenderModeProvider` 组件接受 `mode` prop 注入 Context
3. `useRenderMode()` hook 返回当前模式
4. `useIsDesignMode()` hook 返回布尔值
5. 默认值为 RUNTIME（不包 Provider 时安全降级）
6. TypeScript 编译零错误

---

## ST-004: 统一管线引擎

**用户价值**: 提供组件类型无关的管线执行器，支持任意组件的四阶段处理。

**验收标准**:
1. `PipelineEngine` 接受 `PipelineConfig` (failFast/collectWarnings)
2. `execute(component)` 方法执行 validate → normalize → resolve → buildModel 四阶段
3. failFast=true 时，首个失败阶段立即返回错误
4. 返回 `PipelineExecutionResult` 包含各阶段独立结果
5. 未注册的组件类型返回 UNSUPPORTED_COMPONENT_TYPE 错误
6. 默认实例 `defaultPipelineEngine` 使用 failFast=true
7. 单元测试覆盖率 >= 80%

---

## ST-005: 适配器抽象层

**用户价值**: 解耦图表渲染库依赖，支持未来替换或并行多种图表库。

**验收标准**:
1. `ChartAdapter<TModel, TOutput>` 接口定义 (name/version/adapt/render)
2. `ChartAdapterRegistry` 单例管理图表适配器
3. `EChartsAdapter` 实现接口，`adapt()` 委托给现有 `buildEChartsOption()`
4. 适配器接口不依赖 echarts 类型
5. TypeScript 编译零错误

---

## ST-006: 统一组件视图 (ComponentView)

**用户价值**: 提供单一 React 组件，根据 component.type 自动分发到正确处理器并渲染。

**验收标准**:
1. `ComponentView` 接受 `BIEngineComponent` 作为输入
2. 根据 `component.type` 从 ComponentRegistry 获取处理器
3. 执行 PipelineEngine.execute() 获取语义模型
4. 调用 handler.renderer.render() 生成 React 节点
5. 错误时渲染 ErrorFallback 组件并调用 onError
6. 支持设计态包装（通过 DesignableWrapper）
7. 支持 className/style 透传

---

## ST-007: 设计态包装器骨架

**用户价值**: 预留设计态扩展点，运行态零开销。

**验收标准**:
1. `DesignableWrapper` 在 RUNTIME 模式下不添加额外 DOM 层
2. DESIGN 模式下添加 `data-component-id` 和 `data-render-mode` 属性
3. DESIGN 模式下点击组件触发 `onSelect` 回调
4. `SelectionProvider` + `useSelection()` 管理选中状态
5. 选中态显示蓝色边框骨架（CSS class，非内联样式）
6. `DesignOverlay` 组件渲染拖拽手柄占位和删除按钮占位

---

## ST-008: 自动注册与公共导出

**用户价值**: 开箱即用，import 后自动注册内置处理器。

**验收标准**:
1. `registerBuiltinHandlers()` 函数注册 chart/table/text/markdown 骨架处理器
2. chart 骨架处理器委托给现有 core/ 管线（不迁移代码）
3. table/text/markdown 骨架处理器返回 UNSUPPORTED_COMPONENT_TYPE（FEAT-005 补齐）
4. `src/index.ts` 新增 v2.0 导出：ComponentView、RenderModeProvider、ComponentRegistry 等
5. 保留所有 v1.0 导出，不 break 现有消费者
6. `src/platform/index.ts` 统一导出平台层所有公共 API
