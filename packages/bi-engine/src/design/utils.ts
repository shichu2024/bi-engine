// ============================================================================
// design/utils.ts — 设计态工具函数
// ============================================================================

import type { BIEngineComponent, ComponentLayout } from '../schema/bi-engine-models';

/**
 * 检查组件是否在网格布局中。
 * 设计态下用于判断是否显示拖拽调整 UI。
 */
export function isGridLayout(layout: ComponentLayout | undefined): boolean {
  return layout?.type === 'grid';
}

/**
 * 检查组件是否在绝对定位布局中。
 * 设计态下用于判断是否显示位置/大小调整手柄。
 */
export function isAbsoluteLayout(layout: ComponentLayout | undefined): boolean {
  return layout?.type === 'absolute';
}

/**
 * 获取组件在设计态下的显示名称。
 */
export function getComponentDisplayName(component: BIEngineComponent): string {
  const nameMap: Record<string, string> = {
    chart: '图表',
    table: '表格',
    text: '文本',
    markdown: 'Markdown',
    compositeTable: '组合表格',
  };
  return nameMap[component.type] ?? component.type;
}

/**
 * 获取组件在设计态下的图标标识（用于组件面板）。
 */
export function getComponentIcon(component: BIEngineComponent): string {
  const iconMap: Record<string, string> = {
    chart: '📊',
    table: '📋',
    text: '📝',
    markdown: '📄',
    compositeTable: '📑',
  };
  return iconMap[component.type] ?? '📦';
}
