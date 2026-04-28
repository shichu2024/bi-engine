import type { CompositeTable } from '../../schema/bi-engine-models';

/** 组合表格 + 列合并 fixture：子表格含值合并和表头合并 */
export const compositeTableWithMerge: CompositeTable = {
  type: 'compositeTable',
  id: 'composite-table-merge',
  dataProperties: {
    dataType: 'static',
    title: '2024年度员工信息汇总',
  },
  tables: [
    {
      type: 'table',
      id: 'sub-table-merge-value',
      dataProperties: {
        dataType: 'static',
        title: '技术研发部',
        columns: [
          { title: '姓名', key: 'name' },
          { title: '省', key: 'province' },
          { title: '市', key: 'city' },
          { title: '详细地址', key: 'address' },
          { title: '职位', key: 'position' },
        ],
        data: [
          { name: '张伟', province: '广东省', city: '深圳市', address: '南山区科技园', position: '技术总监' },
          { name: '李娜', province: '北京市', city: '朝阳区', address: '望京SOHO', position: '前端工程师' },
          { name: '王强', province: '浙江省', city: '杭州市', address: '西湖区文三路', position: '后端工程师' },
        ],
        mergeColumns: [
          { title: '联系地址', columns: ['province', 'city', 'address'], isMergeValue: true },
        ],
      },
    },
    {
      type: 'table',
      id: 'sub-table-merge-header',
      dataProperties: {
        dataType: 'static',
        title: '产品部',
        columns: [
          { title: '姓名', key: 'name' },
          { title: '语文', key: 'chinese' },
          { title: '数学', key: 'math' },
          { title: '英语', key: 'english' },
          { title: '物理', key: 'physics' },
        ],
        data: [
          { name: '赵六', chinese: 88, math: 92, english: 85, physics: 90 },
          { name: '钱七', chinese: 76, math: 88, english: 90, physics: 82 },
        ],
        mergeColumns: [
          { title: '文科', columns: ['chinese', 'english'], isMergeValue: false },
        ],
      },
    },
  ],
};
