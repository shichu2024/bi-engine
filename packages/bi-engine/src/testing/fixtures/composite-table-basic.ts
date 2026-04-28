import type { CompositeTable } from '../../schema/bi-engine-models';

/** 组合表格基础 fixture：2 个子表格，含主标题和子表格标题 */
export const compositeTableBasic: CompositeTable = {
  type: 'compositeTable',
  id: 'composite-table-basic',
  dataProperties: {
    dataType: 'static',
    title: '2024年度部门绩效汇总',
  },
  tables: [
    {
      type: 'table',
      id: 'sub-table-sales',
      dataProperties: {
        dataType: 'static',
        title: '销售部',
        columns: [
          { title: '姓名', key: 'name' },
          { title: '职位', key: 'position' },
          { title: '业绩(万)', key: 'performance', type: 'int' as const },
        ],
        data: [
          { name: '张伟', position: '销售总监', performance: 520 },
          { name: '李娜', position: '高级销售', performance: 380 },
          { name: '王强', position: '销售代表', performance: 210 },
        ],
      },
    },
    {
      type: 'table',
      id: 'sub-table-tech',
      dataProperties: {
        dataType: 'static',
        title: '技术部',
        columns: [
          { title: '姓名', key: 'name' },
          { title: '职位', key: 'position' },
          { title: '项目数', key: 'projects', type: 'int' as const },
        ],
        data: [
          { name: '赵敏', position: '技术经理', projects: 8 },
          { name: '陈浩', position: '高级工程师', projects: 12 },
        ],
      },
    },
  ],
};
