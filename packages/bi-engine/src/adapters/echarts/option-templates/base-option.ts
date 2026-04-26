// ============================================================================
// option-templates/base-option.ts — 全局标准化基础 Option 模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import type { ThemeTokens } from '../../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../../theme/theme-tokens';

// ---------------------------------------------------------------------------
// getBaseOption — 全局标准化基础 Option
// ---------------------------------------------------------------------------

/**
 * 返回全局标准化的 ECharts 基础 Option 配置。
 *
 * 所有图表类型的标准化模板均以此为基础，保证视觉一致性。
 * 消费者可通过深度合并工具覆盖任意配置项。
 *
 * @param theme - 可选主题令牌，不传时降级到 DEFAULT_THEME_TOKENS
 */
export function getBaseOption(theme?: ThemeTokens): EChartsOption {
  const t = theme ?? DEFAULT_THEME_TOKENS;

  return {
    // 标准色板
    color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4'],

    // 全局字体
    textStyle: {
      fontFamily: t.font.family,
      fontSize: t.font.axisLabelSize,
      color: t.font.color,
    },

    // 标题
    title: {
      show: false,
      left: 'center',
      top: 12,
      textStyle: {
        fontSize: t.font.titleSize,
        fontWeight: 600,
        color: t.font.color,
        fontFamily: t.font.family,
      },
      subtextStyle: {
        fontSize: t.font.size,
        color: t.font.secondaryColor,
        fontFamily: t.font.family,
      },
    },

    // 提示框
    tooltip: {
      show: true,
      backgroundColor: t.background.tooltip,
      borderColor: t.border.tooltipBorderColor,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: t.font.color,
        fontSize: t.font.size,
        fontFamily: t.font.family,
      },
      extraCssText: `box-shadow: 0 4px 12px rgba(0,0,0,0.1);`,
      confine: true,
    },

    // 图例
    legend: {
      show: false,
      bottom: 0,
      left: 'center',
      orient: 'horizontal',
      itemWidth: 14,
      itemHeight: 10,
      itemGap: 16,
      textStyle: {
        fontSize: t.font.size,
        color: t.font.secondaryColor,
        fontFamily: t.font.family,
        width: 100,
        overflow: 'truncate',
        ellipsis: '...',
      },
      icon: 'roundRect',
      type: 'scroll',
      pageIconSize: 10,
      pageTextStyle: {
        fontSize: t.font.size,
        color: t.font.tertiaryColor,
      },
      tooltip: {
        show: true,
      },
      formatter: function (name: string): string {
        const MAX_LEGEND_LENGTH = 12;
        if (name.length > MAX_LEGEND_LENGTH) {
          return name.slice(0, MAX_LEGEND_LENGTH) + '...';
        }
        return name;
      },
    },

    // 网格
    grid: {
      left: 60,
      right: 80,
      top: 60,
      bottom: 60,
      containLabel: true,
    },

    // 动画
    animation: true,
    animationDuration: 600,
    animationEasing: 'cubicOut',
  };
}

// ---------------------------------------------------------------------------
// getCartesianAxisDefaults — 笛卡尔坐标系坐标轴默认样式
// ---------------------------------------------------------------------------

/**
 * 返回笛卡尔坐标系图表（line/bar/scatter/candlestick）的坐标轴标准化样式。
 *
 * 非笛卡尔图表（pie/radar/gauge）不应使用此函数。
 */
export function getCartesianAxisDefaults(theme?: ThemeTokens): {
  xAxis: Record<string, unknown>;
  yAxis: Record<string, unknown>;
} {
  const t = theme ?? DEFAULT_THEME_TOKENS;

  return {
    xAxis: {
      axisLine: {
        lineStyle: {
          color: t.border.axisLineColor,
        },
      },
      axisTick: {
        lineStyle: {
          color: t.border.axisLineColor,
        },
      },
      axisLabel: {
        fontSize: t.font.axisLabelSize,
        color: t.font.secondaryColor,
        fontFamily: t.font.family,
        width: 80,
        overflow: 'truncate',
        ellipsis: '...',
        tooltip: {
          show: true,
        },
      },
      axisName: {
        fontSize: t.font.size,
        color: t.font.secondaryColor,
        fontFamily: t.font.family,
        width: 80,
        overflow: 'truncate',
        ellipsis: '...',
        align: 'left',
        tooltip: {
          show: true,
        },
      },
      nameLocation: 'end',
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontSize: t.font.axisLabelSize,
        color: t.font.secondaryColor,
        fontFamily: t.font.family,
        width: 60,
        overflow: 'truncate',
        ellipsis: '...',
        tooltip: {
          show: true,
        },
      },
      axisName: {
        fontSize: t.font.size,
        color: t.font.secondaryColor,
        fontFamily: t.font.family,
        width: 60,
        overflow: 'truncate',
        ellipsis: '...',
        tooltip: {
          show: true,
        },
      },
      splitLine: {
        lineStyle: {
          color: t.border.splitLineColor,
          type: 'dashed',
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// 兼容性导出：供高级用户自定义时参考的常量（从 DEFAULT_TOKENS 推导）
// ---------------------------------------------------------------------------

export const FONT_FAMILY = DEFAULT_THEME_TOKENS.font.family;
export const FONT_SIZE = {
  title: DEFAULT_THEME_TOKENS.font.titleSize,
  subtitle: DEFAULT_THEME_TOKENS.font.size,
  legend: DEFAULT_THEME_TOKENS.font.size,
  axisLabel: DEFAULT_THEME_TOKENS.font.axisLabelSize,
  axisName: DEFAULT_THEME_TOKENS.font.size,
  tooltip: DEFAULT_THEME_TOKENS.font.size,
  dataLabel: DEFAULT_THEME_TOKENS.font.size,
} as const;
export const TEXT_COLOR = {
  primary: DEFAULT_THEME_TOKENS.font.color,
  secondary: DEFAULT_THEME_TOKENS.font.secondaryColor,
  tertiary: DEFAULT_THEME_TOKENS.font.tertiaryColor,
  inverse: '#fff',
} as const;
export const COLOR_PALETTE = [
  '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4',
] as const;
export const SPACING = { gridLeft: 60, gridRight: 80, gridTop: 60, gridBottom: 60 } as const;
export const SHADOW = { tooltip: '0 4px 12px rgba(0,0,0,0.1)' } as const;
export const BORDER = { tooltip: DEFAULT_THEME_TOKENS.border.tooltipBorderColor } as const;
