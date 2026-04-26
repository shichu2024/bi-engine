import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * axisGroup 单字段分组柱图夹具。
 *
 * 原始窄表数据通过 axisGroup=['region'] 自动透视为宽表，
 * 动态生成多系列柱状图。
 */
export const barAxisGroupFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-bar-axis-group',
  dataProperties: {
    dataType: 'static',
    title: '季度销售额（按区域分组）',
    columns: [
      { title: '季度', key: 'quarter', type: FieldType.string },
      { title: '销售额', key: 'sales', type: FieldType.double },
      { title: '区域', key: 'region', type: FieldType.string },
    ],
    data: [
      { quarter: 'Q1', sales: 320, region: 'North' },
      { quarter: 'Q1', sales: 280, region: 'South' },
      { quarter: 'Q1', sales: 350, region: 'East' },
      { quarter: 'Q2', sales: 380, region: 'North' },
      { quarter: 'Q2', sales: 310, region: 'South' },
      { quarter: 'Q2', sales: 420, region: 'East' },
      { quarter: 'Q3', sales: 450, region: 'North' },
      { quarter: 'Q3', sales: 390, region: 'South' },
      { quarter: 'Q3', sales: 480, region: 'East' },
    ],
    series: [
      {
        type: 'bar',
        name: 'Sales',
        encode: { x: 'quarter', y: 'sales' },
      },
    ],
    axisGroup: ['region'],
  },
  xAxis: { type: 'category', name: 'Quarter' },
  yAxis: { type: 'value', name: 'Sales (K)' },
};
