// ============================================================================
// option-templates/bar-option-template.ts — 柱状图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';

/**
 * 返回柱状图/条形图的标准化 Option 模板。
 *
 * 继承全局基础配置，补充柱状图特有默认值：
 * - 柱宽自适应（barMaxWidth: 40）
 * - 统一圆角（borderRadius: 4）
 * - 堆叠/分组间距规则
 */
export function getBarOptionTemplate(): EChartsOption {
  return {
    ...getBaseOption(),

    tooltip: {
      ...getBaseOption().tooltip,
      trigger: 'axis',
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
    },

    // 柱状图系列默认配置
    series: [{
      type: 'bar',
      barMaxWidth: 40,
      barMinHeight: 2,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        focus: 'series',
      },
    }],
  };
}
