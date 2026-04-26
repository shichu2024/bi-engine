import type { ChartComponent, TableComponent, TextComponent, BIEngineComponent } from '../schema/bi-engine-models';

import { lineSingleFixture } from './fixtures/line-single';
import { lineMultiFixture } from './fixtures/line-multi';
import { lineAreaFixture } from './fixtures/line-area';
import { barSingleFixture } from './fixtures/bar-single';
import { barMultiFixture } from './fixtures/bar-multi';
import { barHorizontalFixture } from './fixtures/bar-horizontal';
import { barStackedFixture } from './fixtures/bar-stacked';
import { lineMultiTrendFixture } from './fixtures/line-multi-trend';
import { comboBarLineFixture } from './fixtures/combo-bar-line';
import { lineAreaMultiFixture } from './fixtures/line-area-multi';
import { lineAxisGroupFixture } from './fixtures/line-axis-group';
import { barAxisGroupFixture } from './fixtures/bar-axis-group';
import { pieSingleFixture } from './fixtures/pie-single';
import { pieRingFixture } from './fixtures/pie-ring';
import { lineWithOptionsFixture } from './fixtures/chart-with-options';
import { scatterBasicFixture } from './fixtures/scatter-basic';
import { radarBasicFixture } from './fixtures/radar-basic';
import { candlestickBasicFixture } from './fixtures/candlestick-basic';
import { gaugeBasicFixture } from './fixtures/gauge-basic';
import { tableBasic } from './fixtures/table-basic';
import { tableMultiHeader } from './fixtures/table-multi-header';
import { tableSortable } from './fixtures/table-sortable-filterable';
import { tableMerge } from './fixtures/table-merge';
import { tableEnumRender } from './fixtures/table-enum-render';
import { tableFullFeatured } from './fixtures/table-full-featured';
import { tableSortFilter } from './fixtures/table-sort-filter';
import { textBasic } from './fixtures/text-basic';
import { textWithTitle } from './fixtures/text-with-title';

// ---------------------------------------------------------------------------
// 测试夹具条目类型
// ---------------------------------------------------------------------------

/**
 * 注册表中的命名夹具条目。
 *
 * 每个夹具有唯一的 `id`、人类可读的 `description` 和实际的 `component` 数据。
 * `seriesKind` 字段指示该夹具测试的图表类型，便于按类型筛选夹具。
 */
export interface FixtureEntry {
  /** 唯一夹具标识符 */
  readonly id: string;
  /** 人类可读的描述，说明此夹具展示的内容 */
  readonly description: string;
  /** 此夹具测试的图表类型 */
  readonly seriesKind: 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'candlestick' | 'gauge';
  /** ChartComponent 实例 */
  readonly component: ChartComponent;
}

// ---------------------------------------------------------------------------
// 夹具注册表
// ---------------------------------------------------------------------------

/**
 * 所有已注册夹具的只读数组。
 *
 * 这是测试夹具的单一事实来源，在白盒测试和 bi-playground 应用之间共享。
 */
export const FIXTURE_REGISTRY: readonly FixtureEntry[] = [
  {
    id: 'line-single',
    description: '单线图：6 个月的月度销售趋势',
    seriesKind: 'line',
    component: lineSingleFixture,
  },
  {
    id: 'line-multi',
    description: '多线图：7 个月的收入与成本对比',
    seriesKind: 'line',
    component: lineMultiFixture,
  },
  {
    id: 'line-area',
    description: '面积图：6 周的网站流量增长',
    seriesKind: 'line',
    component: lineAreaFixture,
  },
  {
    id: 'line-multi-trend',
    description: '三线趋势图：三城市 8 个月温度变化',
    seriesKind: 'line',
    component: lineMultiTrendFixture,
  },
  {
    id: 'line-area-multi',
    description: '多面积图：桌面端与移动端流量对比',
    seriesKind: 'line',
    component: lineAreaMultiFixture,
  },
  {
    id: 'line-axis-group',
    description: 'axisGroup分组折线图：窄表数据自动透视为多系列（双字段分组）',
    seriesKind: 'line',
    component: lineAxisGroupFixture,
  },
  {
    id: 'bar-single',
    description: '单柱图：4 个季度的季度收入',
    seriesKind: 'bar',
    component: barSingleFixture,
  },
  {
    id: 'bar-multi',
    description: '分组柱图：两条产品线在 5 个区域的对比',
    seriesKind: 'bar',
    component: barMultiFixture,
  },
  {
    id: 'bar-horizontal',
    description: '条形图（水平柱图）：部门绩效评分',
    seriesKind: 'bar',
    component: barHorizontalFixture,
  },
  {
    id: 'bar-stacked',
    description: '堆叠柱图：三个渠道的季度访问量构成',
    seriesKind: 'bar',
    component: barStackedFixture,
  },
  {
    id: 'combo-bar-line',
    description: '混合图表：月度销售额（柱）与毛利率（线）',
    seriesKind: 'bar',
    component: comboBarLineFixture,
  },
  {
    id: 'bar-axis-group',
    description: 'axisGroup分组柱图：窄表数据自动透视为多系列（单字段分组）',
    seriesKind: 'bar',
    component: barAxisGroupFixture,
  },
  {
    id: 'pie-single',
    description: '饼图：5 个细分市场的市场份额分布',
    seriesKind: 'pie',
    component: pieSingleFixture,
  },
  {
    id: 'pie-ring',
    description: '环形图（甜甜圈图）：预算分配及中心文本',
    seriesKind: 'pie',
    component: pieRingFixture,
  },
  {
    id: 'line-with-options',
    description: '带 ChartOption 覆盖的折线图（自定义网格布局）',
    seriesKind: 'line',
    component: lineWithOptionsFixture,
  },
  {
    id: 'scatter-basic',
    description: '散点图：广告支出与销售额相关关系',
    seriesKind: 'scatter',
    component: scatterBasicFixture,
  },
  {
    id: 'radar-basic',
    description: '雷达图：产品多维度能力评估',
    seriesKind: 'radar',
    component: radarBasicFixture,
  },
  {
    id: 'candlestick-basic',
    description: '蜡烛图：股票一周 K 线走势',
    seriesKind: 'candlestick',
    component: candlestickBasicFixture,
  },
  {
    id: 'gauge-basic',
    description: '仪表盘：项目完成率',
    seriesKind: 'gauge',
    component: gaugeBasicFixture,
  },
] as const;

