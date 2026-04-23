import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 条形图夹具（subType 为 'horizontal' 的柱图）。
 *
 * 渲染一个水平条形图，展示不同类别的评分。
 */
export const barHorizontalFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-bar-horizontal',
  dataProperties: {
    dataType: 'static',
    title: 'Department Performance Scores',
    columns: [
      { title: 'Department', key: 'department', type: FieldType.string },
      { title: 'Score', key: 'score', type: FieldType.double },
    ],
    data: [
      { department: 'Engineering', score: 92 },
      { department: 'Design', score: 85 },
      { department: 'Marketing', score: 78 },
      { department: 'Sales', score: 88 },
      { department: 'Support', score: 82 },
    ],
    series: [
      {
        type: 'bar',
        subType: 'horizontal',
        name: 'Score',
        encode: { x: 'score', y: 'department' },
      },
    ],
  },
  xAxis: { type: 'value', name: 'Score' },
  yAxis: { type: 'category', name: 'Department' },
};
