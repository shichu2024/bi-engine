import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 多面积图夹具（2 系列面积）。
 *
 * 渲染一个包含两条面积线的图表，展示桌面端和移动端 6 个月的流量对比。
 */
export const lineAreaMultiFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-line-area-multi',
  dataProperties: {
    dataType: 'static',
    title: 'Desktop vs Mobile Traffic',
    columns: [
      { title: 'Month', key: 'month', type: FieldType.string },
      { title: 'Desktop', key: 'desktop', type: FieldType.double },
      { title: 'Mobile', key: 'mobile', type: FieldType.double },
    ],
    data: [
      { month: 'Jan', desktop: 3200, mobile: 2100 },
      { month: 'Feb', desktop: 3500, mobile: 2500 },
      { month: 'Mar', desktop: 3800, mobile: 2900 },
      { month: 'Apr', desktop: 4100, mobile: 3300 },
      { month: 'May', desktop: 3900, mobile: 3600 },
      { month: 'Jun', desktop: 4500, mobile: 4000 },
    ],
    series: [
      {
        type: 'line',
        subType: 'area',
        name: 'Desktop',
        encode: { x: 'month', y: 'desktop' },
      },
      {
        type: 'line',
        subType: 'area',
        name: 'Mobile',
        encode: { x: 'month', y: 'mobile' },
      },
    ],
  },
  xAxis: { type: 'category', name: 'Month' },
  yAxis: { type: 'value', name: 'Visits' },
};