/**
 * 按唯一 id 查找夹具。
 *
 * @param id - 要搜索的夹具 id。
 * @returns 匹配的 `FixtureEntry`，如果未找到则为 `undefined`。
 */
export function getFixtureById(id: string): FixtureEntry | undefined {
  for (let i = 0; i < FIXTURE_REGISTRY.length; i++) {
    if (FIXTURE_REGISTRY[i].id === id) {
      return FIXTURE_REGISTRY[i];
    }
  }
  return undefined;
}

/**
 * 返回匹配给定系列类型的所有夹具。
 *
 * @param kind - 要筛选的图表类型。
 * @returns 匹配的夹具条目数组。
 */
export function getFixturesByKind(kind: 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'candlestick' | 'gauge'): readonly FixtureEntry[] {
  const result: FixtureEntry[] = [];
  for (let i = 0; i < FIXTURE_REGISTRY.length; i++) {
    if (FIXTURE_REGISTRY[i].seriesKind === kind) {
      result.push(FIXTURE_REGISTRY[i]);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// 表格夹具注册表
// ---------------------------------------------------------------------------

/** 组件种类 */
export type ComponentKind = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'candlestick' | 'gauge' | 'table' | 'text';

/** 统一夹具条目 */
export interface UnifiedFixtureEntry {
  readonly id: string;
  readonly description: string;
  readonly componentKind: ComponentKind;
  readonly component: BIEngineComponent;
}

/** 表格夹具条目 */
export interface TableFixtureEntry {
  readonly id: string;
  readonly description: string;
  readonly component: TableComponent;
}

/** 文本夹具条目 */
export interface TextFixtureEntry {
  readonly id: string;
  readonly description: string;
  readonly component: TextComponent;
}

export const TABLE_FIXTURE_REGISTRY: readonly TableFixtureEntry[] = [
  {
    id: 'table-basic',
    description: '基础表格：销售数据展示',
    component: tableBasic,
  },
  {
    id: 'table-multi-header',
    description: '多级表头：学生成绩表',
    component: tableMultiHeader,
  },
  {
    id: 'table-sortable',
    description: '可排序表格：学生信息（点击列头排序）',
    component: tableSortable,
  },
  {
    id: 'table-merge',
    description: '合并单元格：部门人员表（行合并）',
    component: tableMerge,
  },
  {
    id: 'table-enum-render',
    description: '枚举映射：订单状态表（enumConfig 自动映射）',
    component: tableEnumRender,
  },
  {
    id: 'table-sort-filter',
    description: '排序 & 筛选：学生成绩表（列头排序图标、漏斗筛选、列管理齿轮）',
    component: tableSortFilter,
  },
  {
    id: 'table-full-featured',
    description: '全功能演示：员工信息表（分页、排序、筛选、列管理）',
    component: tableFullFeatured,
  },
] as const;

// ---------------------------------------------------------------------------
// 文本夹具注册表
// ---------------------------------------------------------------------------

export const TEXT_FIXTURE_REGISTRY: readonly TextFixtureEntry[] = [
  {
    id: 'text-basic',
    description: '基础文本：静态内容展示',
    component: textBasic,
  },
  {
    id: 'text-with-title',
    description: '带标题文本：标题 + 内容',
    component: textWithTitle,
  },
] as const;

/** 统一注册表（图表 + 表格 + 文本） */
export const UNIFIED_FIXTURE_REGISTRY: readonly UnifiedFixtureEntry[] = [
  ...FIXTURE_REGISTRY.map((f) => ({
    id: f.id,
    description: f.description,
    componentKind: f.seriesKind as ComponentKind,
    component: f.component as BIEngineComponent,
  })),
  ...TABLE_FIXTURE_REGISTRY.map((f) => ({
    id: f.id,
    description: f.description,
    componentKind: 'table' as ComponentKind,
    component: f.component as BIEngineComponent,
  })),
  ...TEXT_FIXTURE_REGISTRY.map((f) => ({
    id: f.id,
    description: f.description,
    componentKind: 'text' as ComponentKind,
    component: f.component as BIEngineComponent,
  })),
];

/** 按 kind 获取统一夹具 */
export function getUnifiedFixturesByKind(kind: ComponentKind): readonly UnifiedFixtureEntry[] {
  const result: UnifiedFixtureEntry[] = [];
  for (const entry of UNIFIED_FIXTURE_REGISTRY) {
    if (entry.componentKind === kind) {
      result.push(entry);
    }
  }
  return result;
}

/** 按 id 查找统一夹具 */
export function getUnifiedFixtureById(id: string): UnifiedFixtureEntry | undefined {
  for (const entry of UNIFIED_FIXTURE_REGISTRY) {
    if (entry.id === id) return entry;
  }
  return undefined;
}
