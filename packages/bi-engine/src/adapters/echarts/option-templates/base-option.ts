// ============================================================================
// option-templates/base-option.ts — 全局标准化基础 Option 模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';

// ---------------------------------------------------------------------------
// 设计令牌（Design Tokens）
// ---------------------------------------------------------------------------

/** 标准字体族 */
const FONT_FAMILY = [
  '-apple-system',
  'BlinkMacSystemFont',
  "'Segoe UI'",
  'Roboto',
  "'Helvetica Neue'",
  'Arial',
  'sans-serif',
].join(', ');

/** 字号分级 */
const FONT_SIZE = {
  title: 14,
  subtitle: 12,
  legend: 12,
  axisLabel: 12,
  axisName: 12,
  tooltip: 12,
  dataLabel: 12,
} as const;

/** 文字颜色 */
const TEXT_COLOR = {
  primary: '#333',
  secondary: '#666',
  tertiary: '#999',
  inverse: '#fff',
} as const;

/** 标准色板（8 色，低饱和度） */
const COLOR_PALETTE = [
  '#5470C6',
  '#91CC75',
  '#FAC858',
  '#EE6666',
  '#73C0DE',
  '#3BA272',
  '#FC8452',
  '#9A60B4',
] as const;

/** 间距 */
const SPACING = {
  gridLeft: 60,
  gridRight: 80,
  gridTop: 60,
  gridBottom: 60,
} as const;

/** 阴影 */
const SHADOW = {
  tooltip: '0 4px 12px rgba(0,0,0,0.1)',
} as const;

/** 边框 */
const BORDER = {
  tooltip: '#e0e0e0',
} as const;

// ---------------------------------------------------------------------------
// getBaseOption — 全局标准化基础 Option
// ---------------------------------------------------------------------------

/**
 * 返回全局标准化的 ECharts 基础 Option 配置。
 *
 * 所有图表类型的标准化模板均以此为基础，保证视觉一致性。
 * 消费者可通过深度合并工具覆盖任意配置项。
 */
export function getBaseOption(): EChartsOption {
  return {
    // 标准色板
    color: [...COLOR_PALETTE],

    // 全局字体
    textStyle: {
      fontFamily: FONT_FAMILY,
      fontSize: FONT_SIZE.axisLabel,
      color: TEXT_COLOR.primary,
    },

    // 标题
    title: {
      show: false,
      left: 'center',
      top: 12,
      textStyle: {
        fontSize: FONT_SIZE.title,
        fontWeight: 600,
        color: TEXT_COLOR.primary,
        fontFamily: FONT_FAMILY,
      },
      subtextStyle: {
        fontSize: FONT_SIZE.subtitle,
        color: TEXT_COLOR.secondary,
        fontFamily: FONT_FAMILY,
      },
    },

    // 提示框
    tooltip: {
      show: true,
      backgroundColor: '#fff',
      borderColor: BORDER.tooltip,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: TEXT_COLOR.primary,
        fontSize: FONT_SIZE.tooltip,
        fontFamily: FONT_FAMILY,
      },
      extraCssText: `box-shadow: ${SHADOW.tooltip};`,
      confine: true,
    },

    // 图例（含超长文本截断 + 悬浮 tooltip 显示全名）
    legend: {
      show: false,
      bottom: 0,
      left: 'center',
      orient: 'horizontal',
      itemWidth: 14,
      itemHeight: 10,
      itemGap: 16,
      textStyle: {
        fontSize: FONT_SIZE.legend,
        color: TEXT_COLOR.secondary,
        fontFamily: FONT_FAMILY,
        width: 100,
        overflow: 'truncate',
        ellipsis: '...',
      },
      icon: 'roundRect',
      type: 'scroll',
      pageIconSize: 10,
      pageTextStyle: {
        fontSize: FONT_SIZE.legend,
        color: TEXT_COLOR.tertiary,
      },
      // 悬浮时显示完整图例名称
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
      left: SPACING.gridLeft,
      right: SPACING.gridRight,
      top: SPACING.gridTop,
      bottom: SPACING.gridBottom,
      containLabel: true,
    },

    // 动画
    animation: true,
    animationDuration: 600,
    animationEasing: 'cubicOut',
  };
}

// ---------------------------------------------------------------------------
// 导出设计令牌（供高级用户自定义时参考）
// ---------------------------------------------------------------------------

export {
  FONT_FAMILY,
  FONT_SIZE,
  TEXT_COLOR,
  COLOR_PALETTE,
  SPACING,
  SHADOW,
  BORDER,
};

// ---------------------------------------------------------------------------
// getCartesianAxisDefaults — 笛卡尔坐标系坐标轴默认样式
// ---------------------------------------------------------------------------

/**
 * 返回笛卡尔坐标系图表（line/bar/scatter/candlestick）的坐标轴标准化样式。
 *
 * 非笛卡尔图表（pie/radar/gauge）不应使用此函数。
 */
export function getCartesianAxisDefaults(): {
  xAxis: Record<string, unknown>;
  yAxis: Record<string, unknown>;
} {
  return {
    xAxis: {
      axisLine: {
        lineStyle: {
          color: '#ccc',
        },
      },
      axisTick: {
        lineStyle: {
          color: '#ccc',
        },
      },
      axisLabel: {
        fontSize: FONT_SIZE.axisLabel,
        color: TEXT_COLOR.secondary,
        fontFamily: FONT_FAMILY,
        width: 80,
        overflow: 'truncate',
        ellipsis: '...',
        // 截断标签悬浮时显示完整文本
        tooltip: {
          show: true,
        },
      },
      axisName: {
        fontSize: FONT_SIZE.axisName,
        color: TEXT_COLOR.secondary,
        fontFamily: FONT_FAMILY,
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
        fontSize: FONT_SIZE.axisLabel,
        color: TEXT_COLOR.secondary,
        fontFamily: FONT_FAMILY,
        width: 60,
        overflow: 'truncate',
        ellipsis: '...',
        tooltip: {
          show: true,
        },
      },
      axisName: {
        fontSize: FONT_SIZE.axisName,
        color: TEXT_COLOR.secondary,
        fontFamily: FONT_FAMILY,
        width: 60,
        overflow: 'truncate',
        ellipsis: '...',
        tooltip: {
          show: true,
        },
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },
  };
}
