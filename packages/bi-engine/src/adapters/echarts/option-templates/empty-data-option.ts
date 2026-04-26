// ============================================================================
// option-templates/empty-data-option.ts — 空数据兜底配置
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../../theme/theme-tokens';
import type { BILocale } from '../../../locale/types';
import { zhCN } from '../../../locale';

/**
 * 返回空数据场景下的兜底 Option。
 *
 * 使用 ECharts graphic 组件在图表中心显示空数据提示。
 */
export function getEmptyDataOption(
  width: number = 400,
  height: number = 300,
  theme?: ThemeTokens,
  locale?: BILocale,
): EChartsOption {
  const t = theme ?? DEFAULT_THEME_TOKENS;
  const l = locale ?? zhCN;

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
        text: l.table.empty.noData,
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
