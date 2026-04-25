import type {
  ChartComponent,
  ChartDataProperty,
  Series,
  LineSeries,
  BarSeries,
  PieSeries,
  Axis,
} from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 错误类型
// ---------------------------------------------------------------------------

/** 校验错误类别分类 */
export enum ValidationErrorKind {
  /** 组件定义存在结构或语义问题 */
  INVALID = 'invalid',
  /** 该功能已在模型中定义但第一阶段尚不支持 */
  UNSUPPORTED = 'unsupported',
}

/** 单条校验结果 */
export interface ValidationError {
  /** 机器可读的错误码，用于程序化处理 */
  code: string;
  /** 人类可读的错误描述 */
  message: string;
  /** 分类：结构无效 或 第一阶段不支持 */
  kind: ValidationErrorKind;
  /** 可选的 JSON 路径，指向出问题位置 */
  path?: string;
}

/** `validateChartComponent` 返回的整体校验结果 */
export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}

// ---------------------------------------------------------------------------
// 第一阶段支持矩阵常量
// ---------------------------------------------------------------------------

const PHASE1_SUPPORTED_SERIES_TYPES: ReadonlySet<string> = new Set([
  'line',
  'bar',
  'pie',
  'scatter',
  'radar',
  'candlestick',
  'gauge',
]);

const CARTESIAN_SERIES_TYPES: ReadonlySet<string> = new Set([
  'line',
  'bar',
  'scatter',
  'candlestick',
]);

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAxisArrayOrSingle(value: unknown): value is Axis | Axis[] {
  if (value === undefined) {
    return true;
  }
  if (isObject(value) && typeof (value as Record<string, unknown>).type === 'string') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(
      (item) => isObject(item) && typeof (item as Record<string, unknown>).type === 'string',
    );
  }
  return false;
}

function getSeriesType(series: Record<string, unknown>): string | undefined {
  if (typeof series.type === 'string') {
    return series.type;
  }
  return undefined;
}

function hasEncodeField(
  encode: unknown,
  field: string,
): boolean {
  return isObject(encode) && typeof (encode as Record<string, unknown>)[field] === 'string';
}

// ---------------------------------------------------------------------------
// 校验规则实现
// ---------------------------------------------------------------------------

function checkComponentType(
  input: unknown,
  errors: ValidationError[],
): input is Record<string, unknown> {
  if (!isObject(input)) {
    errors.push({
      code: 'INVALID_INPUT_TYPE',
      message: 'Input must be a non-null object.',
      kind: ValidationErrorKind.INVALID,
    });
    return false;
  }

  if ((input as Record<string, unknown>).type !== 'chart') {
    errors.push({
      code: 'INVALID_COMPONENT_TYPE',
      message: `Expected component.type === 'chart', received '${String((input as Record<string, unknown>).type)}'.`,
      kind: ValidationErrorKind.INVALID,
      path: '/type',
    });
    return false;
  }

  return true;
}

function checkDataProperties(
  component: Record<string, unknown>,
  errors: ValidationError[],
): component is Record<string, unknown> & { dataProperties: ChartDataProperty } {
  const dp = component.dataProperties;
  if (dp === undefined || dp === null) {
    errors.push({
      code: 'MISSING_DATA_PROPERTIES',
      message: 'ChartComponent must have dataProperties.',
      kind: ValidationErrorKind.INVALID,
      path: '/dataProperties',
    });
    return false;
  }

  if (!isObject(dp)) {
    errors.push({
      code: 'INVALID_DATA_PROPERTIES',
      message: 'dataProperties must be an object.',
      kind: ValidationErrorKind.INVALID,
      path: '/dataProperties',
    });
    return false;
  }

  return true;
}

