import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 混合柱线图夹具（柱状 + 折线）。
 *
 * 渲染一个混合图表，柱状图展示月度销售额，折线图展示毛利率趋势。
 */
export const comboBarLineFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-combo-bar-line',
  dataProperties: {
    dataType: 'static',
    title: 'Sales Revenue vs Margin',
    columns: [
      { title: 'Month', key: 'month', type: FieldType.string },
      { title: 'Revenue', key: 'revenue', type: FieldType.double },
      { title: 'Margin', key: 'margin', type: FieldType.double },
    ],
    data: [
      { month: 'Jan', revenue: 120, margin: 22 },
      { month: 'Feb', revenue: 150, margin: 25 },
      { month: 'Mar', revenue: 135, margin: 20 },
      { month: 'Apr', revenue: 180, margin: 28 },
      { month: 'May', revenue: 210, margin: 30 },
      { month: 'Jun', revenue: 195, margin: 26 },
    ],
    series: [
      {
        type: 'bar',
        name: 'Revenue',
        encode: { x: 'month', y: 'revenue' },
      },
      {
        type: 'line',
        name: 'Margin %',
        encode: { x: 'month', y: 'margin' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Month' },
  yAxis: { type: 'value', name: 'Amount' },
};
