import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 面积图夹具（subType 为 'area' 的折线图）。
 *
 * 渲染一个面积系列，展示 6 周的网站流量。
 */
export const lineAreaFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-line-area',
  dataProperties: {
    dataType: 'static',
    title: 'Website Traffic',
    columns: [
      { title: 'Week', key: 'week', type: FieldType.string },
      { title: 'Visitors', key: 'visitors', type: FieldType.long },
    ],
    data: [
      { week: 'W1', visitors: 1200 },
      { week: 'W2', visitors: 1800 },
      { week: 'W3', visitors: 2400 },
      { week: 'W4', visitors: 2200 },
      { week: 'W5', visitors: 3100 },
      { week: 'W6', visitors: 3500 },
    ],
    series: [
      {
        type: 'line',
        subType: 'area',
        name: 'Visitors',
        encode: { x: 'week', y: 'visitors' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Week' },
  yAxis: { type: 'value', name: 'Visitors' },
};
