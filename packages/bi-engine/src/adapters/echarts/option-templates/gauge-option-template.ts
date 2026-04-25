// ============================================================================
// option-templates/gauge-option-template.ts — 仪表盘标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import { getBaseOption, FONT_SIZE, TEXT_COLOR, FONT_FAMILY, COLOR_PALETTE } from './base-option';

/**
 * 返回仪表盘的标准化 Option 模板。
 *
 * 继承全局基础配置，补充仪表盘特有默认值：
 * - 指针样式
 * - 轴线配色
 * - 详情文本样式
 */
export function getGaugeOptionTemplate(): EChartsOption {
  return {
    ...getBaseOption(),

    tooltip: {
      ...getBaseOption().tooltip,
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
          color: '#fff',
          width: 1,
        },
      },
      splitLine: {
        distance: -16,
        length: 16,
        lineStyle: {
          color: '#fff',
          width: 2,
        },
      },
      axisLabel: {
        color: TEXT_COLOR.tertiary,
        distance: 24,
        fontSize: FONT_SIZE.axisLabel - 2,
        fontFamily: FONT_FAMILY,
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}',
        fontSize: FONT_SIZE.title + 8,
        fontWeight: 600,
        color: TEXT_COLOR.primary,
        fontFamily: FONT_FAMILY,
        offsetCenter: [0, '40%'],
      },
      title: {
        offsetCenter: [0, '60%'],
        fontSize: FONT_SIZE.subtitle,
        color: TEXT_COLOR.tertiary,
        fontFamily: FONT_FAMILY,
      },
      data: [],
    }],
  };
}