function checkSeries(
  dataProperties: Record<string, unknown>,
  errors: ValidationError[],
): Record<string, unknown>[] | null {
  const series = dataProperties.series;

  if (series === undefined || series === null) {
    errors.push({
      code: 'MISSING_SERIES',
      message: 'dataProperties.series is required.',
      kind: ValidationErrorKind.INVALID,
      path: '/dataProperties/series',
    });
    return null;
  }

  if (!Array.isArray(series) || series.length === 0) {
    errors.push({
      code: 'INVALID_SERIES',
      message: 'dataProperties.series must be a non-empty array.',
      kind: ValidationErrorKind.INVALID,
      path: '/dataProperties/series',
    });
    return null;
  }

  const validSeries: Record<string, unknown>[] = [];

  for (let i = 0; i < series.length; i++) {
    const item = series[i] as Record<string, unknown>;
    const seriesType = getSeriesType(item);

    if (seriesType === undefined) {
      errors.push({
        code: 'MISSING_SERIES_TYPE',
        message: `Series at index ${i} is missing a 'type' field.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${i}/type`,
      });
      continue;
    }

    if (!PHASE1_SUPPORTED_SERIES_TYPES.has(seriesType)) {
      errors.push({
        code: 'UNSUPPORTED_SERIES_TYPE',
        message: `Series type '${seriesType}' is not supported in phase 1. Supported types: line, bar, pie, scatter, radar, candlestick, gauge.`,
        kind: ValidationErrorKind.UNSUPPORTED,
        path: `/dataProperties/series/${i}/type`,
      });
      continue;
    }

    validSeries.push(item);
  }

  return validSeries;
}

function checkSeriesEncode(
  series: Record<string, unknown>,
  index: number,
  errors: ValidationError[],
): void {
  const seriesType = getSeriesType(series);
  const encode = series.encode;

  if (!isObject(encode)) {
    errors.push({
      code: 'MISSING_SERIES_ENCODE',
      message: `Series at index ${index} is missing 'encode' object.`,
      kind: ValidationErrorKind.INVALID,
      path: `/dataProperties/series/${index}/encode`,
    });
    return;
  }

  if (seriesType === 'pie') {
    if (!hasEncodeField(encode, 'name')) {
      errors.push({
        code: 'MISSING_PIE_ENCODE_NAME',
        message: `Pie series at index ${index} must have encode.name.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/name`,
      });
    }
    if (!hasEncodeField(encode, 'value')) {
      errors.push({
        code: 'MISSING_PIE_ENCODE_VALUE',
        message: `Pie series at index ${index} must have encode.value.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/value`,
      });
    }
  } else if (seriesType === 'line' || seriesType === 'bar') {
    if (!hasEncodeField(encode, 'x')) {
      errors.push({
        code: 'MISSING_CARTESIAN_ENCODE_X',
        message: `${seriesType} series at index ${index} must have encode.x.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/x`,
      });
    }
    if (!hasEncodeField(encode, 'y')) {
      errors.push({
        code: 'MISSING_CARTESIAN_ENCODE_Y',
        message: `${seriesType} series at index ${index} must have encode.y.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/y`,
      });
    }
  } else if (seriesType === 'scatter') {
    if (!hasEncodeField(encode, 'x')) {
      errors.push({
        code: 'MISSING_SCATTER_ENCODE_X',
        message: `Scatter series at index ${index} must have encode.x.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/x`,
      });
    }
    if (!hasEncodeField(encode, 'y')) {
      errors.push({
        code: 'MISSING_SCATTER_ENCODE_Y',
        message: `Scatter series at index ${index} must have encode.y.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/y`,
      });
    }
  } else if (seriesType === 'radar') {
    if (!hasEncodeField(encode, 'name')) {
      errors.push({
        code: 'MISSING_RADAR_ENCODE_NAME',
        message: `Radar series at index ${index} must have encode.name.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/name`,
      });
    }
    if (!hasEncodeField(encode, 'value')) {
      errors.push({
        code: 'MISSING_RADAR_ENCODE_VALUE',
        message: `Radar series at index ${index} must have encode.value.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/value`,
      });
    }
  } else if (seriesType === 'candlestick') {
    if (!hasEncodeField(encode, 'open')) {
      errors.push({
        code: 'MISSING_CANDLESTICK_ENCODE_OPEN',
        message: `Candlestick series at index ${index} must have encode.open.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/open`,
      });
    }
    if (!hasEncodeField(encode, 'close')) {
      errors.push({
        code: 'MISSING_CANDLESTICK_ENCODE_CLOSE',
        message: `Candlestick series at index ${index} must have encode.close.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/close`,
      });
    }
    if (!hasEncodeField(encode, 'low')) {
      errors.push({
        code: 'MISSING_CANDLESTICK_ENCODE_LOW',
        message: `Candlestick series at index ${index} must have encode.low.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/low`,
      });
    }
    if (!hasEncodeField(encode, 'high')) {
      errors.push({
        code: 'MISSING_CANDLESTICK_ENCODE_HIGH',
        message: `Candlestick series at index ${index} must have encode.high.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/high`,
      });
    }
  } else if (seriesType === 'gauge') {
    if (!hasEncodeField(encode, 'value')) {
      errors.push({
        code: 'MISSING_GAUGE_ENCODE_VALUE',
        message: `Gauge series at index ${index} must have encode.value.`,
        kind: ValidationErrorKind.INVALID,
        path: `/dataProperties/series/${index}/encode/value`,
      });
    }
  }
}

