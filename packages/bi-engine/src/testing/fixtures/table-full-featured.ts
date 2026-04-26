import type { TableComponent } from '../../schema/bi-engine-models';

/** 员工数据 — 用于演示分页、排序、筛选、列管理 */
const employeeData = [
  { name: '张伟', department: '技术部', position: '高级工程师', age: 32, salary: 28000, city: '北京', joinDate: '2019-03-15' },
  { name: '李娜', department: '产品部', position: '产品经理', age: 28, salary: 25000, city: '上海', joinDate: '2020-06-01' },
  { name: '王强', department: '技术部', position: '前端工程师', age: 26, salary: 22000, city: '深圳', joinDate: '2021-01-10' },
  { name: '赵敏', department: '设计部', position: 'UI设计师', age: 25, salary: 20000, city: '杭州', joinDate: '2021-07-20' },
  { name: '陈浩', department: '技术部', position: '后端工程师', age: 30, salary: 26000, city: '北京', joinDate: '2019-11-05' },
  { name: '刘芳', department: '市场部', position: '市场经理', age: 35, salary: 30000, city: '广州', joinDate: '2018-04-12' },
  { name: '周杰', department: '技术部', position: '架构师', age: 38, salary: 40000, city: '北京', joinDate: '2017-02-28' },
  { name: '吴婷', department: '产品部', position: '产品助理', age: 24, salary: 15000, city: '上海', joinDate: '2022-03-15' },
  { name: '孙磊', department: '设计部', position: '交互设计师', age: 29, salary: 23000, city: '深圳', joinDate: '2020-09-01' },
  { name: '黄丽', department: '市场部', position: '运营专员', age: 27, salary: 18000, city: '广州', joinDate: '2021-05-18' },
  { name: '杨帆', department: '技术部', position: '测试工程师', age: 28, salary: 21000, city: '杭州', joinDate: '2021-02-20' },
  { name: '朱琳', department: '产品部', position: '产品总监', age: 36, salary: 35000, city: '北京', joinDate: '2018-08-10' },
  { name: '马超', department: '技术部', position: 'DevOps', age: 31, salary: 27000, city: '上海', joinDate: '2020-01-15' },
  { name: '郭静', department: '设计部', position: '设计总监', age: 34, salary: 32000, city: '深圳', joinDate: '2018-12-01' },
  { name: '林峰', department: '市场部', position: '品牌经理', age: 33, salary: 28000, city: '广州', joinDate: '2019-06-20' },
  { name: '何薇', department: '技术部', position: '数据工程师', age: 29, salary: 25000, city: '杭州', joinDate: '2020-11-08' },
  { name: '罗斌', department: '产品部', position: '产品经理', age: 30, salary: 26000, city: '北京', joinDate: '2020-04-22' },
  { name: '谢颖', department: '设计部', position: '视觉设计师', age: 26, salary: 19000, city: '上海', joinDate: '2022-01-10' },
];

export const tableFullFeatured: TableComponent = {
  type: 'table',
  id: 'table-full-featured',
  dataProperties: {
    dataType: 'static',
    title: '员工信息表',
    columns: [
      { title: '姓名', key: 'name', filterable: true },
      { title: '部门', key: 'department', filterable: true },
      { title: '职位', key: 'position', filterable: true },
      { title: '年龄', key: 'age', type: 'int' as const, sortable: true },
      { title: '月薪', key: 'salary', type: 'int' as const, sortable: true },
      { title: '城市', key: 'city', filterable: true },
      { title: '入职日期', key: 'joinDate', sortable: true },
    ],
    data: employeeData,
  },
  basicProperties: {
    showColumnManager: true,
    pagination: true,
  } as Record<string, unknown>,
};
