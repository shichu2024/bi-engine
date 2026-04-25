import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 仪表盘夹具。
 *
 * 渲染一个基础仪表盘，展示项目完成率。
 */
export const gaugeBasicFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-gauge-basic',
  dataProperties: {
    dataType: 'static',
    title: '项目完成率',
    columns: [
      { title: '指标', key: 'metric', type: FieldType.string },
      { title: '完成率', key: 'value', type: FieldType.double },
    ],
    data: [
      { metric: '完成率', value: 72 },
    ],
    series: [
      {
        type: 'gauge',
        name: '完成率',
        encode: { value: 'value' },
        config: { min: 0, max: 100, unit: '%' },
      },
    ],
  },
};
