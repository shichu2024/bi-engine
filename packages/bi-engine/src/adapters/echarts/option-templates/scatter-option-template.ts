// ============================================================================
// option-templates/scatter-option-template.ts — 散点图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';

/**
 * 返回散点图的标准化 Option 模板。
 *
 * 继承全局基础配置，补充散点图特有默认值：
 * - 默认符号大小（symbolSize: 10）
 * - 双轴均为数值轴
 */
export function getScatterOptionTemplate(): EChartsOption {
  return {
    ...getBaseOption(),

    tooltip: {
      ...getBaseOption().tooltip,
      trigger: 'item',
    },

    legend: {
      ...getBaseOption().legend,
    },

    xAxis: {
      ...getCartesianAxisDefaults().xAxis,
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed',
        },
      },
    },

    yAxis: {
      ...getCartesianAxisDefaults().yAxis,
      type: 'value',
    },

    series: [{
      type: 'scatter',
      symbolSize: 10,
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff',
        },
      },
    }],
  };
}
