import type { EChartsOption } from '../build-line-option';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';

export function getCandlestickOptionTemplate(_theme?: ThemeTokens): EChartsOption {
  return {
    ...getBaseOption(_theme),

    tooltip: {
      ...getBaseOption(_theme).tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },

    legend: {
      ...getBaseOption(_theme).legend,
    },

    xAxis: {
      ...getCartesianAxisDefaults(_theme).xAxis,
      type: 'category',
    },

    yAxis: {
      ...getCartesianAxisDefaults(_theme).yAxis,
      type: 'value',
      scale: true,
    },

    series: [{
      type: 'candlestick',
      itemStyle: {
        color: '#EC0000',
        color0: '#00DA3C',
        borderColor: '#EC0000',
        borderColor0: '#00DA3C',
      },
    }],
  };
}
