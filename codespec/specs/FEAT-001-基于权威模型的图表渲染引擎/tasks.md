# FEAT-CHART-001 Tasks

说明：

- 下列路径是“新项目推荐路径”，不是当前仓库路径。
- 这组任务优先服务于图表运行时，不强绑定模板系统或编辑器。
- 首阶段按“权威模型对齐 + 单包 `bi-engine` + 一个 `bi-playground` + 一套测试工具脚本”推进。

## 推荐最小仓库结构

```text
apps/
  bi-playground/
packages/
  bi-engine/
tooling/
  visual-regression/
```

---

## T-001 接入权威模型定义并建立 schema 导出

- Story: ST-001
- Goal: 让实现层直接建立在权威模型上，而不是自定义新 DSL。
- Depends On: None
- Read Paths:
  - `packages/bi-engine/**`
  - `plan/priority-01-dsl-chart-engine/模型定义汇总.ts`
- Write Paths:
  - `packages/bi-engine/src/schema/bi-engine-models.ts`
  - `packages/bi-engine/src/schema/index.ts`
- Deliverables:
  - 权威模型镜像文件
  - schema barrel exports
- Verify:
  - `type: command`
  - `check: types compile + schema export smoke tests`

## T-002 建立 `ChartComponent` 校验器与首阶段支持矩阵

