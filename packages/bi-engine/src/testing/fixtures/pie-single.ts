import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 单饼图夹具。
 *
 * 渲染一个饼图，展示 5 个细分市场的市场份额分布。
 */
export const pieSingleFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-pie-single',
  dataProperties: {
    dataType: 'static',
    title: 'Market Share',
    columns: [
      { title: 'Segment', key: 'segment', type: FieldType.string },
      { title: 'Share', key: 'share', type: FieldType.double },
    ],
    data: [
      { segment: 'Segment A', share: 35 },
      { segment: 'Segment B', share: 25 },
      { segment: 'Segment C', share: 20 },
      { segment: 'Segment D', share: 12 },
      { segment: 'Others', share: 8 },
    ],
    series: [
      {
        type: 'pie',
        name: 'Market Share',
        encode: { name: 'segment', value: 'share' },
      },
    ],
  },
};
