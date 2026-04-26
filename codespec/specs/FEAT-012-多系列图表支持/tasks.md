# FEAT-012 Tasks

## T-001: 扩展 BarSeries schema 支持 stack

**story**: ST-001
**depends_on**: []
**write_paths**:
  - `packages/bi-engine/src/schema/bi-engine-models.ts`
**read_scope**:
  - `packages/bi-engine/src/schema/`
**validation**: `pnpm build:engine` 无错误
**done_when**: `BarSeries` 包含可选 `stack?: string` 字段，且构建通过

## T-002: buildBarOption 支持 stack 属性透传

**story**: ST-001
**depends_on**: [T-001]
**write_paths**:
  - `packages/bi-engine/src/adapters/echarts/build-line-option.ts`
**read_scope**:
  - `packages/bi-engine/src/adapters/echarts/`
  - `packages/bi-engine/src/schema/`
**validation**: `pnpm test` 通过
**done_when**: `buildBarOption` 输出的 bar series 包含 `stack` 字段（当源 series 有 stack 配置时）

## T-003: 支持混合图表（combo）

**story**: ST-003
**depends_on**: [T-001]
**write_paths**:
  - `packages/bi-engine/src/adapters/echarts/build-line-option.ts`
  - `packages/bi-engine/src/adapters/echarts/index.ts`
  - `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`
**read_scope**:
  - `packages/bi-engine/src/`
**validation**: `pnpm test` 通过
**done_when**:
  - `seriesKind` 新增 `'combo'` 类型
  - `deriveSeriesKind` 检测混合类型时返回 `'combo'`
  - `buildEChartsOption` 路由 combo 到 `buildComboOption`
  - `buildComboOption` 同时处理 bar 和 line 系列

## T-004: 新增多系列 fixtures

**story**: ST-001, ST-002, ST-003, ST-004
**depends_on**: [T-002, T-003]
**write_paths**:
  - `packages/bi-engine/src/testing/fixtures/bar-stacked.ts`
  - `packages/bi-engine/src/testing/fixtures/line-multi-trend.ts`
  - `packages/bi-engine/src/testing/fixtures/combo-bar-line.ts`
  - `packages/bi-engine/src/testing/fixtures/line-area-multi.ts`
  - `packages/bi-engine/src/testing/fixture-registry.ts`
  - `packages/bi-engine/src/testing/index.ts`
**read_scope**:
  - `packages/bi-engine/src/testing/`
  - `packages/bi-engine/src/schema/`
**validation**: `pnpm build:engine && pnpm test` 通过
**done_when**: 4 个新 fixture 文件创建，注册到 registry，导出到 testing barrel

## T-005: 补充多系列测试

**story**: ST-001, ST-002, ST-003, ST-004
**depends_on**: [T-004]
**write_paths**:
  - `packages/bi-engine/src/adapters/echarts/__tests__/echarts-integration.test.ts`
  - `packages/bi-engine/src/pipeline/__tests__/`
**read_scope**:
  - `packages/bi-engine/src/`
**validation**: `pnpm test` 通过，覆盖率 >= 80%
**done_when**:
  - 堆叠柱图 option 验证（stack 字段存在）
  - 多折线 option 验证（3+ series）
  - combo option 验证（混合 bar+line）
  - 多面积图 option 验证（areaStyle 存在）

## T-006: Playground 验证与 VRT 更新

**story**: ST-001, ST-002, ST-003, ST-004
**depends_on**: [T-004]
**write_paths**:
  - `apps/bi-playground/` （仅确认现有页面自动继承）
**read_scope**:
  - `apps/bi-playground/src/`
**validation**: `pnpm dev:playground` 启动后可查看新 fixtures
**done_when**:
  - Playground 的 line 类目下显示 line-multi-trend、line-area-multi
  - Playground 的 bar 类目下显示 bar-stacked、combo-bar-line
  - 截图验证各 fixture 渲染正确