/** Non-cartesian series types that should not have axes. */
const NON_CARTESIAN_SERIES_TYPES: ReadonlySet<string> = new Set([
  'pie',
  'radar',
  'gauge',
]);

function checkPieAxisMisuse(
  component: Record<string, unknown>,
  errors: ValidationError[],
): void {
  const dp = component.dataProperties;
  if (!isObject(dp)) {
    return;
  }

  const series = dp.series;
  if (!Array.isArray(series)) {
    return;
  }

  const hasNonCartesianSeries = series.some(
    (s) => isObject(s) && NON_CARTESIAN_SERIES_TYPES.has(getSeriesType(s) ?? ''),
  );

  if (!hasNonCartesianSeries) {
    return;
  }

  const hasOnlyNonCartesianSeries = series.every(
    (s) => !isObject(s) || NON_CARTESIAN_SERIES_TYPES.has(getSeriesType(s) ?? ''),
  );

  if (hasOnlyNonCartesianSeries) {
    if (component.xAxis !== undefined) {
      errors.push({
        code: 'NON_CARTESIAN_WITH_X_AXIS',
        message: 'Non-cartesian chart (pie/radar/gauge) should not have xAxis.',
        kind: ValidationErrorKind.INVALID,
        path: '/xAxis',
      });
    }
    if (component.yAxis !== undefined) {
      errors.push({
        code: 'NON_CARTESIAN_WITH_Y_AXIS',
        message: 'Non-cartesian chart (pie/radar/gauge) should not have yAxis.',
        kind: ValidationErrorKind.INVALID,
        path: '/yAxis',
      });
    }
  }
}

function checkAxisSeriesConsistency(
  component: Record<string, unknown>,
  validSeries: Record<string, unknown>[],
  errors: ValidationError[],
): void {
  const cartesianSeries = validSeries.filter(
    (s) => CARTESIAN_SERIES_TYPES.has(getSeriesType(s) ?? ''),
  );

  if (cartesianSeries.length === 0) {
    return;
  }

  const hasXAxis = component.xAxis !== undefined;
  const hasYAxis = component.yAxis !== undefined;

  if (!hasXAxis) {
    errors.push({
      code: 'MISSING_X_AXIS',
      message: 'Cartesian series (line/bar/scatter/candlestick) require xAxis configuration.',
      kind: ValidationErrorKind.INVALID,
      path: '/xAxis',
    });
  }

  if (!hasYAxis) {
    errors.push({
      code: 'MISSING_Y_AXIS',
      message: 'Cartesian series (line/bar/scatter/candlestick) require yAxis configuration.',
      kind: ValidationErrorKind.INVALID,
      path: '/yAxis',
    });
  }

  // 存在时校验坐标轴结构
  if (hasXAxis && !isAxisArrayOrSingle(component.xAxis)) {
    errors.push({
      code: 'INVALID_X_AXIS',
      message: 'xAxis must be an Axis object or an array of Axis objects.',
      kind: ValidationErrorKind.INVALID,
      path: '/xAxis',
    });
  }

  if (hasYAxis && !isAxisArrayOrSingle(component.yAxis)) {
    errors.push({
      code: 'INVALID_Y_AXIS',
      message: 'yAxis must be an Axis object or an array of Axis objects.',
      kind: ValidationErrorKind.INVALID,
      path: '/yAxis',
    });
  }
}

