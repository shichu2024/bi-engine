# 图表引擎测试策略

## 1. 目标

测试体系分两层：

- 白盒测试：验证函数、模型和适配逻辑是否正确
- 黑盒测试：验证最终渲染出来的图是否符合预期

两层都需要做，因为很多图表问题只靠其中一层看不出来。

这一轮还有一个附加要求：

- 所有测试输入都必须基于 [模型定义汇总.ts](./模型定义汇总.ts)
- 不再使用自定义 `ChartSpec + rows` 夹具
- 测试资产围绕 `bi-engine` 和 `bi-playground` 组织

## 2. 白盒测试

### 2.1 范围

建议白盒覆盖 `bi-engine` 包内以下模块：

- `src/schema`
  - 权威模型导出一致性
- `src/validator`
  - `validateChartComponent`
- `src/model`
  - `normalizeChartComponent`
  - `buildSemanticModel`
- `src/data`
  - `resolveChartData`
  - `buildSeriesData`
- `src/adapters`
  - `buildEChartsOption`
- `src/formatters`
  - `ValueFormat`
- `src/theme`
- `src/react`
  - 少量宿主组件 smoke

### 2.2 工具

- `Vitest`
- `@testing-library/react` 用于宿主组件 smoke

### 2.3 夹具复用

白盒测试不要自己另写一套输入数据，应该直接复用 `bi-engine` 包内的 `ChartComponent` fixture registry 或 `@your-scope/bi-engine/testing` 子路径导出。这样 `bi-playground`、白盒、黑盒三者看到的是同一份组件定义。

## 3. 黑盒测试

### 3.1 基本思路

黑盒测试基于 `bi-playground` 完成，而不是直接对某个底层函数截图。

推荐链路：

1. `ChartComponent` fixture 被注册在 `bi-engine/testing`
2. `bi-playground` 为每个 fixture 提供稳定路由
3. Playwright 打开该路由
4. 等待图表渲染稳定
5. 截图并与 baseline 对比

### 3.2 为什么必须依赖 playground

因为用户真正关心的是“最终页面里看见的图”，而不是函数返回值。把视觉回归建在 playground 上，后续也更容易做人工验收、产品评审和设计 review。

## 4. baseline 审批流程

### 4.1 首次采集

第一次运行时，只做 candidate capture：

- 保存截图到 `apps/bi-playground/tests/visual/candidates/`
- 记录 fixture id、主题、viewport、renderer、时间戳
- 不自动提升为 baseline

### 4.2 人工确认

由用户或团队确认 candidate 是否符合预期：

- 合格：提升为 baseline
- 不合格：修代码后重新 capture

### 4.3 后续回归

当 baseline 已存在时：

- 重新截图
- 与 baseline 做像素对比
- 生成 diff artifact
- 根据容差阈值决定 pass/fail

## 5. 容差策略

不要求 100% 一致，但必须可控。

推荐默认策略：

- 固定浏览器：Chromium
- 固定 viewport 与 device scale factor
- 固定字体
- 关闭动画
- 测试环境优先使用 `svg` renderer，降低 canvas 抖动
- 比对阈值支持：
  - `threshold`
  - `maxDiffPixels`
  - `maxDiffPixelRatio`

建议默认值：

- `threshold`: `0.2`
- `maxDiffPixelRatio`: `0.005`

同时允许个别 fixture 覆盖默认阈值。

## 6. 首阶段必须覆盖的测试场景

### 6.1 schema/validator

- `component.type !== 'chart'`
- `series` 缺失
- `pie` 与 `xAxis / yAxis` 误配置
- `datasource / api` 进入 unsupported
- `ScatterSeries / RadarSeries / GaugeSeries / CandlestickSeries` 进入 unsupported

### 6.2 运行时正常路径

- `LineSeries`
- `BarSeries`
- `PieSeries`

### 6.3 格式化路径

- `Column.uiConfig.valueFormat`
- `ValueFormatType.time`
- `ValueFormatType.number`
- `ValueFormatType.percentage`

## 7. 推荐目录

```text
apps/
  bi-playground/
    tests/
      visual/
        baselines/
        candidates/
        diff-artifacts/
packages/
  bi-engine/
    src/testing/
    tests/
tooling/
  visual-regression/
    capture-candidates.ts
    approve-baselines.ts
```

## 8. 通过标准

测试体系达标时，应满足：

- `pnpm test:unit` 可运行白盒测试
- `pnpm test:visual:capture` 可生成候选图
- `pnpm test:visual:approve` 可把候选图提升为基线
- `pnpm test:visual` 可执行回归对比
- 失败时能定位到具体 `ChartComponent` fixture 和 diff 产物
