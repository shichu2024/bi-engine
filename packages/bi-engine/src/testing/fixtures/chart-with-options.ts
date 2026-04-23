import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 带 ChartOption 的折线图夹具。
 *
 * 渲染一个带有自定义 ChartOption 的折线图，包括 eChartOption 覆盖
 * 和 centerText 配置。
 */
export const lineWithOptionsFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-line-with-options',
  dataProperties: {
    dataType: 'static',
    title: 'Temperature Trend with Options',
    columns: [
      { title: 'Day', key: 'day', type: FieldType.string },
      { title: 'Temperature', key: 'temp', type: FieldType.double },
    ],
    data: [
      { day: 'Mon', temp: 11 },
      { day: 'Tue', temp: 14 },
      { day: 'Wed', temp: 12 },
      { day: 'Thu', temp: 16 },
      { day: 'Fri', temp: 18 },
      { day: 'Sat', temp: 22 },
      { day: 'Sun', temp: 20 },
    ],
    series: [
      {
        type: 'line',
        name: 'Temperature',
        encode: { x: 'day', y: 'temp' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Day of Week' },
  yAxis: { type: 'value', name: 'Temperature (C)' },
  options: {
    eChartOption: {
      grid: {
        left: '10%',
        right: '5%',
        bottom: '10%',
      },
    },
  },
};
