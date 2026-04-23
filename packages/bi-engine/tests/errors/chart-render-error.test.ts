import { describe, it, expect } from 'vitest';
import {
  ChartRenderError,
  ChartRenderErrorCategory,
  createValidationError,
  createDataError,
  createRenderError,
} from '../../src/core/chart-render-error';

// ---------------------------------------------------------------------------
// ChartRenderError
// ---------------------------------------------------------------------------

describe('ChartRenderError', () => {
  it('存储 code、message 和 category', () => {
    const err = new ChartRenderError(
      'TEST_CODE',
      'test message',
      ChartRenderErrorCategory.VALIDATION,
    );

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ChartRenderError);
    expect(err.name).toBe('ChartRenderError');
    expect(err.code).toBe('TEST_CODE');
    expect(err.message).toBe('test message');
    expect(err.category).toBe(ChartRenderErrorCategory.VALIDATION);
  });

  it('暴露脱敏后的 details', () => {
    const err = new ChartRenderError(
      'TEST',
      'msg',
      ChartRenderErrorCategory.DATA,
      { field: 'x', token: 'secret-value', ApiKey: 'should-be-hidden' },
    );

    const details = err.details;
    expect(details.field).toBe('x');
    expect(details.token).toBe('[REDACTED]');
    expect(details.ApiKey).toBe('[REDACTED]');
  });

  it('未提供 details 时返回空对象', () => {
    const err = new ChartRenderError('CODE', 'msg', ChartRenderErrorCategory.RENDER);
    expect(err.details).toEqual({});
  });

  it('details getter 返回新的克隆副本', () => {
    const err = new ChartRenderError('CODE', 'msg', ChartRenderErrorCategory.VALIDATION, {
      key: 'value',
    });

    const details = err.details;
    details.key = 'mutated';
    expect(err.details.key).toBe('value');
  });

  it('生成安全的 JSON 表示', () => {
    const err = new ChartRenderError('CODE', 'msg', ChartRenderErrorCategory.VALIDATION, {
      field: 'y',
      password: 'hunter2',
    });

    const json = err.toJSON();
    expect(json.name).toBe('ChartRenderError');
    expect(json.code).toBe('CODE');
    expect(json.category).toBe(ChartRenderErrorCategory.VALIDATION);
    expect(json.message).toBe('msg');

    const details = json.details as Record<string, unknown>;
    expect(details.field).toBe('y');
    expect(details.password).toBe('[REDACTED]');
  });

  it('脱敏嵌套对象中的敏感键', () => {
    const err = new ChartRenderError('CODE', 'msg', ChartRenderErrorCategory.DATA, {
      nested: { secret: 'hidden', visible: 'ok' },
    });

    const details = err.details;
    const nested = details.nested as Record<string, unknown>;
    expect(nested.secret).toBe('[REDACTED]');
    expect(nested.visible).toBe('ok');
  });
});

// ---------------------------------------------------------------------------
// 工厂函数
// ---------------------------------------------------------------------------

describe('错误工厂函数', () => {
  it('createValidationError 设置 VALIDATION 类别', () => {
    const err = createValidationError('MISSING_FIELD', 'Missing field X');
    expect(err.category).toBe(ChartRenderErrorCategory.VALIDATION);
    expect(err.code).toBe('MISSING_FIELD');
  });

  it('createDataError 设置 DATA 类别', () => {
    const err = createDataError('STATIC_DATA_MISSING', 'No data');
    expect(err.category).toBe(ChartRenderErrorCategory.DATA);
    expect(err.code).toBe('STATIC_DATA_MISSING');
  });

  it('createRenderError 设置 RENDER 类别', () => {
    const err = createRenderError('ECHARTS_INIT_FAILED', 'Init failed');
    expect(err.category).toBe(ChartRenderErrorCategory.RENDER);
    expect(err.code).toBe('ECHARTS_INIT_FAILED');
  });

  it('工厂函数透传 details', () => {
    const err = createDataError('CODE', 'msg', { missingFields: ['a', 'b'] });
    expect(err.details.missingFields).toEqual(['a', 'b']);
  });
});
