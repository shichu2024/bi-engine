import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * axisGroup 多字段分组折线图夹具。
 *
 * 原始窄表数据通过 axisGroup=['测试名称','测试维度'] 自动透视为宽表，
 * 动态生成多系列折线图。
 */
export const lineAxisGroupFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-line-axis-group',
  dataProperties: {
    dataType: 'static',
    title: 'CPU利用率对比（axisGroup分组）',
    columns: [
      { title: '测试时间戳', key: '测试时间戳', type: FieldType.string },
      { title: '利用率(%)', key: '利用率(%)', type: FieldType.double },
      { title: '测试名称', key: '测试名称', type: FieldType.string },
      { title: '测试维度', key: '测试维度', type: FieldType.string },
    ],
    data: [
      { '测试时间戳': '2026-02-09 07:45:00', '利用率(%)': 19, '测试名称': 'test1', '测试维度': '维度1' },
      { '测试时间戳': '2026-02-09 07:45:00', '利用率(%)': 10, '测试名称': 'test2', '测试维度': '维度2' },
      { '测试时间戳': '2026-02-09 07:46:00', '利用率(%)': 35, '测试名称': 'test1', '测试维度': '维度1' },
      { '测试时间戳': '2026-02-09 07:46:00', '利用率(%)': 22, '测试名称': 'test2', '测试维度': '维度2' },
      { '测试时间戳': '2026-02-09 07:47:00', '利用率(%)': 52, '测试名称': 'test1', '测试维度': '维度1' },
      { '测试时间戳': '2026-02-09 07:47:00', '利用率(%)': 41, '测试名称': 'test2', '测试维度': '维度2' },
    ],
    series: [
      {
        type: 'line',
        name: 'CPU',
        encode: { x: '测试时间戳', y: '利用率(%)' },
      },
    ],
    axisGroup: ['测试名称', '测试维度'],
  },
  xAxis: { type: 'category', name: '测试时间' },
  yAxis: { type: 'value', name: 'CPU利用率(%)' },
};
