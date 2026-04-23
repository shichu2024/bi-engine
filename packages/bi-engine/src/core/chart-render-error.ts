// ---------------------------------------------------------------------------
// ChartRenderError -- 图表渲染管道的结构化错误
// ---------------------------------------------------------------------------

/**
 * 图表渲染管道中的失败类别。
 *
 * - VALIDATION：输入的 `ChartComponent` 未通过结构或语义校验
 *   （如缺少字段、类型错误）。
 * - DATA：数据解析失败（如不支持的 dataType、缺少行数据、
 *   列键不匹配）。
 * - RENDER：渲染步骤本身失败（如 ECharts 初始化错误、
 *   选项序列化失败）。
 */
export enum ChartRenderErrorCategory {
  VALIDATION = 'VALIDATION',
  DATA = 'DATA',
  RENDER = 'RENDER',
}

// ---------------------------------------------------------------------------
// 敏感键黑名单
// ---------------------------------------------------------------------------

/**
 * 序列化为 JSON 或生成面向用户的消息时从 `details` 中剥离的键。
 * 防止意外泄露凭据、令牌或内部标识符。
 */
const SENSITIVE_KEYS: ReadonlySet<string> = new Set([
  'token',
  'password',
  'secret',
  'authorization',
  'apikey',
  'api_key',
  'accesskey',
  'access_key',
  'cookie',
]);

function stripSensitiveValues(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const keys = Object.keys(input);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else {
      const value = input[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = stripSensitiveValues(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// ChartRenderError
// ---------------------------------------------------------------------------

/**
 * 图表渲染管道抛出或返回的结构化错误。
 *
 * 设计目标：
 * - 机器可读的 `code` 用于程序化处理。
 * - 人类可读的 `message` 用于展示。
 * - 可选的 `details` 负载提供额外上下文（在暴露前进行清理）。
 * - `category` 区分校验、数据和渲染失败。
 */
export class ChartRenderError extends Error {
  /** 机器可读的错误码（如 `MISSING_SERIES`、`STATIC_DATA_MISSING`） */
  public readonly code: string;

  /** 高级别错误类别 */
  public readonly category: ChartRenderErrorCategory;

  /** 关于失败的额外上下文（访问时进行清理） */
  private readonly rawDetails: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    category: ChartRenderErrorCategory,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ChartRenderError';
    this.code = code;
    this.category = category;
    this.rawDetails = details !== undefined ? { ...details } : {};
  }

  /**
   * 返回清理后的 details 副本，敏感键已脱敏。
   * 返回的对象始终是全新的克隆 -- 调用方可以修改而不影响错误实例。
   */
  public get details(): Record<string, unknown> {
    return stripSensitiveValues(this.rawDetails);
  }

  /**
   * 可 JSON 序列化的表示，敏感值已剥离。
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      details: this.details,
    };
  }
}

// ---------------------------------------------------------------------------
// 工厂函数
// ---------------------------------------------------------------------------

/** 创建 VALIDATION 类别的错误 */
export function createValidationError(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ChartRenderError {
  return new ChartRenderError(code, message, ChartRenderErrorCategory.VALIDATION, details);
}

/** 创建 DATA 类别的错误 */
export function createDataError(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ChartRenderError {
  return new ChartRenderError(code, message, ChartRenderErrorCategory.DATA, details);
}

/** 创建 RENDER 类别的错误 */
export function createRenderError(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ChartRenderError {
  return new ChartRenderError(code, message, ChartRenderErrorCategory.RENDER, details);
}
