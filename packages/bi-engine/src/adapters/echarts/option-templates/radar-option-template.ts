// ============================================================================
// option-templates/radar-option-template.ts — 雷达图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import { getBaseOption, FONT_SIZE, TEXT_COLOR, FONT_FAMILY } from './base-option';

/**
 * 返回雷达图的标准化 Option 模板。
 *
 * 继承全局基础配置，补充雷达图特有默认值：
 * - 指示器名称样式
 * - 分隔线统一
 * - 面积半透明填充
 */
export function getRadarOptionTemplate(): EChartsOption {
  return {
    ...getBaseOption(),

    tooltip: {
      ...getBaseOption().tooltip,
      trigger: 'item',
    },

    legend: {
      ...getBaseOption().legend,
    },

    radar: {
      shape: 'polygon',
      center: ['50%', '55%'],
      radius: '65%',
      name: {
        textStyle: {
          fontSize: FONT_SIZE.axisLabel,
          color: TEXT_COLOR.secondary,
          fontFamily: FONT_FAMILY,
        },
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(84, 112, 198, 0.02)', 'rgba(84, 112, 198, 0.05)'],
        },
      },
      splitLine: {
        lineStyle: {
          color: '#e0e0e0',
        },
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0',
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
