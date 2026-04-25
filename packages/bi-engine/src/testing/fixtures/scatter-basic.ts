import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 散点图夹具。
 *
 * 渲染一个基础散点图，展示广告支出与销售额的相关关系。
 */
export const scatterBasicFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-scatter-basic',
  dataProperties: {
    dataType: 'static',
    title: '广告支出 vs 销售额',
    columns: [
      { title: '广告支出', key: 'adSpend', type: FieldType.double },
      { title: '销售额', key: 'sales', type: FieldType.double },
    ],
    data: [
      { adSpend: 10, sales: 28 },
      { adSpend: 15, sales: 35 },
      { adSpend: 20, sales: 42 },
      { adSpend: 25, sales: 51 },
      { adSpend: 30, sales: 58 },
      { adSpend: 35, sales: 65 },
    ],
    series: [
      {
        type: 'scatter',
        name: '销售数据',
        encode: { x: 'adSpend', y: 'sales' },
      },
    ],
  },
  xAxis: { type: 'value', name: '广告支出 (万元)' },
  yAxis: { type: 'value', name: '销售额 (万元)' },
};
