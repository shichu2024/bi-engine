import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 环形图夹具（subType 为 'ring' 的饼图）。
 *
 * 渲染一个环形/甜甜圈图，展示 4 个类别的预算分配。
 */
export const pieRingFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-pie-ring',
  dataProperties: {
    dataType: 'static',
    title: 'Budget Allocation',
    columns: [
      { title: 'Category', key: 'category', type: FieldType.string },
      { title: 'Amount', key: 'amount', type: FieldType.double },
    ],
    data: [
      { category: 'Development', amount: 40000 },
      { category: 'Marketing', amount: 25000 },
      { category: 'Operations', amount: 20000 },
      { category: 'Research', amount: 15000 },
    ],
    series: [
      {
        type: 'pie',
        subType: 'ring',
        name: 'Budget',
        encode: { name: 'category', value: 'amount' },
      },
    ],
  },
  options: {
    centerText: 'Total',
    subCenterText: '$100K',
  },
};
