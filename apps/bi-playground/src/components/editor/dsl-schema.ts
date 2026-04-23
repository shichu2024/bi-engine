// ---------------------------------------------------------------------------
// BI Engine DSL JSON Schema (draft-07)
// Based on bi-engine model definitions in packages/bi-engine/src/schema/bi-engine-models.ts
// ---------------------------------------------------------------------------

const SERIES_ENCODE_LINE_BAR = {
  type: 'object' as const,
  description: '数据字段映射，将图表维度绑定到数据列',
  properties: {
    x: { type: 'string' as const, description: 'X 轴对应的数据 key' },
    y: { type: 'string' as const, description: 'Y 轴对应的数据 key' },
    xAxisIndex: {
      type: 'number' as const,
      description: 'X 轴索引（多轴时使用）',
    },
    yAxisIndex: {
      type: 'number' as const,
      description: 'Y 轴索引（多轴时使用）',
    },
  },
  required: ['x', 'y'],
  additionalProperties: false,
};

const SERIES_ENCODE_PIE = {
  type: 'object' as const,
  description: '数据字段映射，将饼图维度绑定到数据列',
  properties: {
    name: { type: 'string' as const, description: '扇区名称对应的数据 key' },
    value: { type: 'string' as const, description: '扇区数值对应的数据 key' },
  },
  required: ['name', 'value'],
  additionalProperties: false,
};

const SERIES_ENCODE_GAUGE = {
  type: 'object' as const,
  description: '数据字段映射，将仪表盘维度绑定到数据列',
  properties: {
    value: { type: 'string' as const, description: '仪表盘数值对应的数据 key' },
  },
  required: ['value'],
  additionalProperties: false,
};

const SERIES_ENCODE_CANDLESTICK = {
  type: 'object' as const,
  description: '数据字段映射，将蜡烛图维度绑定到数据列',
  properties: {
    open: { type: 'string' as const, description: '开盘价对应的数据 key' },
    close: { type: 'string' as const, description: '收盘价对应的数据 key' },
    low: { type: 'string' as const, description: '最低价对应的数据 key' },
    high: { type: 'string' as const, description: '最高价对应的数据 key' },
  },
  required: ['open', 'close', 'low', 'high'],
  additionalProperties: false,
};

