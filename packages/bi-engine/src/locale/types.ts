// ============================================================================
// locale/types.ts — 国际化类型定义
// ============================================================================

/**
 * BI Engine 国际化词条接口。
 * 所有 UI 文案都通过此接口定义键，确保编译期类型安全。
 */
export interface BILocale {
  /** 图表类型标签 */
  chart: {
    type: {
      bar: string;
      line: string;
      area: string;
      table: string;
      pie: string;
      scatter: string;
      radar: string;
      gauge: string;
      candlestick: string;
    };
  };

  /** 表格 UI 文案 */
  table: {
    /** 筛选弹窗 */
    filter: {
      title: string;       // "筛选 {column}" / "Filter {column}"
      placeholder: string; // "输入筛选关键词，回车确认" / "Enter keyword, press Enter"
      confirm: string;     // "确定" / "OK"
    };
    /** 列管理弹窗 */
    columnManager: {
      title: string;              // "列管理" / "Column Manager"
      available: string;          // "可选列" / "Available"
      selected: string;           // "已选列" / "Selected"
      emptyAvailable: string;     // "暂无可选列" / "No columns available"
      emptySelected: string;      // "暂无已选列" / "No columns selected"
      cancel: string;             // "取消" / "Cancel"
      confirm: string;            // "确认" / "Confirm"
    };
    /** 分页 */
    pagination: {
      total: string;       // "共 {count} 条" / "{count} items"
      pageSize: string;    // "{size} 条/页" / "{size} / page"
    };
    /** 空状态 */
    empty: {
      noVisibleColumns: string;  // "暂无可见列" / "No visible columns"
      noData: string;            // "暂无数据" / "No data"
    };
    /** 其他 */
    noColumnsDefined: string;    // "No columns defined."
  };

  /** 设计态组件名称 */
  design: {
    component: {
      chart: string;
      table: string;
      text: string;
      markdown: string;
      compositeTable: string;
    };
  };
}

/**
 * 支持的内置语言标识。
 */
export type BuiltInLocale = 'zh-CN' | 'en-US';

/**
 * locale prop 接受的类型：内置语言标识或自定义词条对象。
 */
export type LocaleInput = BuiltInLocale | BILocale;
