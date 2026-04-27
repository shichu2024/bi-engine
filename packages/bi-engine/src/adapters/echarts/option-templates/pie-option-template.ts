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

  // 使用 series.label + rich 富文本实现中心文本，天然居中于饼图圆心
  const hasCenterText = centerTitle !== undefined || centerSubtitle !== undefined;

  // 构建 formatter
  let formatter = '';
  if (hasCenterText) {
    const parts: string[] = [];
    if (centerTitle !== undefined) {
      parts.push(`{title|${centerTitle}}`);
    }
    if (centerSubtitle !== undefined) {
      parts.push(`{value|${centerSubtitle}}`);
    }
    formatter = parts.join('\n');
  }

  return {
    ...pieTemplate,
    series: series.map((s) => ({
      ...s,
      radius: ['50%', '75%'],
      ...(hasCenterText
        ? {
            label: {
              show: true,
              position: 'center',
              formatter,
              rich: {
                title: {
                  fontSize: 20,
                  fontWeight: 700,
                  color: t.font.color,
                  fontFamily: t.font.family,
                  lineHeight: 24,
                  align: 'center',
                },
                value: {
                  fontSize: t.font.size,
                  color: t.font.tertiaryColor,
                  fontFamily: t.font.family,
                  lineHeight: 30,
                  align: 'center',
                },
              },
            },
            emphasis: {
              label: {
                show: false,
              },
            },
          }
        : {}),
    })),
  };
}