/** BI Engine DSL JSON Schema (draft-07) */
export const dslSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'BI Engine Component DSL',
  description:
    'BI 引擎组件 DSL 定义，用于描述图表、表格、文本等可视化组件',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      description: '组件类型',
      enum: ['text', 'table', 'chart', 'markdown', 'compositeTable'],
    },
    id: {
      type: 'string',
      description: '组件唯一标识符',
    },
    layout: {
      description: '组件布局信息',
      oneOf: [
        {
          type: 'object',
          description: '网格布局',
          properties: {
            type: { type: 'string', const: 'grid', description: '布局类型：网格' },
            gx: { type: 'number', description: '网格 X 起点（格数）' },
            gy: { type: 'number', description: '网格 Y 起点（格数）' },
            gw: { type: 'number', description: '宽度（格数）' },
            gh: { type: 'number', description: '高度（格数）' },
          },
          required: ['type', 'gx', 'gy', 'gw', 'gh'],
        },
        {
          type: 'object',
          description: '流式布局',
          properties: {
            type: { type: 'string', const: 'flow', description: '布局类型：流式' },
          },
          required: ['type'],
        },
        {
          type: 'object',
          description: '绝对定位布局',
          properties: {
            type: { type: 'string', const: 'absolute', description: '布局类型：绝对定位' },
            x: { type: 'number', description: 'X 坐标（px）' },
            y: { type: 'number', description: 'Y 坐标（px）' },
            w: { type: 'number', description: '宽度（px）' },
            h: { type: 'number', description: '高度（px）' },
            zIndex: { type: 'number', description: '层级' },
          },
          required: ['type', 'x', 'y', 'w', 'h'],
        },
      ],
    },

    // ---- Data Properties ----
    dataProperties: {
      type: 'object',
      description: '组件数据属性配置',
      properties: {
        dataType: {
          type: 'string',
          description: '数据类型',
          enum: ['static', 'datasource', 'api'],
          default: 'static',
        },
        sourceId: { type: 'string', description: '数据源 ID' },
        url: { type: 'string', description: 'API 查询 URL' },
        method: {
          type: 'string',
          description: 'API 请求方法',
          enum: ['GET', 'POST'],
        },
        autoRefresh: {
          type: 'boolean',
          description: '是否自动刷新数据',
        },
        refreshInterval: {
          type: 'number',
          description: '自动刷新间隔（毫秒）',
        },
        title: { type: 'string', description: '组件标题' },
        content: { type: 'string', description: '文本 / Markdown 静态内容' },
        data: {
          type: 'array',
          description: '静态数据行（对象数组）',
          items: { type: 'object', additionalProperties: true },
        },
      },
    },

    // ---- Columns (table / chart) ----
    columns: {
      type: 'array',
      description: '数据列配置（表格与图表通用）',
      items: {
        type: 'object',
        description: '列配置',
        properties: {
          title: { type: 'string', description: '列显示标题' },
          key: { type: 'string', description: '列对应数据源的 key' },
          type: {
            type: 'string',
            description: '字段类型',
            enum: ['string', 'long', 'int', 'timestamp', 'double', 'float', 'enum'],
          },
          colSpan: { type: 'number', description: '表头横向合并列数' },
        },
        required: ['title', 'key'],
      },
    },

    // ---- Series (chart) ----
    series: {
      type: 'array',
      description: '图表系列配置列表',
      items: {
        type: 'object',
        description: '系列配置',
        properties: {
          type: {
            type: 'string',
            description: '系列类型',
            enum: ['line', 'bar', 'pie', 'scatter', 'radar', 'gauge', 'candlestick'],
          },
          subType: {
            type: 'string',
            description:
              '衍生子类型：line->area, bar->horizontal, pie->ring',
          },
          name: { type: 'string', description: '系列名称（用于图例）' },
          encode: {
            description: '数据映射配置',
            oneOf: [
              SERIES_ENCODE_LINE_BAR,
              SERIES_ENCODE_PIE,
              SERIES_ENCODE_GAUGE,
              SERIES_ENCODE_CANDLESTICK,
            ],
          },
        },
        required: ['type', 'name', 'encode'],
      },
    },

    // ---- Axis ----
    xAxis: {
      description: 'X 轴配置（饼图无此配置）',
      oneOf: [
        { $ref: '#/$defs/axis' },
        {
          type: 'array',
          description: '多 X 轴配置',
          items: { $ref: '#/$defs/axis' },
        },
      ],
    },
    yAxis: {
      description: 'Y 轴配置（饼图无此配置）',
      oneOf: [
        { $ref: '#/$defs/axis' },
        {
          type: 'array',
          description: '多 Y 轴配置',
          items: { $ref: '#/$defs/axis' },
        },
      ],
    },

    // ---- Chart Options ----
    options: {
      type: 'object',
      description: '图表扩展配置',
      properties: {
        eChartOption: {
          type: 'object',
          description: 'ECharts 原生配置（透传）',
          additionalProperties: true,
        },
        centerText: {
          type: 'string',
          description: '中心文本（用于饼图 / 仪表盘）',
        },
        subCenterText: {
          type: 'string',
          description: '副中心文本',
        },
      },
    },

    // ---- Interactions ----
    interactions: {
      type: 'array',
      description: '交互配置列表（组件间联动）',
      items: {
        type: 'object',
        description: '交互配置',
        properties: {
          trigger: {
            type: 'object',
            description: '触发配置',
            properties: {
              action: {
                type: 'string',
                description: '触发动作',
                enum: ['click', 'hover', 'change', 'select'],
              },
              field: {
                type: 'string',
                description: '触发的数据属性名（不指定时为组件级触发）',
              },
            },
            required: ['action'],
          },
          targets: {
            type: 'array',
            description: '联动目标列表',
            items: {
              type: 'object',
              properties: {
                componentId: {
                  type: 'string',
                  description: '目标组件 ID',
                },
                type: {
                  type: 'string',
                  description: '联动方式',
                  enum: ['filter', 'jump', 'highlight'],
                },
                params: {
                  type: 'object',
                  description: '参数映射：源字段名 -> 目标参数名',
                  additionalProperties: { type: 'string' },
                },
              },
              required: ['componentId', 'type'],
            },
          },
        },
        required: ['trigger', 'targets'],
      },
    },

    // ---- CompositeTable specific ----
    tables: {
      type: 'array',
      description: '子表格列表（仅 compositeTable 类型）',
      items: {
        $ref: '#',
      },
    },

    // ---- Miscellaneous ----
    axisGroup: {
      type: 'array',
      description: '坐标轴分组键值列表',
      items: { type: 'string' },
    },
    basicProperties: {
      type: 'object',
      description: '组件基础配置',
      additionalProperties: true,
    },
    advanceProperties: {
      type: 'object',
      description: '组件高级配置',
      additionalProperties: true,
    },
  },
  required: ['type'],

  // ---- Shared definitions ----
  $defs: {
    axis: {
      type: 'object',
      description: '坐标轴配置',
      properties: {
        type: {
          type: 'string',
          description: '轴类型',
          enum: ['category', 'value'],
        },
        name: { type: 'string', description: '轴名称' },
      },
      required: ['type'],
      additionalProperties: false,
    },
  },
} as const;
