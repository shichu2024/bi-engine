// ============================================================================
// locale/en-US.ts — 英文词条包
// ============================================================================

import type { BILocale } from './types';

export const enUS: BILocale = {
  chart: {
    type: {
      bar: 'Bar',
      line: 'Line',
      area: 'Area',
      table: 'Table',
      pie: 'Pie',
      scatter: 'Scatter',
      radar: 'Radar',
      gauge: 'Gauge',
      candlestick: 'Candlestick',
    },
  },
  table: {
    filter: {
      title: 'Filter {column}',
      placeholder: 'Enter keyword, press Enter',
      confirm: 'OK',
    },
    columnManager: {
      title: 'Column Manager',
      available: 'Available',
      selected: 'Selected',
      emptyAvailable: 'No columns available',
      emptySelected: 'No columns selected',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
    pagination: {
      total: '{count} items',
      pageSize: '{size} / page',
    },
    empty: {
      noVisibleColumns: 'No visible columns',
      noData: 'No data',
    },
    noColumnsDefined: 'No columns defined.',
  },
  design: {
    component: {
      chart: 'Chart',
      table: 'Table',
      text: 'Text',
      markdown: 'Markdown',
      compositeTable: 'Composite Table',
    },
  },
};
