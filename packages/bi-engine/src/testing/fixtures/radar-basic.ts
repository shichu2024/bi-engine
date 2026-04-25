import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 雷达图夹具。
 *
 * 渲染一个基础雷达图，展示产品在多个维度上的评分。
 * 数据中的 values 字段是一个数组，每个元素对应一个雷达维度。
 */
export const radarBasicFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-radar-basic',
  dataProperties: {
    dataType: 'static',
    title: '产品能力评估',
    columns: [
      { title: '产品', key: 'product', type: FieldType.string },
      { title: '能力值', key: 'values', type: FieldType.double },
    ],
    data: [
      {
        product: '产品 A',
        values: [90, 80, 85, 75],
      },
    ],
    series: [
      {
        type: 'radar',
        name: '产品 A',
        encode: { name: 'product', value: 'values' },
      },
    ],
  },
  options: {
    eChartOption: {
      radar: {
        indicator: [
          { name: '性能', max: 100 },
          { name: '易用性', max: 100 },
          { name: '安全性', max: 100 },
          { name: '可扩展性', max: 100 },
        ],
      },
    },
  },
};
