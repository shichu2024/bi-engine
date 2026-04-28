import type { TableComponent } from '../../schema/bi-engine-models';

/** 自定义渲染演示 — 状态标签、进度百分比、操作链接 */
const taskData = [
  { name: '首页改版', status: 'completed', progress: 100, assignee: '张伟', link: 'https://example.com/task/1' },
  { name: '接口联调', status: 'in_progress', progress: 65, assignee: '李娜', link: 'https://example.com/task/2' },
  { name: '性能优化', status: 'in_progress', progress: 40, assignee: '王强', link: 'https://example.com/task/3' },
  { name: '单元测试', status: 'pending', progress: 0, assignee: '赵敏', link: 'https://example.com/task/4' },
  { name: '文档编写', status: 'completed', progress: 100, assignee: '陈浩', link: 'https://example.com/task/5' },
  { name: '代码审查', status: 'in_progress', progress: 80, assignee: '刘芳', link: 'https://example.com/task/6' },
];

export const tableCustomRender: TableComponent = {
  type: 'table',
  id: 'table-custom-render',
  dataProperties: {
    dataType: 'static',
    title: '任务列表（自定义列渲染）',
    columns: [
      { title: '任务名称', key: 'name' },
      { title: '状态', key: 'status' },
      { title: '进度', key: 'progress', sortable: true },
      { title: '负责人', key: 'assignee' },
      { title: '链接', key: 'link' },
    ],
    data: taskData,
  },
};
