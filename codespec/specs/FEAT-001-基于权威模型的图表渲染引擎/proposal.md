# FEAT-CHART-001 基于权威模型的图表渲染引擎

## 1. 背景

新项目如果一开始就做完整模板系统、编辑器、导出、调度和 AI，会同时引入太多变量，很难知道真正被验证的核心能力是什么。

这类产品最值得先验证的，其实是图表运行时的完整工程闭环：

`ChartComponent DSL -> 语义归一化 -> 图表适配 -> 实际渲染 -> 自动化回归`

这次还有一个更重要的约束：设计必须严格遵循 [模型定义汇总.ts](./模型定义汇总.ts)，不能再另外定义一套新的图表 DSL。

因此首阶段沉淀的资产是：

- 一个可独立发布的 `bi-engine` npm 包
- 一个可用于调试与验收的 `bi-playground` 项目
- 一套可持续回归的白盒与黑盒测试体系
- 一套与权威模型完全一致的实现边界

只要这个闭环成立，后续很多能力都会顺理成章：

- Dashboard 只是图表引擎的容器
- Report/PPT 只是图表引擎的不同宿主
- 编辑器只是负责生成和修改权威模型里的组件定义
- AI 只是负责生成 `BIEngineComponent / Report / Dashboard / PPT`

## 2. 目标

### 2.1 业务目标

- 在新项目中优先交付一个可复用、可发布的 `bi-engine` npm 包。
- 支持以权威模型里的 `ChartComponent` 驱动图表，而不是由页面直接拼接图表库 option。
- 提供独立 `bi-playground`，让团队和用户都能验证所有已支持图表能力。
- 建立自动化回归能力，降低后续扩展图表类型时的回归风险。

### 2.2 技术目标

- 将 [模型定义汇总.ts](./模型定义汇总.ts) 作为唯一 schema 来源。
- 建立独立于业务页面和宿主文档的图表渲染管线。
- 将图表库耦合隔离在 adapter 层，避免业务直接依赖 ECharts option 细节。
- 在单一 `bi-engine` 包内建立清晰的内部模块边界和导出策略。
- 形成“先截图候选图，再用户确认成基线，后续自动对比”的视觉回归流程。

### 2.3 命名策略

- 包名使用 `bi-engine`，而不是 `chart-engine`。
- 原因是权威模型顶层是 `BIEngineComponent`，长期不仅承载 chart，也承载 `text / table / markdown / compositeTable`。
- 首阶段虽然只强支持图表渲染，但包边界应对齐长期语义，而不是对齐首阶段子集。

## 3. 第一阶段范围

### 3.1 In Scope

- 权威模型中的 `ChartComponent`
- `ChartDataProperty`
- `Series` 的图表首批渲染子集：
  - `LineSeries`
  - `BarSeries`
  - `PieSeries`
- `Axis`
- `ChartOption`
- `Column` 与 `ValueFormat`
- `loading / empty / error`
- React 运行时组件封装
- 单一 npm 包结构
- `bi-playground` 项目
- 白盒自动化测试
- 黑盒视觉回归测试

### 3.2 Out of Scope

- 图表编辑器
- 拖拽布局编辑
- 模板中心与发布
- AI 建议和自动出图
- 第一阶段执行 `Interaction`
- 第一阶段执行 `datasource / api` 拉数
- sankey / heatmap / graph 等不在权威模型中的高复杂图表
- 第一阶段多包发布

## 4. 成功标准

- 给定一份合法 `ChartComponent`，系统可以稳定渲染图表。
- 非法组件定义可以在渲染前被结构化拒绝。
- 图表宿主页面不直接拼接 ECharts option。
- 第一版至少支持：
  - `LineSeries`
  - `BarSeries`
  - `PieSeries`
- 图表引擎可以被 Dashboard 页面和独立 `bi-playground` 同时复用。
- `bi-engine` 包可以被外部 demo 或业务工程直接安装消费，而不是只能从 monorepo 内部直接 import 源码。
- 白盒测试可以覆盖 validator、normalize、data resolve、adapter、formatter 等核心函数。
- 黑盒测试可以基于 `bi-playground` 自动截图、保存候选图、审批基线，并对后续渲染结果做容差比对。

