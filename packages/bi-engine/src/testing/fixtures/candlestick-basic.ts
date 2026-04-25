import { FieldType } from '../../schema/bi-engine-models';
import type { ChartComponent } from '../../schema/bi-engine-models';

/**
 * 蜡烛图（K 线图）夹具。
 *
 * 渲染一个基础蜡烛图，展示股票一周的价格走势。
 */
export const candlestickBasicFixture: ChartComponent = {
  type: 'chart',
  id: 'fixture-candlestick-basic',
  dataProperties: {
    dataType: 'static',
    title: '股票一周 K 线图',
    columns: [
      { title: '日期', key: 'date', type: FieldType.string },
      { title: '开盘价', key: 'open', type: FieldType.double },
      { title: '收盘价', key: 'close', type: FieldType.double },
      { title: '最低价', key: 'low', type: FieldType.double },
      { title: '最高价', key: 'high', type: FieldType.double },
    ],
    data: [
      { date: '周一', open: 20, close: 24, low: 18, high: 25 },
      { date: '周二', open: 24, close: 22, low: 20, high: 27 },
      { date: '周三', open: 22, close: 28, low: 21, high: 30 },
      { date: '周四', open: 28, close: 26, low: 24, high: 31 },
      { date: '周五', open: 26, close: 32, low: 25, high: 33 },
    ],
    series: [
      {
        type: 'candlestick',
        name: '价格走势',
        encode: { open: 'open', close: 'close', low: 'low', high: 'high' },
      },
    ],
  },
  xAxis: { type: 'category', name: '日期' },
  yAxis: { type: 'value', name: '价格 (元)' },
};
