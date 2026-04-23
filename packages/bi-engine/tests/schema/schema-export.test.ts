import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Schema 导出一致性测试
//
// 这些测试验证来自权威模型的所有类型和枚举均可从
// schema 桶导出中导入。它们作为编译和运行时冒烟测试，
// 防止意外删除导出。
// ---------------------------------------------------------------------------

// -- 类型（仅以 type 方式导入以确认模块中存在）
import type {
  ComponentTypeMap,
  BIEngineComponent,
  BasicComponent,
  DataProperty,
  TextDataProperty,
  TableDataProperty,
  ChartDataProperty,
  MarkdownDataProperty,
  CompositeTableDataProperty,
  MergeColumnInfo,
  MergeRowConfig,
  TextComponent,
  TableComponent,
  ChartComponent,
  MarkdownComponent,
  CompositeTable,
  ComponentLayout,
  PageLayout,
  InteractionAction,
  InteractionTrigger,
  InteractionTarget,
  Interaction,
  Axis,
  LineSeries,
  BarSeries,
  PieSeries,
  ScatterSeries,
  RadarSeries,
  GaugeSeries,
  CandlestickSeries,
  Series,
  ChartOption,
  Report,
  BasicInfo,
  Section,
  Catalog,
  Cover,
  CoverContent,
  SignaturePage,
  Signer,
  ReportSummary,
  PPT,
  Slide,
  SlideSection,
  Dashboard,
  Step,
  Answer,
  Chat,
  GenerateMeta,
  AdditionalInfo,
  ValueFormat,
  FieldUI,
  UIEvent,
  EnumValue,
  Column,
} from '../../src/schema/index';

// -- 枚举（运行时值，因此可以断言其成员）
import {
  LayoutType,
  CoverLayoutType,
  AnswerType,
  ContentType,
  ChatStatus,
  Status,
  FieldType,
  ValueFormatType,
  AdditionalInfoType,
} from '../../src/schema/index';

// ===========================================================================
// 枚举值一致性
// ===========================================================================

describe('Schema 枚举导出', () => {
  it('导出包含预期成员的 LayoutType', () => {
    expect(LayoutType.GRID).toBe('grid');
    expect(LayoutType.FLOW).toBe('flow');
    expect(LayoutType.ABSOLUTE).toBe('absolute');
  });

  it('导出包含预期成员的 CoverLayoutType', () => {
    expect(CoverLayoutType.TITLE_TOP).toBe('TITLE_TOP');
    expect(CoverLayoutType.TITLE_CENTER).toBe('TITLE_CENTER');
  });

  it('导出包含预期成员的 AnswerType', () => {
    expect(AnswerType.CHART).toBe('CHART');
    expect(AnswerType.PLAINTEXT).toBe('PLAINTEXT');
    expect(AnswerType.REPORT).toBe('REPORT');
    expect(AnswerType.REPORT_DEFINITION).toBe('REPORT_DEFINITION');
    expect(AnswerType.REPORT_TEMPLATE).toBe('REPORT_TEMPLATE');
  });

  it('导出包含预期成员的 ContentType', () => {
    expect(ContentType.PLAINTEXT).toBe('PLAINTEXT');
    expect(ContentType.MARKDOWN).toBe('MARKDOWN');
    expect(ContentType.SQL).toBe('SQL');
    expect(ContentType.CODE).toBe('CODE');
  });

  it('导出包含预期成员的 ChatStatus', () => {
    expect(ChatStatus.finished).toBe('finished');
    expect(ChatStatus.failed).toBe('failed');
    expect(ChatStatus.running).toBe('running');
    expect(ChatStatus.aborted).toBe('aborted');
    expect(ChatStatus.historyRunning).toBe('historyRunning');
  });

  it('导出包含预期成员的 Status', () => {
    expect(Status.RUNNING).toBe('Running');
    expect(Status.SUCCESS).toBe('Success');
    expect(Status.ABORTED).toBe('Aborted');
    expect(Status.FAILED).toBe('Failed');
  });

  it('导出包含预期成员的 FieldType', () => {
    expect(FieldType.string).toBe('string');
    expect(FieldType.long).toBe('long');
    expect(FieldType.int).toBe('int');
    expect(FieldType.timestamp).toBe('timestamp');
    expect(FieldType.double).toBe('double');
    expect(FieldType.float).toBe('float');
    expect(FieldType.enum).toBe('enum');
  });

  it('导出包含预期成员的 ValueFormatType', () => {
    expect(ValueFormatType.time).toBe('time');
    expect(ValueFormatType.percentage).toBe('percentage');
    expect(ValueFormatType.number).toBe('number');
    expect(ValueFormatType.byte).toBe('byte');
  });

  it('导出包含预期成员的 AdditionalInfoType', () => {
    expect(AdditionalInfoType.PROMPT).toBe('Prompt');
    expect(AdditionalInfoType.SUMMARY).toBe('Summary');
    expect(AdditionalInfoType.SQL).toBe('SQL');
    expect(AdditionalInfoType.API).toBe('API');
    expect(AdditionalInfoType.KNOWLEDGE).toBe('Knowledge');
  });
});

