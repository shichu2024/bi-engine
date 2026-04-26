// ============================================================================
// option-templates/empty-data-option.ts — 空数据兜底配置
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../../theme/theme-tokens';

/** 空数据提示文案 */
const EMPTY_DATA_TEXT = '暂无数据';

/**
 * 返回空数据场景下的兜底 Option。
 *
 * 使用 ECharts graphic 组件在图表中心显示"暂无数据"提示。
 */
export function getEmptyDataOption(
  width: number = 400,
  height: number = 300,
  theme?: ThemeTokens,
): EChartsOption {
  const t = theme ?? DEFAULT_THEME_TOKENS;

  return {
    title: { show: false },
    tooltip: { show: false },
    legend: { show: false },
    xAxis: { show: false },
    yAxis: { show: false },
    series: [],
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: EMPTY_DATA_TEXT,
        fontSize: 14,
        fill: t.font.secondaryColor,
        fontFamily: t.font.family,
      },
    },
  };
}

/**
 * 判断数据集是否为空。
 */
export function isDatasetEmpty(dataset: Record<string, unknown>[]): boolean {
  return dataset.length === 0;
}
