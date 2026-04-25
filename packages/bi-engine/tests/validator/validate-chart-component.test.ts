import { describe, it, expect } from 'vitest';
import {
  validateChartComponent,
  ValidationErrorKind,
  type ValidationError,
  type ValidationResult,
} from '../../src/core/validate-chart-component';

// ---------------------------------------------------------------------------
// 测试固件
// ---------------------------------------------------------------------------

/** 最小的合法折线图组件 */
function validLineChart() {
  return {
    id: 'chart-line-1',
    type: 'chart',
    dataProperties: {
      dataType: 'static',
      data: [
        { month: 'Jan', sales: 100 },
        { month: 'Feb', sales: 200 },
      ],
      series: [
        {
          type: 'line',
          name: 'Sales',
          encode: { x: 'month', y: 'sales' },
        },
      ],
    },
    xAxis: { type: 'category', name: 'Month' },
    yAxis: { type: 'value', name: 'Sales' },
  };
}

/** 最小的合法柱状图组件 */
function validBarChart() {
  return {
    id: 'chart-bar-1',
    type: 'chart',
    dataProperties: {
      dataType: 'static',
      data: [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
      ],
      series: [
        {
          type: 'bar',
          name: 'Values',
          encode: { x: 'category', y: 'value' },
        },
      ],
    },
    xAxis: { type: 'category' },
    yAxis: { type: 'value' },
  };
}