// ===========================================================================
// 类型可用性冒烟测试
//
// 这些测试确认导入的类型可用于在值层面创建合法实例。
// 它们主要是编译时检查：如果类型被删除或重命名，
// 这些将无法编译。
// ===========================================================================

describe('Schema 类型可用性', () => {
  it('可以构造合法的 ChartComponent', () => {
    const component: ChartComponent = {
      type: 'chart',
      id: 'smoke-test',
      dataProperties: {
        dataType: 'static',
        data: [{ x: 1, y: 2 }],
        series: [
          {
            type: 'line',
            name: 'S1',
            encode: { x: 'x', y: 'y' },
          },
        ],
      },
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
    };

    expect(component.type).toBe('chart');
    expect(component.dataProperties.series).toHaveLength(1);
  });

  it('可以构造合法的 Axis', () => {
    const axis: Axis = { type: 'category', name: 'Month' };
    expect(axis.type).toBe('category');
  });

  it('可以构造合法的 LineSeries', () => {
    const series: LineSeries = {
      type: 'line',
      name: 'Revenue',
      encode: { x: 'month', y: 'revenue' },
    };
    expect(series.type).toBe('line');
  });

  it('可以构造合法的 BarSeries', () => {
    const series: BarSeries = {
      type: 'bar',
      name: 'Sales',
      encode: { x: 'month', y: 'sales' },
    };
    expect(series.type).toBe('bar');
  });

  it('可以构造合法的 PieSeries', () => {
    const series: PieSeries = {
      type: 'pie',
      name: 'Share',
      encode: { name: 'category', value: 'amount' },
    };
    expect(series.type).toBe('pie');
  });

  it('可以构造带有 ValueFormat 的合法 Column', () => {
    const column: Column = {
      title: 'Revenue',
      key: 'revenue',
      type: FieldType.double,
      uiConfig: {
        valueFormat: { type: ValueFormatType.number, decimal: 2 },
      },
    };
    expect(column.key).toBe('revenue');
  });

  it('可以构造带有 eChartOption 的 ChartOption', () => {
    const option: ChartOption = {
      eChartOption: { grid: { left: 50 } },
      centerText: 'Total',
    };
    expect(option.centerText).toBe('Total');
  });

  it('可以构造各种类型的 ValueFormat', () => {
    const timeFormat: ValueFormat = { type: ValueFormatType.time, format: 'YYYY-MM-DD' };
    const pctFormat: ValueFormat = { type: ValueFormatType.percentage, decimal: 1 };
    const numFormat: ValueFormat = { type: ValueFormatType.number, decimal: 2, unit: 'USD' };
    const byteFormat: ValueFormat = { type: ValueFormatType.byte, decimal: 1 };

    expect(timeFormat.type).toBe('time');
    expect(pctFormat.type).toBe('percentage');
    expect(numFormat.type).toBe('number');
    expect(byteFormat.type).toBe('byte');
  });
});
