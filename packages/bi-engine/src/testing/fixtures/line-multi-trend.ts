import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 多折线趋势图夹具（3 系列趋势对比）。
 *
 * 渲染一个包含三条折线的图表，展示三个城市 8 个月的温度变化趋势。
 */
export const lineMultiTrendFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-line-multi-trend',
  dataProperties: {
    dataType: 'static',
    title: 'City Temperature Trends',
    columns: [
      { title: 'Month', key: 'month', type: FieldType.string },
      { title: 'Beijing', key: 'beijing', type: FieldType.double },
      { title: 'Shanghai', key: 'shanghai', type: FieldType.double },
      { title: 'Guangzhou', key: 'guangzhou', type: FieldType.double },
    ],
    data: [
      { month: 'Jan', beijing: -2, shanghai: 5, guangzhou: 14 },
      { month: 'Feb', beijing: 1, shanghai: 7, guangzhou: 16 },
      { month: 'Mar', beijing: 8, shanghai: 12, guangzhou: 20 },
      { month: 'Apr', beijing: 16, shanghai: 18, guangzhou: 24 },
      { month: 'May', beijing: 22, shanghai: 23, guangzhou: 28 },
      { month: 'Jun', beijing: 28, shanghai: 27, guangzhou: 31 },
      { month: 'Jul', beijing: 31, shanghai: 32, guangzhou: 33 },
      { month: 'Aug', beijing: 30, shanghai: 31, guangzhou: 33 },
    ],
    series: [
      {
        type: 'line',
        name: 'Beijing',
        encode: { x: 'month', y: 'beijing' },
      },
      {
        type: 'line',
        name: 'Shanghai',
        encode: { x: 'month', y: 'shanghai' },
      },
      {
        type: 'line',
        name: 'Guangzhou',
        encode: { x: 'month', y: 'guangzhou' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Month' },
  yAxis: { type: 'value', name: 'Temperature (°C)' },
};