## 5. 推荐实现策略

### 5.1 核心原则

- 先以权威模型为准，再谈渲染实现。
- 先做图表组件子集，再做更多组件类型。
- 先把单包边界和测试边界定下来，再补复杂能力。
- 先把图表库包在 adapter 里，再谈引擎复用。
- 首阶段通过“单包内部分层”解决复杂度，而不是通过“多包拆分”解决复杂度。

### 5.2 渲染管线

推荐采用如下处理链：

1. 校验 `ChartComponent`
2. 归一化 `xAxis / yAxis / series / options`
3. 基于 `ChartDataProperty` 解析数据
4. 生成内部语义模型
5. 由适配器输出 vendor option
6. 在 React Host 中完成实际渲染
7. 在 `bi-playground` 中完成人工试验与自动截图回归

### 5.3 推荐图表库

首选 ECharts，原因：

- 覆盖图表类型广
- 与参考项目能力方向一致
- 适合后续 Report/PPT 内嵌图表

但必须通过 adapter 隔离，避免未来迁移成本。

### 5.4 权威模型下的首阶段子集策略

- 权威模型中的所有接口名、字段名、枚举名都保留。
- 首阶段运行时强支持：
  - `ChartComponent`
  - `dataProperties.dataType = 'static'`
  - `LineSeries / BarSeries / PieSeries`
- 首阶段识别但不执行：
  - `dataType = 'datasource' | 'api'`
  - `ScatterSeries / RadarSeries / GaugeSeries / CandlestickSeries`
  - `interactions`
  - 其他组件类型如 `TextComponent / TableComponent / MarkdownComponent / CompositeTable`

对于这些“模型已定义但首阶段未执行”的能力，需要返回结构化 unsupported 状态，而不是偷偷改模型。

## 6. 风险

### 6.1 再发明一套平行 DSL

如果实现层继续使用自定义 `ChartSpec`，后续一定会和权威模型分叉。

### 6.2 过早支持太多运行态能力

如果第一版同时做 `datasource / api / interaction / 多组件宿主`，测试矩阵会迅速失控。

### 6.3 首阶段就拆太多 npm 包

如果在能力还没稳定时拆成多个 publishable package，会把构建、发布、依赖关系和调试成本都提前放大。

### 6.4 包名仍然只按 chart 命名

如果包名继续叫 `chart-engine`，会在表格、文本、Markdown 等组件进入时制造语义偏差和迁移成本。

### 6.5 视觉回归不做审批流

如果第一次截图直接成为标准图，很容易把错误渲染固化成基线，后续越测越错。

## 7. 阶段建议

### Phase P1：权威模型下的图表最小闭环

- 接入权威模型定义
- 支持 `ChartComponent`
- 跑通 `LineSeries / BarSeries / PieSeries`

### Phase P2：单包发布与试玩闭环

- 建立 `bi-engine` 包构建与发布
- 建立 `bi-playground`
- 让 fixture、文档和试玩入口共用同一套组件定义

### Phase P3：自动化可信闭环

- 补齐白盒测试
- 建立 candidate screenshot 与 baseline 审批流
- 在 CI 中执行视觉回归

### Phase P4：扩展性建设

- 引入 `ScatterSeries / RadarSeries / GaugeSeries / CandlestickSeries`
- 引入 `datasource / api` 解析器
- 引入 `Interaction` 执行
- 仅在出现真实压力后再拆分包边界

## 8. 完成定义

这个 feature 完成时，应达到：

- 新项目已经拥有一个可发布的 `bi-engine` npm 包
- 包内 schema 与 [模型定义汇总.ts](./模型定义汇总.ts) 保持一致
- `bi-playground` 可覆盖所有当前支持的图表 fixture
- 白盒和黑盒自动化测试都已经落地
- 黑盒测试具备 `candidate -> baseline approval -> regression compare` 的流程
- 这套图表引擎不依赖模板中心和编辑器即可工作
- 后续 Dashboard 运行态可以直接建立在此之上
