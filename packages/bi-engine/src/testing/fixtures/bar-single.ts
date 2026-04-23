import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 单柱图夹具。
 *
 * 渲染一个基础垂直柱状图，展示 4 个季度的季度收入。
 */
export const barSingleFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-bar-single',
  dataProperties: {
    dataType: 'static',
    title: 'Quarterly Revenue',
    columns: [
      { title: 'Quarter', key: 'quarter', type: FieldType.string },
      { title: 'Revenue', key: 'revenue', type: FieldType.double },
    ],
    data: [
      { quarter: 'Q1', revenue: 45000 },
      { quarter: 'Q2', revenue: 52000 },
      { quarter: 'Q3', revenue: 48000 },
      { quarter: 'Q4', revenue: 61000 },
    ],
    series: [
      {
        type: 'bar',
        name: 'Revenue',
        encode: { x: 'quarter', y: 'revenue' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Quarter' },
  yAxis: { type: 'value', name: 'Revenue (USD)' },
};
