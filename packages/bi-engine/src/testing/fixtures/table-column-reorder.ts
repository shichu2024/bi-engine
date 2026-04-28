import type { TableComponent } from '../../schema/bi-engine-models';

/** 列管理器排序演示 — 多列可拖动排序 */
const projectData = [
  { name: '智慧城市平台', status: '进行中', progress: 72, owner: '张伟', priority: '高', startDate: '2025-01-15', budget: 500000 },
  { name: '数据中台升级', status: '已完成', progress: 100, owner: '李娜', priority: '中', startDate: '2024-09-01', budget: 350000 },
  { name: '移动端重构', status: '进行中', progress: 45, owner: '王强', priority: '高', startDate: '2025-03-10', budget: 200000 },
  { name: '安全审计系统', status: '待启动', progress: 0, owner: '赵敏', priority: '低', startDate: '2025-06-01', budget: 150000 },
  { name: '用户画像V2', status: '进行中', progress: 88, owner: '陈浩', priority: '高', startDate: '2024-11-20', budget: 280000 },
  { name: 'API网关优化', status: '已完成', progress: 100, owner: '刘芳', priority: '中', startDate: '2024-07-15', budget: 120000 },
  { name: '微服务拆分', status: '进行中', progress: 33, owner: '周杰', priority: '高', startDate: '2025-02-28', budget: 420000 },
  { name: '监控告警平台', status: '已完成', progress: 100, owner: '吴婷', priority: '低', startDate: '2024-05-10', budget: 180000 },
  { name: 'CI/CD流水线', status: '进行中', progress: 60, owner: '孙磊', priority: '中', startDate: '2025-01-05', budget: 90000 },
  { name: '权限中心改造', status: '待启动', progress: 0, owner: '黄丽', priority: '高', startDate: '2025-07-01', budget: 250000 },
];

export const tableColumnReorder: TableComponent = {
  type: 'table',
  id: 'table-column-reorder',
  dataProperties: {
    dataType: 'static',
    title: '项目管理表（列管理器支持排序）',
    columns: [
      { title: '项目名称', key: 'name', filterable: true },
      { title: '状态', key: 'status', filterable: true },
      { title: '进度', key: 'progress', sortable: true },
      { title: '负责人', key: 'owner', filterable: true },
      { title: '优先级', key: 'priority', filterable: true },
      { title: '启动日期', key: 'startDate', sortable: true },
      { title: '预算', key: 'budget', sortable: true },
    ],
    data: projectData,
  },
  basicProperties: {
    showColumnManager: true,
    pagination: true,
  } as Record<string, unknown>,
};
