// ============================================================================
// option-templates/pie-option-template.ts — 饼图标准化模板
// ============================================================================

import type { EChartsOption } from '../build-line-option';
import { getBaseOption, FONT_SIZE, TEXT_COLOR, FONT_FAMILY } from './base-option';

/**
 * 返回饼图的标准化 Option 模板。
 *
 * 继承全局基础配置，补充饼图特有默认值：
 * - 防止标签溢出（avoidLabelOverlap: true）
 * - 标签引导线规范
 * - 百分比显示规范
 * - 图例统一在右侧（距右侧 10%）
 * - 图例超长文本截断 + 悬浮 tooltip 显示全名
 */
export function getPieOptionTemplate(): EChartsOption {
  return {
    ...getBaseOption(),

    tooltip: {
      ...getBaseOption().tooltip,
      trigger: 'item',
    },

    // 饼图/环形图图例统一在右侧，垂直排列，距右侧 10%
    legend: {
      ...getBaseOption().legend,
      orient: 'vertical',
      right: '10%',
      left: 'auto',
      top: 'middle',
      bottom: 'auto',
      // 图例悬浮 tooltip：显示完整名称（当文本被截断时）
      tooltip: {
        show: true,
      },
    },

    // 饼图系列默认配置
    series: [{
      type: 'pie',
      avoidLabelOverlap: true,
      center: ['40%', '50%'],
      radius: '70%',
      label: {
        fontSize: FONT_SIZE.dataLabel,
        color: TEXT_COLOR.secondary,
        fontFamily: FONT_FAMILY,
        formatter: '{b}: {d}%',
      },
      labelLine: {
        length: 16,
        length2: 12,
        smooth: true,
        lineStyle: {
          color: '#ccc',
        },
      },
      emphasis: {
        label: {
          fontSize: FONT_SIZE.dataLabel + 2,
          fontWeight: 600,
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
      },
    }],
  };
}

/**
 * 环形图专用模板。
 *
 * 相比饼图：
 * - 更大内径（radius: ['50%', '75%']），留出中心文本空间
 * - 中心支持显示汇总文本（title/subtitle）
 * - 图例在右侧距 10%
 *
 * @param centerTitle - 可选的中心标题文本（如汇总数值）
 * @param centerSubtitle - 可选的中心副标题文本（如"总计"）
 */
export function getRingOptionTemplate(
  centerTitle?: string,
  centerSubtitle?: string,
): EChartsOption {
  const pieTemplate = getPieOptionTemplate();
  const series = pieTemplate.series as Record<string, unknown>[];

  // 环形图中心文本 graphic 配置
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
        fill: TEXT_COLOR.primary,
        fontFamily: FONT_FAMILY,
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
        fontSize: FONT_SIZE.subtitle,
        fill: TEXT_COLOR.tertiary,
        fontFamily: FONT_FAMILY,
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
