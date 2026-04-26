// ============================================================================
// option-templates/bar-option-template.ts — 柱状图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';

export function getBarOptionTemplate(theme?: ThemeTokens): EChartsOption {
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
    },

    yAxis: {
      ...getCartesianAxisDefaults(theme).yAxis,
      type: 'value',
    },

    series: [{
      type: 'bar',
      barMaxWidth: 40,
      barMinHeight: 2,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        focus: 'series',
      },
    }],
  };
}
