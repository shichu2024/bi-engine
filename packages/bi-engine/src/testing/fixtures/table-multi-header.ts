import type { TableComponent } from '../../schema/bi-engine-models';

export const tableMultiHeader: TableComponent = {
  type: 'table',
  id: 'table-multi-header',
  dataProperties: {
    dataType: 'static',
    title: '多级表头',
    columns: [
      { title: '基本信息', key: '_info', children: [
        { title: '姓名', key: 'name' },
        { title: '年龄', key: 'age' },
      ]},
      { title: '成绩', key: '_scores', children: [
        { title: '语文', key: 'chinese' },
        { title: '数学', key: 'math' },
        { title: '英语', key: 'english' },
      ]},
    ],
    data: [
      { name: '张三', age: 18, chinese: 90, math: 85, english: 92 },
      { name: '李四', age: 19, chinese: 88, math: 95, english: 87 },
    ],
  },
};
