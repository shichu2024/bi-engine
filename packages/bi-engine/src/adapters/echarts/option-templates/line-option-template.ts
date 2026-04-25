// ============================================================================
// option-templates/line-option-template.ts — 折线图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import { getBaseOption, getCartesianAxisDefaults } from './base-option';

/**
 * 返回折线图/面积图的标准化 Option 模板。
 *
 * 继承全局基础配置，补充折线图特有默认值：
 * - 线条默认不平滑（smooth: false）
 * - 空数据断点连接（connectNulls: true）
 * - 标记点默认样式
 */
export function getLineOptionTemplate(): EChartsOption {
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
      boundaryGap: false,
    },

    yAxis: {
      ...getCartesianAxisDefaults().yAxis,
      type: 'value',
    },

    // 折线图系列默认配置
    series: [{
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      connectNulls: true,
      lineStyle: {
        width: 2,
      },
      itemStyle: {
        borderWidth: 2,
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          borderWidth: 3,
        },
      },
    }],
  };
}
