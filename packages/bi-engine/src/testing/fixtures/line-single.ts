import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 单线图夹具。
 *
 * 渲染一个基础折线图，展示 6 个月的月度销售数据。
 */
export const lineSingleFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-line-single',
  dataProperties: {
    dataType: 'static',
    title: 'Monthly Sales Trend',
    columns: [
      { title: 'Month', key: 'month', type: FieldType.string },
      { title: 'Sales', key: 'sales', type: FieldType.double },
    ],
    data: [
      { month: 'Jan', sales: 820 },
      { month: 'Feb', sales: 932 },
      { month: 'Mar', sales: 901 },
      { month: 'Apr', sales: 1290 },
      { month: 'May', sales: 1330 },
      { month: 'Jun', sales: 1320 },
    ],
    series: [
      {
        type: 'line',
        name: 'Sales',
        encode: { x: 'month', y: 'sales' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Month' },
  yAxis: { type: 'value', name: 'Amount' },
};
