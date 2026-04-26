// ============================================================================
// option-templates/pie-option-template.ts — 饼图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../../theme/theme-tokens';
import { getBaseOption } from './base-option';

export function getPieOptionTemplate(theme?: ThemeTokens): EChartsOption {
  const t = theme ?? DEFAULT_THEME_TOKENS;

  return {
    ...getBaseOption(theme),

    tooltip: {
      ...getBaseOption(theme).tooltip,
      trigger: 'item',
    },

    legend: {
      ...getBaseOption(theme).legend,
      orient: 'vertical',
      right: '10%',
      left: 'auto',
      top: 'middle',
      bottom: 'auto',
      tooltip: {
        show: true,
      },
    },

    series: [{
      type: 'pie',
      avoidLabelOverlap: true,
      center: ['40%', '50%'],
      radius: '70%',
      label: {
        fontSize: t.font.size,
        color: t.font.secondaryColor,
        fontFamily: t.font.family,
        formatter: '{b}: {d}%',
      },
      labelLine: {
        length: 16,
        length2: 12,
        smooth: true,
        lineStyle: {
          color: t.border.axisLineColor,
        },
      },
      emphasis: {
        label: {
          fontSize: t.font.size + 2,
          fontWeight: 600,
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
      itemStyle: {
        borderColor: t.background.chart,
        borderWidth: 2,
      },
    }],
  };
}

export function getRingOptionTemplate(
  centerTitle?: string,
  centerSubtitle?: string,
  theme?: ThemeTokens,
): EChartsOption {
  const t = theme ?? DEFAULT_THEME_TOKENS;
  const pieTemplate = getPieOptionTemplate(theme);
  const series = pieTemplate.series as Record<string, unknown>[];

  const graphicItems: Record<string, unknown>[] = [];

  if (centerTitle !== undefined) {
    graphicItems.push({
      type: 'text',
      left: '40%',
      top: '44%',
      style: {
        text: centerTitle,
        fontSize: 20,
        fontWeight: 700,
        fill: t.font.color,
        fontFamily: t.font.family,
        textAlign: 'center',
      },
    });
  }

  if (centerSubtitle !== undefined) {
    graphicItems.push({
      type: 'text',
      left: '40%',
      top: '54%',
      style: {
        text: centerSubtitle,
        fontSize: t.font.size,
        fill: t.font.tertiaryColor,
        fontFamily: t.font.family,
        textAlign: 'center',
      },
    });
  }

  return {
    ...pieTemplate,
    ...(graphicItems.length > 0 ? { graphic: { elements: graphicItems } } : {}),
    series: series.map((s) => ({
      ...s,
      radius: ['50%', '75%'],
    })),
  };
}
