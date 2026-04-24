import type { TableComponent } from '../../schema/bi-engine-models';

export const tableBasic: TableComponent = {
  type: 'table',
  id: 'table-basic',
  dataProperties: {
    dataType: 'static',
    title: '销售数据',
    columns: [
      { title: '月份', key: 'month' },
      { title: '销售额', key: 'sales' },
      { title: '同比增长', key: 'growth' },
    ],
    data: [
      { month: '1月', sales: 1200, growth: '12%' },
      { month: '2月', sales: 1500, growth: '25%' },
      { month: '3月', sales: 1800, growth: '20%' },
    ],
  },
};
