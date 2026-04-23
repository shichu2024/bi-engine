# DSL 图表渲染引擎架构

## 1. 设计目标

第一版图表引擎要解决的核心问题只有一个：

给定权威模型中的 `ChartComponent`，稳定得到可渲染图表，并且这套能力可以以一个 npm 包的形式发布和持续回归验证。

这里的“权威模型”指：

- [模型定义汇总.ts](./模型定义汇总.ts)

它不应该承担：

- 页面路由
- 模板管理
- 远程数据调度编排的完整平台能力
- 编辑器交互
- AI 能力

这可以保证我们优先把“组件模型对齐”和“图表渲染管线”做稳。

虽然首阶段重点是图表渲染，但包名统一使用 `bi-engine`，因为长期宿主是 `BIEngineComponent`，不仅包含 chart，也包含 text/table/markdown/compositeTable。

---

## 2. 推荐模块拆分

```text
apps/
  bi-playground/
    src/routes/
    src/components/
    tests/visual/

packages/
  bi-engine/
    src/
      schema/
        bi-engine-models.ts
      validator/
        validate-chart-component.ts
      model/
        normalize-chart-component.ts
        chart-semantic-model.ts
      data/
        resolve-chart-data.ts
        build-series-data.ts
      adapters/
        echarts/
          build-line-option.ts
          build-bar-option.ts
          build-pie-option.ts
          merge-chart-option.ts
          index.ts
      react/
        ChartView.tsx
        ChartStateView.tsx
        use-chart-instance.ts
        chart-theme-context.tsx
      theme/
      formatters/
      errors/
      testing/
        fixtures/
        fixture-registry.ts
        test-helpers/
      contracts/
      roadmap/

tooling/
  visual-regression/
    capture-candidates.ts
    approve-baselines.ts
```

### 为什么首阶段只发一个包

因为这次目标不是练习包拆分，而是用最低额外成本把“权威模型 -> 渲染结果”的闭环做出来：

- 发布和外部消费更简单
- 版本管理更简单
- 本地联调和 `bi-playground` 接入更简单
- 内部边界仍然可以靠目录分层和子路径导出维持清晰
- 包名也能提前对齐长期语义，避免后续从 `chart-engine` 再迁移到更宽的名字

---

## 3. 处理链路

推荐采用如下管线：

```text
ChartComponent
  -> validateChartComponent
  -> normalizeChartComponent
  -> resolveChartData(dataProperties)
  -> buildSeriesData(series.encode)
  -> ChartSemanticModel
  -> buildVendorOption(adapter)
  -> ChartView render
  -> bi-playground visual capture / regression
```

### 3.1 `validateChartComponent`

职责：

- 检查 `component.type === 'chart'`
- 检查 `dataProperties`、`series` 是否完整
- 检查 `Series` 是否属于首阶段支持子集
- 检查 `Axis`、`encode`、`ChartOption` 基本形状
- 检查 `dataType` 是否可执行

输出：

- `ok`
- 或结构化错误列表

### 3.2 `normalizeChartComponent`

职责：

- 归一化 `xAxis / yAxis` 为统一内部结构
- 归一化 `series`、`options` 默认值
- 归一化 `layout` 与尺寸相关输入
- 为后续 adapter 提供稳定语义输入

输出：

- `NormalizedChartComponent`

### 3.3 `resolveChartData`

职责：

- 从 `ChartDataProperty` 中解析图表数据
- 首阶段强支持 `dataType = 'static'`
- 对 `datasource / api` 返回结构化 unsupported

输出：

- 图表无关的数据中间结构

### 3.4 `buildSeriesData`

职责：

- 基于 `Series.encode` 生成系列数据
- 处理 `LineSeries / BarSeries / PieSeries`
- 处理 `xAxisIndex / yAxisIndex`

输出：

- 面向 adapter 的系列级数据结构

### 3.5 `ChartSemanticModel`

职责：

- 作为引擎内部稳定协议
- 隔离权威模型与 ECharts option

推荐字段：

- `componentId`
- `seriesKind`
- `title`
- `axes`
- `series`
- `dataset`
- `tooltip`
- `formatters`
- `theme`
- `chartOption`

### 3.6 Adapter

职责：

- 只负责把语义模型变成 vendor option
- 不负责业务校验
- 不负责页面逻辑
- 受控合并 `ChartOption.eChartOption`

### 3.7 `bi-playground`

职责：

- 提供 fixture 选择、组件 JSON 预览和图表预览
- 作为手工调试入口
- 作为视觉回归测试宿主
- 作为 candidate / baseline review 的可视化上下文

---

## 4. 单包内部边界建议

