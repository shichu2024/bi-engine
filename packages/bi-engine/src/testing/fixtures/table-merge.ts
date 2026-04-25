import type { TableComponent } from '../../schema/bi-engine-models';

export const tableMerge: TableComponent = {
  type: 'table',
  id: 'table-merge',
  dataProperties: {
    dataType: 'static',
    title: '合并单元格表格',
    columns: [
      { title: '部门', key: 'department' },
      { title: '姓名', key: 'name' },
      { title: '职位', key: 'position' },
      { title: '工龄(年)', key: 'years', type: 'int' as const },
    ],
    data: [
      { department: '技术部', name: '张三', position: '高级工程师', years: 5 },
      { department: '技术部', name: '李四', position: '工程师', years: 3 },
      { department: '技术部', name: '王五', position: '实习生', years: 1 },
      { department: '产品部', name: '赵六', position: '产品经理', years: 4 },
      { department: '产品部', name: '钱七', position: '产品助理', years: 2 },
    ],
    hasMerge: true,
    mergeRows: [
      { startRowIndex: 0, rowSpan: 3, columnKey: 'department' },
      { startRowIndex: 3, rowSpan: 2, columnKey: 'department' },
    ],
  },
};
