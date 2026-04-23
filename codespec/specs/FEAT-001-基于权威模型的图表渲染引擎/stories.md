# FEAT-CHART-001 Stories

## ST-001 固化权威模型定义与首阶段图表子集契约

- Title: 作为系统，我需要以权威模型文件为唯一 schema 来源，以便后续实现不会出现协议分叉。
- Priority: P0
- User Value:
  - 后续编辑器、运行时、AI、Dashboard/Report/PPT 都能共享同一份模型。
- Scope:
  - `BIEngineComponent`
  - `ChartComponent`
  - `ChartDataProperty`
  - `Series`
  - `Axis`
  - `ChartOption`
  - `Column`
- Acceptance Criteria:
  - 规划和实现不再引入平行的 `ChartSpec` / `FieldBinding` 抽象。
  - 权威模型中的接口名、枚举名、字段名保持不变。
  - 首阶段明确声明强支持子集与“已定义但暂不执行”的能力边界。
- Dependencies:
  - None

## ST-002 建立 `ChartComponent` 到内部语义模型的转换链路

- Title: 作为图表引擎，我需要将权威模型中的 `ChartComponent` 转成内部语义模型，以便后续适配器和宿主层保持稳定。
- Priority: P0
- User Value:
  - 业务 DSL 与具体图表库解耦。
- Scope:
  - component validation
  - axis normalize
  - series normalize
  - data resolve
  - semantic model
- Acceptance Criteria:
  - 相同 `ChartComponent` 在不同宿主中得到一致的语义结果。
  - `LineSeries / BarSeries / PieSeries` 至少各有一组组件 fixture 可通过转换。
  - `datasource / api`、未支持 `Series` 类型能给出清晰错误信息。
- Dependencies:
  - ST-001

## ST-003 建立 ECharts 适配器与 React 宿主

- Title: 作为运行时，我需要把内部语义模型适配为可渲染图表，以便 `ChartComponent` 能真正显示在页面上。
- Priority: P0
- User Value:
  - 尽快拿到可见运行结果。
- Scope:
  - echarts option adapter
  - react chart host
  - resize/update lifecycle
- Acceptance Criteria:
  - `LineSeries / BarSeries / PieSeries` 可以在页面上渲染。
  - 页面层不直接拼装 ECharts option。
  - 图表组件以 `ChartComponent` 为核心输入，而不是自定义 spec。
- Dependencies:
  - ST-002

## ST-004 建立图表运行态基础体验与格式化能力

- Title: 作为用户，我需要图表具备基础可读性和异常态处理，以便它不仅能渲染，还能稳定使用。
- Priority: P1
- User Value:
  - 避免图表只在“理想输入”下可用。
- Scope:
  - loading / empty / error
  - `ChartOption`
  - `Column.uiConfig.valueFormat`
  - theme/palette baseline
- Acceptance Criteria:
  - 没有数据时显示 empty，而不是崩溃或空白。
  - 错误输入时显示结构化错误态。
  - `ValueFormat` 在图表 tooltip/label/axis 中可被基础使用。
  - 图表能通过主题上下文切换基础视觉风格。
- Dependencies:
  - ST-003

## ST-005 建立单一 `bi-engine` npm 包边界

- Title: 作为集成方，我需要把 BI 组件引擎按单一 npm 包安装使用，以便首阶段能低成本发布、联调和消费。
- Priority: P0
- User Value:
  - 用一个包就能拿到权威模型导出、图表渲染和后续表格/文本组件宿主能力。
- Scope:
  - monorepo workspace
  - single publishable package
  - package exports
  - internal module boundaries
- Acceptance Criteria:
  - 首阶段只发布一个 `bi-engine` 包。
  - 包消费者无需引用源码路径即可使用公开 API。
  - 根导出与可选子路径导出都围绕权威模型组织。
  - 文档中明确为什么包名使用 `bi-engine` 而不是 `chart-engine`。
- Dependencies:
  - ST-001
  - ST-003

## ST-006 建立 `bi-playground` 项目与共享 fixtures

- Title: 作为团队，我需要可回归的 fixtures 和可视化 playground，以便图表引擎可以稳定迭代。
- Priority: P1
- User Value:
  - 降低后续支持更多图表类型时的回归风险。
- Scope:
  - fixture registry
  - playground app
  - component json preview
  - chart preview
  - theme and viewport switch
- Acceptance Criteria:
  - 每种已支持图表类型至少有一组 `ChartComponent` fixture。
  - `bi-playground` 可切换所有 fixture，并展示 `component + render result`。
  - `bi-playground` 与自动化测试使用同一套组件 fixture 数据源。
- Dependencies:
  - ST-005
  - ST-003
  - ST-004

## ST-007 建立白盒自动化测试体系

- Title: 作为开发团队，我需要用白盒测试锁住核心函数行为，以便权威模型上的渲染管线能安全演进。
- Priority: P1
- User Value:
  - 提前发现破坏 validator、normalize、data resolve、adapter 的变更。
- Scope:
  - validator tests
  - semantic model tests
  - data resolve tests
  - adapter tests
  - formatter/theme tests
- Acceptance Criteria:
  - `ChartComponent` 相关核心函数都有自动化测试。
  - 每个已支持 `Series` 类型至少覆盖一条正常路径和一条错误路径。
  - 测试入口可在本地和 CI 中稳定执行。
- Dependencies:
  - ST-001
  - ST-002
  - ST-003
  - ST-004

## ST-008 建立黑盒视觉回归测试体系

- Title: 作为团队，我需要基于 playground 的视觉回归测试，以便从最终渲染结果层面验证图表没有意外退化。
- Priority: P1
- User Value:
  - 能发现“函数测试都过了，但最终图还是变了”的问题。
- Scope:
  - playwright visual tests
  - screenshot candidates
  - baseline approval flow
  - tolerant diff strategy
- Acceptance Criteria:
  - 第一次运行可以批量产出 screenshot candidate。
  - candidate 不会自动变成 baseline，必须经过人工确认。
  - 后续回归会与 baseline 对比，并允许预设误差阈值。
  - 测试报告能指出失败的 fixture 和 diff 产物。
- Dependencies:
  - ST-006
  - ST-007
