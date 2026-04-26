# FEAT-013 Tasks

## T-001: 实现 chartGroupProcess 纯函数

**story**: ST-001
**depends_on**: []
**write_paths**:
  - `packages/bi-engine/src/component-handlers/chart/chart-group-process.ts`
**read_scope**:
  - `packages/bi-engine/src/schema/`
  - `packages/bi-engine/src/component-handlers/chart/`
**validation**: 文件导出 `chartGroupProcess`，TypeScript 编译通过
**done_when**:
  - 函数实现完整（多/单/None/undefined 四种场景）
  - 导出类型签名正确

## T-002: chartGroupProcess 单元测试

**story**: ST-004
**depends_on**: [T-001]
**write_paths**:
  - `packages/bi-engine/src/component-handlers/chart/__tests__/chart-group-process.test.ts`
**read_scope**:
  - `packages/bi-engine/src/component-handlers/chart/`
**validation**: `pnpm test` 通过
**done_when**:
  - 5+ 测试用例覆盖（多分组、单分组、None、undefined、空数据）
  - 所有测试通过

## T-003: Pipeline 集成到 chartModelBuilder

**story**: ST-002
**depends_on**: [T-001]
**write_paths**:
  - `packages/bi-engine/src/component-handlers/chart/chart-handler.tsx`
  - `packages/bi-engine/src/component-handlers/chart/chart-normalizer.ts`（如需传递 axisGroup）
  - `packages/bi-engine/src/component-handlers/chart/chart-semantic-model.ts`（如需调整）
**read_scope**:
  - `packages/bi-engine/src/component-handlers/chart/`
  - `packages/bi-engine/src/platform/`
**validation**: `pnpm test` 全部通过（含已有测试，无回归）
**done_when**:
  - modelBuilder 中正确调用 chartGroupProcess
  - axisGroup 有值时使用转换后的 data + series
  - axisGroup 无值时走原有逻辑

## T-004: 新增 axisGroup fixtures

**story**: ST-003
**depends_on**: [T-003]
**write_paths**:
  - `packages/bi-engine/src/testing/fixtures/line-axis-group.ts`
  - `packages/bi-engine/src/testing/fixtures/bar-axis-group.ts`
  - `packages/bi-engine/src/testing/fixture-registry.ts`
**read_scope**:
  - `packages/bi-engine/src/testing/`
  - `packages/bi-engine/src/schema/`
**validation**: `pnpm build && pnpm test` 通过
**done_when**:
  - 2 个新 fixture 文件
  - 注册到 registry
  - 构建和测试通过

## T-005: 集成测试 + Playground 验证

**story**: ST-003, ST-004
**depends_on**: [T-004]
**write_paths**:
  - `packages/bi-engine/src/adapters/echarts/__tests__/echarts-integration.test.ts`
**read_scope**:
  - `packages/bi-engine/src/`
  - `apps/bi-playground/src/`
**validation**: `pnpm test` 通过，playground 构建通过
**done_when**:
  - axisGroup fixture 的 ECharts option 验证测试通过
  - Playground 构建成功
