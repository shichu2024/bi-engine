// ============================================================================
// locale/zh-CN.ts — 中文（简体）词条包
// ============================================================================

import type { BILocale } from './types';

export const zhCN: BILocale = {
  chart: {
    type: {
      bar: '柱状图',
      line: '折线图',
      area: '面积图',
      table: '表格',
      pie: '饼图',
      scatter: '散点图',
      radar: '雷达图',
      gauge: '仪表盘',
      candlestick: 'K线图',
    },
  },
  table: {
    filter: {
      title: '筛选 {column}',
      placeholder: '输入筛选关键词，回车确认',
      confirm: '确定',
    },
    columnManager: {
      title: '列管理',
      available: '可选列',
      selected: '已选列',
      emptyAvailable: '暂无可选列',
      emptySelected: '暂无已选列',
      cancel: '取消',
      confirm: '确认',
    },
    pagination: {
      total: '共 {count} 条',
      pageSize: '{size} 条/页',
    },
    empty: {
      noVisibleColumns: '暂无可见列',
      noData: '暂无数据',
    },
    noColumnsDefined: '未定义列。',
  },
  design: {
    component: {
      chart: '图表',
      table: '表格',
      text: '文本',
      markdown: 'Markdown',
      compositeTable: '组合表格',
    },
  },
};
