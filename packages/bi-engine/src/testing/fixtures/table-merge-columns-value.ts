import type { TableComponent } from '../../schema/bi-engine-models';

/** 值合并场景：isMergeValue=true，多列合并为一个单元格 */
export const tableMergeColumnsValue: TableComponent = {
  type: 'table',
  id: 'table-merge-columns-value',
  dataProperties: {
    dataType: 'static',
    title: '人员信息表（值合并）',
    columns: [
      { title: '姓名', key: 'name' },
      { title: '年龄', key: 'age', type: 'int' as const },
      { title: '省', key: 'province' },
      { title: '市', key: 'city' },
      { title: '详细地址', key: 'address' },
      { title: '电话', key: 'phone' },
    ],
    data: [
      { name: '张三', age: 32, province: '广东省', city: '深圳市', address: '南山区科技园', phone: '13800138001' },
      { name: '李四', age: 28, province: '北京市', city: '朝阳区', address: '望京SOHO', phone: '13900139002' },
      { name: '王五', age: 35, province: '浙江省', city: '杭州市', address: '西湖区文三路', phone: '' },
      { name: '赵六', age: 25, province: '上海市', city: '', address: '', phone: '13700137004' },
    ],
    mergeColumns: [
      { title: '联系地址', columns: ['province', 'city', 'address'], isMergeValue: true },
    ],
  },
};
