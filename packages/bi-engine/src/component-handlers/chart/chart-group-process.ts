// ============================================================================
// chart-group-process.ts — axisGroup 数据分组处理
// ============================================================================

import type { Series } from '../../schema/bi-engine-models';

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

/** chartGroupProcess 输入 */
export interface ChartGroupInput {
  /** 原始系列配置 */
  series: Series[];
  /** 坐标轴分组键值列表 */
  axisGroup?: string[];
  /** 原始窄表数据 */
  chartData: Record<string, unknown>[];
}

/** chartGroupProcess 输出 */
export interface ChartGroupResult {
  /** 透视后的宽表数据 */
  renderData: Record<string, unknown>[];
  /** 动态生成的系列配置 */
  renderSeries: Series[];
}

// ---------------------------------------------------------------------------
// 辅助判断
// ---------------------------------------------------------------------------

/**
 * 判断 axisGroup 是否需要执行分组处理。
 *
 * 以下情况跳过分组：
 * - axisGroup 为 undefined 或空数组
 * - axisGroup 为 `['None']`
 */
export function shouldApplyAxisGroup(axisGroup: string[] | undefined): boolean {
  return (
    axisGroup !== undefined &&
    axisGroup.length > 0 &&
    !(axisGroup.length === 1 && axisGroup[0] === 'None')
  );
}

// ---------------------------------------------------------------------------
// chartGroupProcess
// ---------------------------------------------------------------------------

/**
 * 将窄表（long format）数据按 axisGroup 字段透视为宽表（wide format），
 * 并动态生成多系列配置。
 *
 * 转换规则：
 * 1. 按 `series[0].encode.x` 的 key 做行分组
 * 2. 按 `axisGroup` 的 key 组合值生成新列名
 *    - 多个 axisGroup：值用 `-` 连接 → `"test1-测试维度1"`
 *    - 单个 axisGroup：值直接作为列名 → `"test1"`
 * 3. axisGroup 为 `['None']`、空数组或 undefined：原样返回
 * 4. 每个 axisGroup 值组合生成一个 series，`encode.y` 指向新列名
 *
 * @param input - 包含 series、axisGroup 和 chartData 的输入对象
 * @returns 透视后的 renderData 和 renderSeries
 */
export function chartGroupProcess(input: ChartGroupInput): ChartGroupResult {
  const { series, axisGroup, chartData } = input;

  // 无分组或 None 透传
  if (!shouldApplyAxisGroup(axisGroup)) {
    return {
      renderData: chartData,
      renderSeries: series,
    };
  }

  // 无数据或无系列
  if (chartData.length === 0 || series.length === 0) {
    return {
      renderData: [],
      renderSeries: [],
    };
  }

  const xField = getXField(series);
  const yField = getYField(series);

  // Step 1: 收集所有唯一的分组组合键
  const groupKeySet = new Set<string>();
  for (let i = 0; i < chartData.length; i++) {
    const key = buildGroupKey(chartData[i], axisGroup);
    groupKeySet.add(key);
  }

  const groupKeys = Array.from(groupKeySet);

  // Step 2: 按 xField 分组，合并同 x 值的行
  const xGroups = new Map<string, Map<string, unknown>>();
  for (let i = 0; i < chartData.length; i++) {
    const row = chartData[i];
    const xValue = String(row[xField] ?? '');
    const groupKey = buildGroupKey(row, axisGroup);

    if (!xGroups.has(xValue)) {
      xGroups.set(xValue, new Map());
    }
    const rowMap = xGroups.get(xValue)!;
    rowMap.set(groupKey, row[yField]);
  }

  // Step 3: 构建 renderData
  const renderData: Record<string, unknown>[] = [];
  for (const [xValue, rowMap] of xGroups) {
    const wideRow: Record<string, unknown> = { [xField]: xValue };
    for (const [gk, yValue] of rowMap) {
      wideRow[gk] = yValue;
    }
    renderData.push(wideRow);
  }

  // Step 4: 构建 renderSeries
  const firstSeries = series[0];
  const renderSeries: Series[] = groupKeys.map((gk) => ({
    ...firstSeries,
    name: gk,
    encode: {
      ...firstSeries.encode,
      y: gk,
    },
  }));

  return { renderData, renderSeries };
}

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 从系列配置中提取 x 字段名。
 */
function getXField(series: Series[]): string {
  const first = series[0];
  const encode = first.encode as Record<string, string>;
  return encode.x;
}

/**
 * 从系列配置中提取 y 字段名。
 */
function getYField(series: Series[]): string {
  const first = series[0];
  const encode = first.encode as Record<string, string>;
  return encode.y;
}

/**
 * 根据数据行和 axisGroup 字段构建分组键。
 *
 * 多个字段值用 `-` 连接，单个字段直接使用值。
 */
function buildGroupKey(
  row: Record<string, unknown>,
  axisGroup: string[],
): string {
  if (axisGroup.length === 1) {
    return String(row[axisGroup[0]] ?? '');
  }

  const parts: string[] = [];
  for (let i = 0; i < axisGroup.length; i++) {
    parts.push(String(row[axisGroup[i]] ?? ''));
  }
  return parts.join('-');
}
