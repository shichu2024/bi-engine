import type { TableComponent } from '../../schema/bi-engine-models';

/** 可排序+可筛选表格 — 演示排序图标、筛选漏斗图标 */
export const tableSortFilter: TableComponent = {
  type: 'table',
  id: 'table-sort-filter',
  dataProperties: {
    dataType: 'static',
    title: '学生成绩表（排序 & 筛选）',
    columns: [
      { title: '姓名', key: 'name', filterable: true },
      { title: '语文', key: 'chinese', type: 'int' as const, sortable: true },
      { title: '数学', key: 'math', type: 'int' as const, sortable: true },
      { title: '英语', key: 'english', type: 'int' as const, sortable: true },
      { title: '总分', key: 'total', type: 'int' as const, sortable: true, filterable: true },
    ],
    data: [
      { name: '张三', chinese: 90, math: 85, english: 88, total: 263 },
      { name: '李四', chinese: 78, math: 95, english: 82, total: 255 },
      { name: '王五', chinese: 85, math: 72, english: 91, total: 248 },
      { name: '赵六', chinese: 92, math: 88, english: 76, total: 256 },
      { name: '钱七', chinese: 88, math: 90, english: 85, total: 263 },
      { name: '孙八', chinese: 76, math: 82, english: 94, total: 252 },
    ],
  },
  basicProperties: {
    showColumnManager: true,
  } as Record<string, unknown>,
};
