import type { PieSeries, Series } from '../../schema/bi-engine-models';
import type { ChartSemanticModel } from '../../core/chart-semantic-model';
import type { EChartsOption } from './build-line-option';
import { FONT_SIZE, TEXT_COLOR, FONT_FAMILY } from './option-templates/base-option';

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

/** 饼图/环形图统一 center，为右侧图例留空间 */
const PIE_CENTER: [string, string] = ['40%', '50%'];

// ---------------------------------------------------------------------------
// 内部辅助函数
// ---------------------------------------------------------------------------

/**
 * 类型守卫：将 `Series` 收窄为 `PieSeries`。
 */
function isPieSeries(series: Series): series is PieSeries {
  return series.type === 'pie';
}

/**
 * 使用系列的 encode 映射从数据集中提取饼图数据点。
 *
 * 每个数据点变为 ECharts 饼图系列期望的 `{ name, value }` 格式。
 */
function extractPieData(
  model: ChartSemanticModel,
  encode: { name: string; value: string },
): Array<Record<string, unknown>> {
  const result: Array<Record<string, unknown>> = [];

  for (let i = 0; i < model.dataset.length; i++) {
    const row = model.dataset[i];
    result.push({
      name: row[encode.name],
      value: row[encode.value],
    });
  }

  return result;
}

/**
 * 构建饼图的默认提示框配置。
 */
function buildPieTooltip(): Record<string, unknown> {
  return {
    trigger: 'item',
  };
}

/**
 * 构建饼图的默认图例配置。
 *
 * 饼图图例显示数据中的类目名称，而非系列名称。
 * 当只有一个数据切片时，隐藏图例。
 */
function buildPieLegend(
  data: Array<Record<string, unknown>>,
): Record<string, unknown> {
  const names: unknown[] = [];

  for (let i = 0; i < data.length; i++) {
    names.push(data[i].name);
  }

  return {
    show: names.length > 1,
    data: names,
  };
}

/**
 * 构建环形图中心文本 graphic 元素。
 *
 * 返回 ECharts 标准数组格式 `[{ type: 'text', ... }]`。
 * 当主/副文本同时存在时，分别向上/下偏移 4% 以避免重叠。
 */
function buildRingGraphic(
  centerText: string | undefined,
  subCenterText: string | undefined,
): Record<string, unknown>[] | undefined {
  if (centerText === undefined && subCenterText === undefined) {
    return undefined;
  }

  const elements: Record<string, unknown>[] = [];
  const hasBoth = centerText !== undefined && subCenterText !== undefined;

  if (centerText !== undefined) {
    elements.push({
      type: 'text',
      left: PIE_CENTER[0],
      top: hasBoth ? '46%' : PIE_CENTER[1],
      style: {
        text: centerText,
        fontSize: 20,
        fontWeight: 700,
        fill: TEXT_COLOR.primary,
        fontFamily: FONT_FAMILY,
        textAlign: 'center',
        textVerticalAlign: 'middle',
      },
    });
  }

  if (subCenterText !== undefined) {
    elements.push({
      type: 'text',
      left: PIE_CENTER[0],
      top: hasBoth ? '54%' : PIE_CENTER[1],
      style: {
        text: subCenterText,
        fontSize: FONT_SIZE.subtitle,
        fill: TEXT_COLOR.tertiary,
        fontFamily: FONT_FAMILY,
        textAlign: 'center',
        textVerticalAlign: 'middle',
      },
    });
  }

  return elements;
}

// ---------------------------------------------------------------------------
// buildPieOption
// ---------------------------------------------------------------------------

/**
 * 从 `ChartSemanticModel` 构建饼图/环形图的 ECharts 选项对象。
 *
 * 职责：
 * - 将饼图系列条目映射为 ECharts 系列定义。
 * - 当 `subType === 'ring'` 时设置 `radius`。
 * - 环形图支持中心文本（centerText / subCenterText）。
 * - 统一设置 `center: ['40%', '50%']`，为右侧图例留空间。
 * - 饼图没有 xAxis / yAxis。
 *
 * @param model - 完全解析的语义模型。
 * @returns 可供 ECharts 运行时使用的 `EChartsOption`。
 */
export function buildPieOption(model: ChartSemanticModel): EChartsOption {
  const echartsSeries: Record<string, unknown>[] = [];
  let firstPieData: Array<Record<string, unknown>> = [];
  let firstRing: PieSeries | undefined;

  for (let i = 0; i < model.series.length; i++) {
    const s = model.series[i];

    if (!isPieSeries(s)) {
      continue;
    }

    const pieData = extractPieData(model, s.encode);

    if (i === 0) {
      firstPieData = pieData;
    }

    const seriesEntry: Record<string, unknown> = {
      type: 'pie',
      name: s.name,
      data: pieData,
      center: PIE_CENTER,
    };

    if (s.subType === 'ring') {
      seriesEntry.radius = ['50%', '75%'];
      if (firstRing === undefined) {
        firstRing = s;
      }
    }

    echartsSeries.push(seriesEntry);
  }

  const option: EChartsOption = {
    tooltip: buildPieTooltip(),
    legend: buildPieLegend(firstPieData),
    series: echartsSeries,
  };

  // 环形图中心文本
  if (firstRing !== undefined) {
    const graphic = buildRingGraphic(firstRing.centerText, firstRing.subCenterText);
    if (graphic !== undefined) {
      option.graphic = graphic;
    }
  }

  return option;
}
