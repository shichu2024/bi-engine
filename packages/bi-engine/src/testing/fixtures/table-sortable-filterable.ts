import type { TableComponent } from '../../schema/bi-engine-models';

export const tableSortable: TableComponent = {
  type: 'table',
  id: 'table-sortable',
  dataProperties: {
    dataType: 'static',
    title: '可排序表格',
    columns: [
      { title: '姓名', key: 'name' },
      { title: '年龄', key: 'age', type: 'int' as const },
      { title: '成绩', key: 'score', type: 'double' as const },
      { title: '城市', key: 'city' },
    ],
    data: [
      { name: '张三', age: 22, score: 89.5, city: '北京' },
      { name: '李四', age: 20, score: 95.0, city: '上海' },
      { name: '王五', age: 24, score: 78.3, city: '广州' },
      { name: '赵六', age: 21, score: 92.1, city: '深圳' },
      { name: '钱七', age: 23, score: 85.7, city: '杭州' },
    ],
  },
};
