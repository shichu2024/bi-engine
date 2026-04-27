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
 * 构建环形图中心文本的 label 配置。
 *
 * 使用 ECharts 原生 `series.label` + `rich` 富文本，
 * `position: 'center'` 天然居中于饼图圆心。
 *
 * @param centerText - 中心主文本（如 "Total"）
 * @param subCenterText - 中心副文本（如 "$100K"）
 * @returns label 配置对象，无文本时返回 undefined
 */
function buildRingCenterLabel(
  centerText: string | undefined,
  subCenterText: string | undefined,
): Record<string, unknown> | undefined {
  if (centerText === undefined && subCenterText === undefined) {
    return undefined;
  }

  // 构建 formatter：按主/副文本的存在组合
  const parts: string[] = [];
  if (centerText !== undefined) {
    parts.push(`{title|${centerText}}`);
  }
  if (subCenterText !== undefined) {
    parts.push(`{value|${subCenterText}}`);
  }

  return {
    show: true,
    position: 'center' as const,
    formatter: parts.join('\n'),
    rich: {
      title: {
        fontSize: 20,
        fontWeight: 700,
        color: TEXT_COLOR.primary,
        fontFamily: FONT_FAMILY,
        lineHeight: 24,
        align: 'center',
      },
      value: {
        fontSize: FONT_SIZE.subtitle,
        color: TEXT_COLOR.tertiary,
        fontFamily: FONT_FAMILY,
        lineHeight: 30,
        align: 'center',
      },
    },
  };
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
 * - 环形图中心文本使用 `series.label` + `rich` 富文本实现天然居中。
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

  // 环形图中心文本：注入到第一个数据切片的 label
  // centerText/subCenterText 可来自 PieSeries 或 ChartOption，series 优先
  if (firstRing !== undefined) {
    const chartOpt = model.chartOption;
    const centerText = firstRing.centerText ?? chartOpt?.centerText;
    const subCenterText = firstRing.subCenterText ?? chartOpt?.subCenterText;
    const centerLabel = buildRingCenterLabel(centerText, subCenterText);
    if (centerLabel !== undefined) {
      // 第一个系列获取中心 label
      const firstSeries = echartsSeries[0];
      firstSeries.label = centerLabel;

      // 为每个数据切片设置 label：第一个切片显示中心文本，其余隐藏
      const data = firstSeries.data as Array<Record<string, unknown>>;
      const labeledData = data.map((item, index) => ({
        ...item,
        label: { show: index === 0 },
      }));
      firstSeries.data = labeledData;
    }
  }

  const option: EChartsOption = {
    tooltip: buildPieTooltip(),
    legend: buildPieLegend(firstPieData),
    series: echartsSeries,
  };

  return option;
}
