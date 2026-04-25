import type { TableComponent } from '../../schema/bi-engine-models';

export const tableEnumRender: TableComponent = {
  type: 'table',
  id: 'table-enum-render',
  dataProperties: {
    dataType: 'static',
    title: '枚举映射表格',
    columns: [
      { title: '订单号', key: 'orderId' },
      { title: '金额', key: 'amount', type: 'double' as const },
      {
        title: '状态',
        key: 'status',
        enumConfig: [
          { value: 'pending', title: '待处理' },
          { value: 'processing', title: '处理中' },
          { value: 'completed', title: '已完成' },
          { value: 'cancelled', title: '已取消' },
        ],
      },
      { title: '创建时间', key: 'createdAt' },
    ],
    data: [
      { orderId: 'ORD-001', amount: 1200.50, status: 'pending', createdAt: '2026-01-15' },
      { orderId: 'ORD-002', amount: 3500.00, status: 'completed', createdAt: '2026-01-16' },
      { orderId: 'ORD-003', amount: 780.30, status: 'processing', createdAt: '2026-01-17' },
      { orderId: 'ORD-004', amount: 2100.00, status: 'cancelled', createdAt: '2026-01-18' },
      { orderId: 'ORD-005', amount: 4500.80, status: 'completed', createdAt: '2026-01-19' },
    ],
  },
};
