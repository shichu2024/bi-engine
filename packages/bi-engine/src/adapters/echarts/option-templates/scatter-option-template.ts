import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../../theme/theme-tokens';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';

export function getScatterOptionTemplate(theme?: ThemeTokens): EChartsOption {
  const t = theme ?? DEFAULT_THEME_TOKENS;

  return {
    ...getBaseOption(theme),

    tooltip: {
      ...getBaseOption(theme).tooltip,
      trigger: 'item',
    },

    legend: {
      ...getBaseOption(theme).legend,
    },

    xAxis: {
      ...getCartesianAxisDefaults(theme).xAxis,
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: t.border.splitLineColor,
          type: 'dashed',
        },
      },
    },

    yAxis: {
      ...getCartesianAxisDefaults(theme).yAxis,
      type: 'value',
    },

    series: [{
      type: 'scatter',
      symbolSize: 10,
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderWidth: 2,
          borderColor: t.background.chart,
        },
      },
    }],
  };
}
