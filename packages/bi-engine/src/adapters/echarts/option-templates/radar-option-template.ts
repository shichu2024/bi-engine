import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../../theme/theme-tokens';
import { getBaseOption } from './base-option';

export function getRadarOptionTemplate(theme?: ThemeTokens): EChartsOption {
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

    radar: {
      shape: 'polygon',
      center: ['50%', '55%'],
      radius: '65%',
      name: {
        textStyle: {
          fontSize: t.font.axisLabelSize,
          color: t.font.secondaryColor,
          fontFamily: t.font.family,
        },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(84, 112, 198, 0.02)', 'rgba(84, 112, 198, 0.05)'],
        },
      },
      splitLine: {
        lineStyle: {
          color: t.border.gridColor,
        },
      },
      axisLine: {
        lineStyle: {
          color: t.border.gridColor,
        },
      },
      indicator: [],
    },

    series: [{
      type: 'radar',
      areaStyle: {
        opacity: 0.15,
      },
      lineStyle: {
        width: 2,
      },
      symbol: 'circle',
      symbolSize: 6,
      emphasis: {
        focus: 'series',
      },
    }],
  };
}
