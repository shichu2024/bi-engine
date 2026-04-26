// ============================================================================
// option-templates/line-option-template.ts — 折线图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';

export function getLineOptionTemplate(theme?: ThemeTokens): EChartsOption {
  return {
    ...getBaseOption(theme),

    tooltip: {
      ...getBaseOption(theme).tooltip,
      trigger: 'axis',
    },

    legend: {
      ...getBaseOption(theme).legend,
    },

    xAxis: {
      ...getCartesianAxisDefaults(theme).xAxis,
      type: 'category',
      boundaryGap: false,
    },

    yAxis: {
      ...getCartesianAxisDefaults(theme).yAxis,
      type: 'value',
    },

    // 折线图系列默认配置
    series: [{
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      connectNulls: true,
      lineStyle: {
        width: 2,
      },
      itemStyle: {
        borderWidth: 2,
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderWidth: 3,
        },
      },
    }],
  };
}