- Story: ST-001
- Goal: 让非法组件定义和首阶段不支持能力在渲染前被识别。
- Depends On:
  - T-001
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/validator/validate-chart-component.ts`
  - `packages/bi-engine/tests/validator/**`
- Deliverables:
  - `validateChartComponent`
  - 支持矩阵规则
  - unsupported 错误结构
- Verify:
  - `type: command`
  - `check: validator tests`

## T-003 建立 `ChartComponent` 归一化层

- Story: ST-002
- Goal: 把权威模型组件转成稳定的内部运行时输入。
- Depends On:
  - T-002
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/model/normalize-chart-component.ts`
  - `packages/bi-engine/src/model/chart-semantic-model.ts`
- Deliverables:
  - `NormalizedChartComponent`
  - semantic model definition
- Verify:
  - `type: command`
  - `check: normalize and semantic model tests`

## T-004 建立 `ChartDataProperty` 数据解析层

- Story: ST-002
- Goal: 根据 `dataType` 和 `series.encode` 解析图表数据。
- Depends On:
  - T-003
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/data/resolve-chart-data.ts`
  - `packages/bi-engine/src/data/build-series-data.ts`
  - `packages/bi-engine/tests/data/**`
- Deliverables:
  - `static` 数据路径
  - `datasource / api` unsupported 路径
  - line/bar/pie series-ready dataset
- Verify:
  - `type: command`
  - `check: data resolve tests`

## T-005 建立 ECharts adapter v1

- Story: ST-003
- Goal: 将语义模型映射到 vendor option。
- Depends On:
  - T-004
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/adapters/echarts/build-line-option.ts`
  - `packages/bi-engine/src/adapters/echarts/build-bar-option.ts`
  - `packages/bi-engine/src/adapters/echarts/build-pie-option.ts`
  - `packages/bi-engine/src/adapters/echarts/merge-chart-option.ts`
  - `packages/bi-engine/src/adapters/echarts/index.ts`
- Deliverables:
  - line/bar/pie option builders
  - `ChartOption` merge strategy
  - unified adapter entry
- Verify:
  - `type: command`
  - `check: adapter tests`

## T-006 建立 React `ChartView` 宿主组件

- Story: ST-003
- Goal: 提供以 `ChartComponent` 为输入的图表渲染组件。
- Depends On:
  - T-005
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/react/ChartView.tsx`
  - `packages/bi-engine/src/react/use-chart-instance.ts`
- Deliverables:
  - `ChartView`
  - resize/update lifecycle
  - `component` props contract
- Verify:
  - `type: command`
  - `check: component render smoke tests`

## T-007 建立 loading/empty/error 三态

- Story: ST-004
- Goal: 让引擎具备最基本的可用性。
- Depends On:
  - T-006
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/react/ChartStateView.tsx`
  - `packages/bi-engine/src/errors/**`
- Deliverables:
  - empty state
  - structured render errors
  - loading placeholder
- Verify:
  - `type: command`
  - `check: runtime state tests`

## T-008 建立格式化与主题能力

- Story: ST-004
- Goal: 提升图表可读性和宿主复用性。
- Depends On:
  - T-006
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/theme/**`
  - `packages/bi-engine/src/formatters/**`
  - `packages/bi-engine/src/react/chart-theme-context.tsx`
- Deliverables:
  - palette
  - theme tokens
  - `ValueFormat` formatter
- Verify:
  - `type: command`
  - `check: theme and formatter tests`

## T-009 建立单一 publishable `bi-engine` 包与导出策略

- Story: ST-005
- Goal: 让图表能力通过一个包独立发布和被外部仓库安装消费。
- Depends On:
  - T-001
  - T-005
  - T-006
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/package.json`
  - `packages/bi-engine/tsup.config.ts`
  - `pnpm-workspace.yaml`
  - `package.json`
  - `.changeset/**`
- Deliverables:
  - 单包 exports
  - ESM/CJS/types build outputs
  - versioning and release workflow baseline
  - 可选 `./testing` 子路径导出
- Verify:
  - `type: command`
  - `check: workspace build + package smoke install`

## T-010 建立 `ChartComponent` fixtures 与 `bi-playground` 项目

- Story: ST-006
- Goal: 让团队能快速试验组件定义、主题和图表效果，并把它作为黑盒测试宿主。
- Depends On:
  - T-006
  - T-008
  - T-009
- Read Paths:
  - `apps/bi-playground/**`
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/testing/fixtures/**`
  - `packages/bi-engine/src/testing/fixture-registry.ts`
  - `apps/bi-playground/src/routes/**`
  - `apps/bi-playground/src/components/**`
- Deliverables:
  - fixture selector
  - component json preview
  - chart preview
  - theme and viewport switch
  - deterministic fixture routes
- Verify:
  - `type: command`
  - `check: playground smoke + route tests`

## T-011 建立白盒自动化测试套件

- Story: ST-007
- Goal: 以函数级自动化测试锁住引擎核心行为。
- Depends On:
  - T-002
  - T-003
  - T-004
  - T-005
  - T-008
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/tests/**`
  - `packages/bi-engine/src/testing/test-helpers/**`
  - `vitest.config.ts`
- Deliverables:
  - validator tests
  - normalize tests
  - data resolve tests
  - adapter tests
  - formatter/theme tests
- Verify:
  - `type: command`
  - `check: vitest full suite`

## T-012 建立 screenshot candidate 采集与 baseline 审批流

- Story: ST-008
- Goal: 让视觉回归不是一次性脚本，而是可治理的审批流程。
- Depends On:
  - T-010
  - T-011
- Read Paths:
  - `apps/bi-playground/**`
  - `packages/bi-engine/**`
  - `tooling/visual-regression/**`
- Write Paths:
  - `tooling/visual-regression/capture-candidates.ts`
  - `tooling/visual-regression/approve-baselines.ts`
  - `apps/bi-playground/tests/visual/baselines/**`
  - `apps/bi-playground/tests/visual/candidates/**`
  - `apps/bi-playground/tests/visual/baseline-manifest.json`
- Deliverables:
  - candidate capture script
  - baseline approval script
  - baseline manifest
- Verify:
  - `type: command`
  - `check: candidate capture + manual approval dry run`

## T-013 建立 Playwright 黑盒视觉回归测试

- Story: ST-008
- Goal: 从最终渲染结果层面验证图表输出没有退化。
- Depends On:
  - T-010
  - T-012
- Read Paths:
  - `apps/bi-playground/**`
  - `packages/bi-engine/**`
  - `tooling/visual-regression/**`
- Write Paths:
  - `apps/bi-playground/playwright.config.ts`
  - `apps/bi-playground/tests/visual/specs/**`
  - `apps/bi-playground/tests/visual/diff-artifacts/**`
- Deliverables:
  - visual regression tests
  - diff report output
  - configurable tolerance threshold
- Verify:
  - `type: command`
  - `check: playwright visual regression suite`

## T-014 锁定视觉测试稳定性策略

- Story: ST-008
- Goal: 减少字体、动画、DPR 和 renderer 差异引入的噪声。
- Depends On:
  - T-013
- Read Paths:
  - `apps/bi-playground/**`
  - `packages/bi-engine/**`
  - `tooling/visual-regression/**`
- Write Paths:
  - `apps/bi-playground/src/test-mode/**`
  - `packages/bi-engine/src/react/test-render-config.ts`
  - `docs/testing/visual-regression.md`
- Deliverables:
  - animation disable switch
  - deterministic viewport and font policy
  - preferred renderer setting for visual tests
- Verify:
  - `type: manual`
  - `check: architecture and CI stability review`

## T-015 规划后续扩展点但不提前改模型

- Story: ST-004
- Goal: 为权威模型中已存在但首阶段未执行的能力留下稳定接口。
- Depends On:
  - T-005
  - T-008
- Read Paths:
  - `packages/bi-engine/**`
- Write Paths:
  - `packages/bi-engine/src/contracts/**`
  - `packages/bi-engine/src/roadmap/**`
- Deliverables:
  - datasource/api resolver contract
  - unsupported series capability map
  - interaction extension roadmap
- Verify:
  - `type: manual`
  - `check: architecture review`