function checkDataType(
  dataProperties: Record<string, unknown>,
  errors: ValidationError[],
): void {
  const dataType = dataProperties.dataType;

  if (dataType === undefined || typeof dataType !== 'string') {
    errors.push({
      code: 'MISSING_DATA_TYPE',
      message: 'dataProperties.dataType is required and must be a string.',
      kind: ValidationErrorKind.INVALID,
      path: '/dataProperties/dataType',
    });
    return;
  }

  if (dataType === 'static') {
    const data = dataProperties.data;
    if (data === undefined) {
      errors.push({
        code: 'STATIC_DATA_MISSING',
        message: 'dataType is "static" but dataProperties.data is not provided.',
        kind: ValidationErrorKind.INVALID,
        path: '/dataProperties/data',
      });
    } else if (!Array.isArray(data)) {
      errors.push({
        code: 'STATIC_DATA_INVALID',
        message: 'dataType is "static" but dataProperties.data is not an array.',
        kind: ValidationErrorKind.INVALID,
        path: '/dataProperties/data',
      });
    }
  } else if (dataType === 'datasource') {
    errors.push({
      code: 'UNSUPPORTED_DATASOURCE',
      message: 'dataType "datasource" is not supported in phase 1. Use "static" data instead.',
      kind: ValidationErrorKind.UNSUPPORTED,
      path: '/dataProperties/dataType',
    });
  } else if (dataType === 'api') {
    errors.push({
      code: 'UNSUPPORTED_API',
      message: 'dataType "api" is not supported in phase 1. Use "static" data instead.',
      kind: ValidationErrorKind.UNSUPPORTED,
      path: '/dataProperties/dataType',
    });
  }
}

function checkSeriesName(
  series: Record<string, unknown>,
  index: number,
  errors: ValidationError[],
): void {
  if (typeof series.name !== 'string' || series.name.trim().length === 0) {
    errors.push({
      code: 'MISSING_SERIES_NAME',
      message: `Series at index ${index} must have a non-empty 'name' field.`,
      kind: ValidationErrorKind.INVALID,
      path: `/dataProperties/series/${index}/name`,
    });
  }
}

// ---------------------------------------------------------------------------
// 主校验函数
// ---------------------------------------------------------------------------

/**
 * 根据结构规则和第一阶段支持矩阵校验 `ChartComponent` 定义。
 *
 * @param input - 待校验的原始组件值（通常为 `unknown`）。
 * @returns 包含 `ok` 和 `errors` 的结构化校验结果。
 */
export function validateChartComponent(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // 步骤 1：检查组件类型
  if (!checkComponentType(input, errors)) {
    return { ok: false, errors };
  }
  const component = input as Record<string, unknown>;

  // 步骤 2：检查 dataProperties 是否存在
  if (!checkDataProperties(component, errors)) {
    return { ok: false, errors };
  }
  const dataProperties = component.dataProperties as unknown as Record<string, unknown>;

  // 步骤 3：检查系列是否存在以及第一阶段支持情况
  const validSeries = checkSeries(dataProperties, errors);

  // 步骤 4：检查系列 encode 字段和 name
  if (validSeries !== null) {
    for (let i = 0; i < validSeries.length; i++) {
      checkSeriesEncode(validSeries[i], i, errors);
      checkSeriesName(validSeries[i], i, errors);
    }

    // 步骤 5：检查坐标轴与系列的一致性（笛卡尔坐标系）
    checkAxisSeriesConsistency(component, validSeries, errors);
  }

  // 步骤 6：检查饼图坐标轴误用
  checkPieAxisMisuse(component, errors);

  // 步骤 7：检查 dataType 及数据可用性
  checkDataType(dataProperties, errors);

  return {
    ok: errors.length === 0,
    errors,
  };
}