/** 最小的合法饼图组件 */
function validPieChart() {
  return {
    id: 'chart-pie-1',
    type: 'chart',
    dataProperties: {
      dataType: 'static',
      data: [
        { name: 'A', value: 30 },
        { name: 'B', value: 70 },
      ],
      series: [
        {
          type: 'pie',
          name: 'Distribution',
          encode: { name: 'name', value: 'value' },
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

function hasError(
  result: ValidationResult,
  code: string,
): boolean {
  return result.errors.some((e) => e.code === code);
}

function getErrors(
  result: ValidationResult,
  code: string,
): ValidationError[] {
  return result.errors.filter((e) => e.code === code);
}

// ---------------------------------------------------------------------------
// 正常路径测试
// ---------------------------------------------------------------------------

describe('validateChartComponent - 正常路径', () => {
  it('接受合法的折线图组件', () => {
    const result = validateChartComponent(validLineChart());
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('接受合法的柱状图组件', () => {
    const result = validateChartComponent(validBarChart());
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('接受合法的饼图组件', () => {
    const result = validateChartComponent(validPieChart());
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('接受没有 xAxis 或 yAxis 的饼图', () => {
    const input = validPieChart();
    const result = validateChartComponent(input);
    expect(result.ok).toBe(true);
    expect(hasError(result, 'NON_CARTESIAN_WITH_X_AXIS')).toBe(false);
    expect(hasError(result, 'NON_CARTESIAN_WITH_Y_AXIS')).toBe(false);
  });

  it('接受单图表中的多个系列', () => {
    const input = {
      id: 'chart-multi-1',
      type: 'chart',
      dataProperties: {
        dataType: 'static',
        data: [
          { month: 'Jan', sales: 100, profit: 50 },
          { month: 'Feb', sales: 200, profit: 80 },
        ],
        series: [
          { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales' } },
          { type: 'bar', name: 'Profit', encode: { x: 'month', y: 'profit' } },
        ],
      },
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(true);
  });

  it('接受带有 area subType 的折线图', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        series: [
          { type: 'line', subType: 'area', name: 'Sales', encode: { x: 'month', y: 'sales' } },
        ],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(true);
  });

  it('接受带有 horizontal subType 的柱状图', () => {
    const input = {
      ...validBarChart(),
      dataProperties: {
        ...validBarChart().dataProperties,
        series: [
          { type: 'bar', subType: 'horizontal', name: 'Values', encode: { x: 'category', y: 'value' } },
        ],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(true);
  });

  it('接受带有 ring subType 的饼图', () => {
    const input = {
      ...validPieChart(),
      dataProperties: {
        ...validPieChart().dataProperties,
        series: [
          { type: 'pie', subType: 'ring', name: 'Distribution', encode: { name: 'name', value: 'value' } },
        ],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 错误路径测试
// ---------------------------------------------------------------------------

describe('validateChartComponent - 错误路径', () => {
  // 错误 1：非对象输入
  it('拒绝 null 输入', () => {
    const result = validateChartComponent(null);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'INVALID_INPUT_TYPE')).toBe(true);
    expect(result.errors[0].kind).toBe(ValidationErrorKind.INVALID);
  });

  it('拒绝 undefined 输入', () => {
    const result = validateChartComponent(undefined);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'INVALID_INPUT_TYPE')).toBe(true);
  });

  it('拒绝字符串输入', () => {
    const result = validateChartComponent('not an object');
    expect(result.ok).toBe(false);
    expect(hasError(result, 'INVALID_INPUT_TYPE')).toBe(true);
  });

  // 错误 2：错误的组件类型
  it('拒绝类型错误的组件', () => {
    const input = { ...validLineChart(), type: 'table' };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'INVALID_COMPONENT_TYPE')).toBe(true);
    const err = getErrors(result, 'INVALID_COMPONENT_TYPE')[0];
    expect(err.path).toBe('/type');
  });

  // 错误 3：缺少 dataProperties
  it('拒绝没有 dataProperties 的组件', () => {
    const input = { id: 'chart-1', type: 'chart' };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_DATA_PROPERTIES')).toBe(true);
  });

  it('拒绝 dataProperties 为非对象的组件', () => {
    const input = { id: 'chart-1', type: 'chart', dataProperties: 'invalid' };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'INVALID_DATA_PROPERTIES')).toBe(true);
  });

  // 错误 4：缺少 series
  it('拒绝没有 series 的组件', () => {
    const input = {
      id: 'chart-1',
      type: 'chart',
      dataProperties: {
        dataType: 'static',
        data: [],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_SERIES')).toBe(true);
  });

  it('拒绝空 series 数组的组件', () => {
    const input = {
      id: 'chart-1',
      type: 'chart',
      dataProperties: {
        dataType: 'static',
        data: [],
        series: [],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'INVALID_SERIES')).toBe(true);
  });

  // 错误 5：不支持的系列类型
  it('拒绝第一阶段不支持的系列类型（如 heatmap）', () => {
    const input = {
      id: 'chart-1',
      type: 'chart',
      dataProperties: {
        dataType: 'static',
        data: [{ x: 1, y: 2 }],
        series: [
          { type: 'heatmap', name: 'Heat', encode: { x: 'x', y: 'y' } },
        ],
      },
      xAxis: { type: 'value' },
      yAxis: { type: 'value' },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'UNSUPPORTED_SERIES_TYPE')).toBe(true);
    const err = getErrors(result, 'UNSUPPORTED_SERIES_TYPE')[0];
    expect(err.kind).toBe(ValidationErrorKind.UNSUPPORTED);
    expect(err.message).toContain('heatmap');
  });

  // 错误 6：非笛卡尔图表包含笛卡尔坐标轴
  it('拒绝包含 xAxis 的饼图', () => {
    const input = {
      ...validPieChart(),
      xAxis: { type: 'category' },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'NON_CARTESIAN_WITH_X_AXIS')).toBe(true);
  });

  it('拒绝包含 yAxis 的饼图', () => {
    const input = {
      ...validPieChart(),
      yAxis: { type: 'value' },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'NON_CARTESIAN_WITH_Y_AXIS')).toBe(true);
  });

  it('拒绝同时包含 xAxis 和 yAxis 的饼图', () => {
    const input = {
      ...validPieChart(),
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'NON_CARTESIAN_WITH_X_AXIS')).toBe(true);
    expect(hasError(result, 'NON_CARTESIAN_WITH_Y_AXIS')).toBe(true);
  });

  // 错误 7：不支持的 dataType（datasource / api）
  it('对 dataType=datasource 报告不支持', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        dataType: 'datasource',
        sourceId: 'ds-1',
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'UNSUPPORTED_DATASOURCE')).toBe(true);
    const err = getErrors(result, 'UNSUPPORTED_DATASOURCE')[0];
    expect(err.kind).toBe(ValidationErrorKind.UNSUPPORTED);
  });

  it('对 dataType=api 报告不支持', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        dataType: 'api',
        url: 'https://example.com/data',
        method: 'GET',
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'UNSUPPORTED_API')).toBe(true);
    const err = getErrors(result, 'UNSUPPORTED_API')[0];
    expect(err.kind).toBe(ValidationErrorKind.UNSUPPORTED);
  });

  // 错误 8：静态数据缺失或无效
  it('拒绝没有 data 字段的静态 dataType', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        dataType: 'static',
        series: validLineChart().dataProperties.series,
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'STATIC_DATA_MISSING')).toBe(true);
  });

  it('拒绝 data 为非数组的静态 dataType', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        data: 'not an array',
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'STATIC_DATA_INVALID')).toBe(true);
  });

  // 错误 9：缺少 dataType
  it('拒绝缺少 dataType 的组件', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        data: validLineChart().dataProperties.data,
        series: validLineChart().dataProperties.series,
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_DATA_TYPE')).toBe(true);
  });

  // 错误 10：缺少 series type
  it('拒绝没有 type 字段的系列', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        series: [{ name: 'Sales', encode: { x: 'month', y: 'sales' } }],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_SERIES_TYPE')).toBe(true);
  });

  // 错误 11：缺少 series name
  it('拒绝没有 name 的系列', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        series: [{ type: 'line', encode: { x: 'month', y: 'sales' } }],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_SERIES_NAME')).toBe(true);
  });

  // 错误 12：缺少 encode
  it('拒绝没有 encode 的系列', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        series: [{ type: 'line', name: 'Sales' }],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_SERIES_ENCODE')).toBe(true);
  });

  // 错误 13：笛卡尔系列缺少 encode.x 或 encode.y
  it('拒绝缺少 encode.x 的折线系列', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        series: [{ type: 'line', name: 'Sales', encode: { y: 'sales' } }],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_CARTESIAN_ENCODE_X')).toBe(true);
  });

  it('拒绝缺少 encode.y 的柱状系列', () => {
    const input = {
      ...validBarChart(),
      dataProperties: {
        ...validBarChart().dataProperties,
        series: [{ type: 'bar', name: 'Values', encode: { x: 'category' } }],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_CARTESIAN_ENCODE_Y')).toBe(true);
  });

  // 错误 14：饼图系列缺少 encode.name 或 encode.value
  it('拒绝缺少 encode.name 的饼图系列', () => {
    const input = {
      ...validPieChart(),
      dataProperties: {
        ...validPieChart().dataProperties,
        series: [{ type: 'pie', name: 'Dist', encode: { value: 'value' } }],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_PIE_ENCODE_NAME')).toBe(true);
  });

  it('拒绝缺少 encode.value 的饼图系列', () => {
    const input = {
      ...validPieChart(),
      dataProperties: {
        ...validPieChart().dataProperties,
        series: [{ type: 'pie', name: 'Dist', encode: { name: 'name' } }],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_PIE_ENCODE_VALUE')).toBe(true);
  });

  // 错误 15：笛卡尔系列缺少坐标轴
  it('拒绝没有 xAxis 的折线图', () => {
    const input = {
      ...validLineChart(),
      xAxis: undefined,
      yAxis: { type: 'value' },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_X_AXIS')).toBe(true);
  });

  it('拒绝没有 yAxis 的折线图', () => {
    const input = {
      ...validLineChart(),
      xAxis: { type: 'category' },
      yAxis: undefined,
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_Y_AXIS')).toBe(true);
  });

  it('拒绝没有两个坐标轴的柱状图', () => {
    const input = {
      ...validBarChart(),
      xAxis: undefined,
      yAxis: undefined,
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'MISSING_X_AXIS')).toBe(true);
    expect(hasError(result, 'MISSING_Y_AXIS')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 错误分类测试
// ---------------------------------------------------------------------------

describe('validateChartComponent - 错误分类', () => {
  it('将结构性错误分类为 INVALID', () => {
    const result = validateChartComponent({ type: 'table' });
    expect(result.ok).toBe(false);
    const invalidErrors = result.errors.filter(
      (e) => e.kind === ValidationErrorKind.INVALID,
    );
    expect(invalidErrors.length).toBeGreaterThan(0);
  });

  it('将不支持的系列分类为 UNSUPPORTED', () => {
    const input = {
      id: 'chart-1',
      type: 'chart',
      dataProperties: {
        dataType: 'static',
        data: [{ x: 1, y: 2 }],
        series: [
          { type: 'heatmap', name: 'Heat', encode: { x: 'x', y: 'y' } },
        ],
      },
      xAxis: { type: 'value' },
      yAxis: { type: 'value' },
    };
    const result = validateChartComponent(input);
    const unsupportedErrors = result.errors.filter(
      (e) => e.kind === ValidationErrorKind.UNSUPPORTED,
    );
    expect(unsupportedErrors.length).toBeGreaterThan(0);
  });

  it('将 datasource 分类为 UNSUPPORTED', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        dataType: 'datasource',
        sourceId: 'ds-1',
      },
    };
    const result = validateChartComponent(input);
    const unsupportedErrors = result.errors.filter(
      (e) => e.kind === ValidationErrorKind.UNSUPPORTED,
    );
    expect(unsupportedErrors).toHaveLength(1);
    expect(unsupportedErrors[0].code).toBe('UNSUPPORTED_DATASOURCE');
  });

  it('将 api 分类为 UNSUPPORTED', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        dataType: 'api',
        url: 'https://example.com/data',
      },
    };
    const result = validateChartComponent(input);
    const unsupportedErrors = result.errors.filter(
      (e) => e.kind === ValidationErrorKind.UNSUPPORTED,
    );
    expect(unsupportedErrors).toHaveLength(1);
    expect(unsupportedErrors[0].code).toBe('UNSUPPORTED_API');
  });
});

// ---------------------------------------------------------------------------
// 边界情况
// ---------------------------------------------------------------------------

describe('validateChartComponent - 边界情况', () => {
  it('同时返回所有错误（而非仅第一个）', () => {
    const input = {
      id: 'chart-1',
      type: 'chart',
      dataProperties: {
        dataType: 'static',
        data: 'not-array',
        series: [
          { type: 'heatmap', name: 'Heat', encode: { x: 'x', y: 'y' } },
        ],
      },
      xAxis: { type: 'value' },
      yAxis: { type: 'value' },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(hasError(result, 'UNSUPPORTED_SERIES_TYPE')).toBe(true);
    expect(hasError(result, 'STATIC_DATA_INVALID')).toBe(true);
  });

  it('对非对象输入提前返回', () => {
    const result = validateChartComponent(42);
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('INVALID_INPUT_TYPE');
  });

  it('对错误的组件类型提前返回', () => {
    const input = { type: 'text', id: 't1', dataProperties: { content: 'hello', dataType: 'static' } };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('INVALID_COMPONENT_TYPE');
  });

  it('对缺少 dataProperties 提前返回', () => {
    const input = { type: 'chart', id: 'c1' };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('MISSING_DATA_PROPERTIES');
  });

  it('在错误中包含路径信息', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        series: [
          { type: 'heatmap', name: 'Heat', encode: { x: 'x', y: 'y' } },
        ],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    const err = getErrors(result, 'UNSUPPORTED_SERIES_TYPE')[0];
    expect(err.path).toBe('/dataProperties/series/0/type');
  });

  it('处理混合合法和不支持的系列', () => {
    const input = {
      ...validLineChart(),
      dataProperties: {
        ...validLineChart().dataProperties,
        series: [
          { type: 'line', name: 'Sales', encode: { x: 'month', y: 'sales' } },
          { type: 'heatmap', name: 'Heat', encode: { x: 'month', y: 'sales' } },
        ],
      },
    };
    const result = validateChartComponent(input);
    expect(result.ok).toBe(false);
    expect(hasError(result, 'UNSUPPORTED_SERIES_TYPE')).toBe(true);
    // 合法的折线系列不应产生错误
    const lineErrors = result.errors.filter(
      (e) => e.code === 'MISSING_SERIES_ENCODE' || e.code === 'MISSING_SERIES_NAME',
    );
    expect(lineErrors).toHaveLength(0);
  });
});
