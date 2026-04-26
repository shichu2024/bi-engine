import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 堆叠柱图夹具（3 系列堆叠）。
 *
 * 渲染一个堆叠柱状图，展示 4 个季度中 Direct、Organic、Referral 三个渠道的访问量构成。
 */
export const barStackedFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-bar-stacked',
  dataProperties: {
    dataType: 'static',
    title: 'Website Traffic by Channel',
    columns: [
      { title: 'Quarter', key: 'quarter', type: FieldType.string },
      { title: 'Direct', key: 'direct', type: FieldType.double },
      { title: 'Organic', key: 'organic', type: FieldType.double },
      { title: 'Referral', key: 'referral', type: FieldType.double },
    ],
    data: [
      { quarter: 'Q1', direct: 320, organic: 280, referral: 150 },
      { quarter: 'Q2', direct: 380, organic: 350, referral: 200 },
      { quarter: 'Q3', direct: 420, organic: 410, referral: 250 },
      { quarter: 'Q4', direct: 480, organic: 450, referral: 300 },
    ],
    series: [
      {
        type: 'bar',
        name: 'Direct',
        stack: 'traffic',
        encode: { x: 'quarter', y: 'direct' },
      },
      {
        type: 'bar',
        name: 'Organic',
        stack: 'traffic',
        encode: { x: 'quarter', y: 'organic' },
      },
      {
        type: 'bar',
        name: 'Referral',
        stack: 'traffic',
        encode: { x: 'quarter', y: 'referral' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Quarter' },
  yAxis: { type: 'value', name: 'Visits' },
};
