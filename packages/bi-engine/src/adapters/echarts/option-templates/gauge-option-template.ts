import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../../theme/theme-tokens';
import { getBaseOption, COLOR_PALETTE } from './base-option';

export function getGaugeOptionTemplate(theme?: ThemeTokens): EChartsOption {
  const t = theme ?? DEFAULT_THEME_TOKENS;

  return {
    ...getBaseOption(theme),

    tooltip: {
      ...getBaseOption(theme).tooltip,
      trigger: 'item',
    },

    series: [{
      type: 'gauge',
      center: ['50%', '55%'],
      radius: '80%',
      startAngle: 220,
      endAngle: -40,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 16,
          color: [
            [0.3, COLOR_PALETTE[0]],
            [0.7, COLOR_PALETTE[1]],
            [1, COLOR_PALETTE[3]],
          ],
        },
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '55%',
        width: 8,
        offsetCenter: [0, '-10%'],
        itemStyle: {
          color: 'auto',
        },
      },
      axisTick: {
        distance: -16,
        length: 6,
        lineStyle: {
          color: t.background.chart,
          width: 1,
        },
      },
      splitLine: {
        distance: -16,
        length: 16,
        lineStyle: {
          color: t.background.chart,
          width: 2,
        },
      },
      axisLabel: {
        color: t.font.tertiaryColor,
        distance: 24,
        fontSize: t.font.axisLabelSize - 2,
        fontFamily: t.font.family,
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}',
        fontSize: t.font.titleSize + 8,
        fontWeight: 600,
        color: t.font.color,
        fontFamily: t.font.family,
        offsetCenter: [0, '40%'],
      },
      title: {
        offsetCenter: [0, '60%'],
        fontSize: t.font.size,
        color: t.font.tertiaryColor,
        fontFamily: t.font.family,
      },
      data: [],
    }],
  };
}
