import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 多柱图夹具（分组柱图）。
 *
 * 渲染一个分组柱状图，比较两条产品线在 5 个区域的销售情况。
 */
export const barMultiFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-bar-multi',
  dataProperties: {
    dataType: 'static',
    title: 'Product Sales by Region',
    columns: [
      { title: 'Region', key: 'region', type: FieldType.string },
      { title: 'Product A', key: 'productA', type: FieldType.double },
      { title: 'Product B', key: 'productB', type: FieldType.double },
    ],
    data: [
      { region: 'North', productA: 320, productB: 220 },
      { region: 'South', productA: 280, productB: 310 },
      { region: 'East', productA: 350, productB: 260 },
      { region: 'West', productA: 410, productB: 380 },
      { region: 'Central', productA: 290, productB: 340 },
    ],
    series: [
      {
        type: 'bar',
        name: 'Product A',
        encode: { x: 'region', y: 'productA' },
      },
      {
        type: 'bar',
        name: 'Product B',
        encode: { x: 'region', y: 'productB' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Region' },
  yAxis: { type: 'value', name: 'Units Sold' },
};
