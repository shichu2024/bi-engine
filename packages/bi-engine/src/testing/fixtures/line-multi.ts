import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 多线图夹具（双系列）。
 *
 * 渲染一个包含两条折线系列的图表，比较 7 个月的收入和成本。
 */
export const lineMultiFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-line-multi',
  dataProperties: {
    dataType: 'static',
    title: 'Revenue vs Cost',
    columns: [
      { title: 'Month', key: 'month', type: FieldType.string },
      { title: 'Revenue', key: 'revenue', type: FieldType.double },
      { title: 'Cost', key: 'cost', type: FieldType.double },
    ],
    data: [
      { month: 'Jan', revenue: 1200, cost: 800 },
      { month: 'Feb', revenue: 1500, cost: 900 },
      { month: 'Mar', revenue: 1350, cost: 850 },
      { month: 'Apr', revenue: 1800, cost: 1000 },
      { month: 'May', revenue: 2100, cost: 1100 },
      { month: 'Jun', revenue: 1950, cost: 1050 },
      { month: 'Jul', revenue: 2300, cost: 1200 },
    ],
    series: [
      {
        type: 'line',
        name: 'Revenue',
        encode: { x: 'month', y: 'revenue' },
      },
      {
        type: 'line',
        name: 'Cost',
        encode: { x: 'month', y: 'cost' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Month' },
  yAxis: { type: 'value', name: 'Amount (USD)' },
};