### 4.1 `src/schema`

承载：

- 权威模型镜像文件
- 类型与枚举导出

注意：

- 这里不做语义改名
- 不做协议瘦身

### 4.2 `src/validator`

承载：

- `ChartComponent` 相关结构校验
- 首阶段支持矩阵校验

### 4.3 `src/model` 与 `src/data`

承载：

- 语义归一化
- 数据解析
- 系列数据构造

### 4.4 `src/adapters`

承载：

- vendor option builder

### 4.5 `src/react`

承载：

- 图表实例生命周期
- 三态渲染
- 主题上下文

### 4.6 `src/testing`

承载：

- fixture registry
- test helpers
- 给 `bi-playground` 与自动化测试复用的输入资产

截图基线、candidate 和 diff 产物不要放进包里，应放在 `bi-playground` 的测试目录下。

---

## 5. 导出策略建议

首阶段只发布：

- `@your-scope/bi-engine`

必要时可提供单包子路径导出：

- `@your-scope/bi-engine/testing`

根导出建议至少包含：

- `BIEngineComponent`
- `ChartComponent`
- `ChartDataProperty`
- `Series`
- `Axis`
- `ChartOption`
- `Column`
- `Dashboard`
- `Report`
- `PPT`
- `ChartView`
- `validateChartComponent`

这样可以保证 schema 层与 runtime 层仍然围绕同一份模型。

---

## 6. 关键设计决策

## 6.1 先支持权威模型里的少量系列类型

第一版建议只强支持：

- `LineSeries`
- `BarSeries`
- `PieSeries`

原因：

- 这三类最常见
- 足够验证权威模型的表达能力
- 足够验证笛卡尔轴与饼图两类主渲染路径

## 6.2 先支持 `dataType = 'static'`

第一版不要先把完整 datasource/api 执行链路耦合进来。

这意味着：

- `static` 可直接渲染
- `datasource / api` 在校验与运行时返回结构化 unsupported

## 6.3 先做 adapter 隔离

即使第一版只接 ECharts，也不要让业务层直接使用 ECharts option。

否则后续会出现：

- schema 难以稳定
- AI 难以生成
- 编辑器难以理解
- 切换图表库成本极高

---

## 7. React 宿主职责

`ChartView.tsx` 应只做宿主职责：

- 接收 `component: ChartComponent`
- 创建/销毁图表实例
- 调用引擎与 adapter
- 展示 loading/empty/error

可选扩展：

- `resolvedData` 或 `dataResolver`

但这些只能作为运行时补充机制，不能替代权威模型本身。

不要让 `ChartView` 直接承担：

- 页面布局系统
- 业务数据平台逻辑
- schema 改写
- vendor option 生成细节

---

## 8. 测试架构

推荐按六层测试：

## 8.1 schema/validator 测试

- 非法 `ChartComponent`
- 不支持的 `Series`
- `dataType` 不可执行
- `pie` 与笛卡尔轴误配置

## 8.2 语义层测试

- `LineSeries / BarSeries / PieSeries` 各自 fixture
- `Axis` 归一化正确
- `encode` 映射正确

## 8.3 data resolve 测试

- `static` 数据路径
- `datasource / api` unsupported 路径
- `Column` 与数据字段一致性

## 8.4 adapter 测试

- 生成的 option 包含预期结构
- `ChartOption.eChartOption` 合并受控
- tooltip/legend/axis 默认值正确

## 8.5 宿主层测试

- `ChartView` 接收 `ChartComponent` 正常渲染
- loading/empty/error 展示正确
- 组件更新时能正确刷新实例

## 8.6 `bi-playground` 视觉回归测试

- 基于固定组件 fixture 路由截图
- 第一次生成 candidate
- 人工确认后提升 baseline
- 后续执行 tolerant diff

---

## 9. 发布与集成策略

建议从第一阶段开始就建立：

- `pnpm workspace`
- `changesets`
- 单包 build pipeline
- 外部 smoke install check

如果未来真出现拆包压力，再从单包平滑演进到多包，而不是一开始就承担这层复杂度。

---

## 10. 第一阶段完成定义

到这个特性完成时，应该能做到：

- 新项目有独立的 `bi-engine` npm 包
- 包内 schema 与 [模型定义汇总.ts](./模型定义汇总.ts) 一致
- `bi-playground` 中可直接切换 `ChartComponent` fixtures
- 页面不手写 vendor option
- 图表能力可被后续 Dashboard runtime 直接复用
- 白盒和黑盒回归都已经建立
- baseline 审批流已经存在

如果这一步没做到，就不建议继续推进编辑器、模板中心或 AI。
