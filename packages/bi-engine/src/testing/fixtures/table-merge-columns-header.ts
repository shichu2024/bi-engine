import type { TableComponent } from '../../schema/bi-engine-models';

/** 表头合并场景：isMergeValue=false，仅合并表头，表体分列 */
export const tableMergeColumnsHeader: TableComponent = {
  type: 'table',
  id: 'table-merge-columns-header',
  dataProperties: {
    dataType: 'static',
    title: '学生成绩表（表头合并）',
    columns: [
      { title: '姓名', key: 'name' },
      { title: '语文', key: 'chinese', type: 'int' as const },
      { title: '数学', key: 'math', type: 'int' as const },
      { title: '英语', key: 'english', type: 'int' as const },
      { title: '物理', key: 'physics', type: 'int' as const },
      { title: '化学', key: 'chemistry', type: 'int' as const },
    ],
    data: [
      { name: '张三', chinese: 90, math: 85, english: 92, physics: 78, chemistry: 88 },
      { name: '李四', chinese: 88, math: 95, english: 85, physics: 90, chemistry: 82 },
      { name: '王五', chinese: 75, math: 80, english: 70, physics: 85, chemistry: 90 },
    ],
    mergeColumns: [
      { title: '文科', columns: ['chinese', 'english'], isMergeValue: false },
      { title: '理科', columns: ['math', 'physics', 'chemistry'], isMergeValue: false },
    ],
  },
};
