// ============================================================================
// bi-engine/testing -- 测试工具和夹具的子路径导出
// ============================================================================
//
// 此子路径导出提供测试辅助函数、夹具和工具，
// 适用于针对 bi-engine 组件编写测试的消费者。
//
// 导入方式：import { ... } from 'bi-engine/testing'
//
// ============================================================================

// 重新导出校验器类型和函数，方便测试访问。
export {
  validateChartComponent,
  ValidationErrorKind,
} from '../core/validate-chart-component';

export type {
  ValidationError,
  ValidationResult,
} from '../core/validate-chart-component';

// 重新导出错误工具，用于测试断言。
export {
  ChartRenderError,
  ChartRenderErrorCategory,
  createValidationError,
  createDataError,
  createRenderError,
} from '../core/chart-render-error';

// 重新导出主题默认值，用于测试设置。
export {
  DEFAULT_PALETTE,
  DEFAULT_THEME_TOKENS,
} from '../theme/index';

// 夹具注册表和查询工具。
export {
  FIXTURE_REGISTRY,
  getFixtureById,
  getFixturesByKind,
  TABLE_FIXTURE_REGISTRY,
  UNIFIED_FIXTURE_REGISTRY,
  getUnifiedFixturesByKind,
  getUnifiedFixtureById,
} from './fixture-registry';
export type { FixtureEntry, TableFixtureEntry, UnifiedFixtureEntry, ComponentKind } from './fixture-registry';
