// ============================================================================
// option-templates/candlestick-option-template.ts — 蜡烛图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';

/**
 * 返回蜡烛图（K 线图）的标准化 Option 模板。
 *
 * 继承全局基础配置，补充蜡烛图特有默认值：
 * - 红涨绿跌配色
 * - K 线柱体样式
 */
export function getCandlestickOptionTemplate(): EChartsOption {
  return {
    ...getBaseOption(),

    tooltip: {
      ...getBaseOption().tooltip,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },

    legend: {
      ...getBaseOption().legend,
    },

    xAxis: {
      ...getCartesianAxisDefaults().xAxis,
      type: 'category',
    },

    yAxis: {
      ...getCartesianAxisDefaults().yAxis,
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
