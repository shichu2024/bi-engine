// ============================================================================
// component-handlers/chart/chart-handler.tsx — 图表组件处理器
// ============================================================================

import { useRef, useMemo } from 'react';
import type {
  ComponentHandler,
  ComponentValidator,
  ComponentNormalizer,
  ComponentResolver,
  ComponentModelBuilder,
  ComponentRenderer,
  PipelineResult,
  ValidationOutput,
  NormalizedComponent,
  ResolvedData,
  RenderContext,
} from '../../platform/types';
import type { ChartComponent } from '../../schema/bi-engine-models';
import type { ChartSemanticModel } from './chart-semantic-model';
import { validateChartComponent } from './chart-validator';
import { normalizeChartComponent } from './chart-normalizer';
import { resolveChartData } from './chart-resolver';
import { buildSemanticModel } from './chart-semantic-model';
import { echartsAdapter } from '../../adapters/echarts/echarts-adapter';
import { createValidationError, createResolutionError } from '../../platform/errors';
import { useChartInstance } from '../../react/use-chart-instance';
import type { ChartOptionInput } from '../../react/use-chart-instance';

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

const chartValidator: ComponentValidator<ChartComponent> = {
  validate(component: ChartComponent): PipelineResult<ValidationOutput> {
    const result = validateChartComponent(component);
    if (!result.ok) {
      const first = result.errors[0];
      return {
        ok: false,
        error: {
          code: first?.code ?? 'VALIDATION_FAILED',
          message: first?.message ?? 'Chart validation failed.',
          stage: 'validation' as const,
        },
      };
    }
    return { ok: true, data: { warnings: [] } };
  },
};

// ---------------------------------------------------------------------------
// Normalizer
// ---------------------------------------------------------------------------

const chartNormalizer: ComponentNormalizer<ChartComponent> = {
  normalize(component: ChartComponent): PipelineResult<NormalizedComponent> {
    const normalized = normalizeChartComponent(component);
    return {
      ok: true,
      data: {
        id: normalized.id,
        type: 'chart',
        properties: {
          title: normalized.title,
          series: normalized.series,
          axes: normalized.axes,
          columns: normalized.columns,
          chartOption: normalized.chartOption,
        },
      },
    };
  },
};

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

const chartResolver: ComponentResolver<ChartComponent> = {
  resolve(component: ChartComponent): PipelineResult<ResolvedData> {
    const result = resolveChartData(component.dataProperties);
    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: result.code,
          message: result.message,
          stage: 'resolution' as const,
        },
      };
    }
    return {
      ok: true,
      data: {
        dataType: component.dataProperties.dataType,
        data: result.data,
      },
    };
  },
};

// ---------------------------------------------------------------------------
// ModelBuilder
// ---------------------------------------------------------------------------

const chartModelBuilder: ComponentModelBuilder<ChartComponent, ChartSemanticModel> = {
  build(
    _normalized: NormalizedComponent,
    resolved: ResolvedData,
    component: ChartComponent,
  ): PipelineResult<ChartSemanticModel> {
    const normalized = normalizeChartComponent(component);
    const model = buildSemanticModel(normalized, resolved.data);
    return { ok: true, data: model };
  },
};

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

const chartRenderer: ComponentRenderer<ChartComponent, ChartSemanticModel> = {
  render(model: ChartSemanticModel, context: RenderContext): React.ReactNode {
    return <ChartRendererContent model={model} context={context} />;
  },
};

function ChartRendererContent({
  model,
  context,
}: {
  model: ChartSemanticModel;
  context: RenderContext;
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const option = useMemo(() => echartsAdapter.adapt(model), [model]);

  useChartInstance({
    containerRef,
    option: option as unknown as ChartOptionInput,
  });

  return (
    <div
      ref={containerRef}
      className={context.className}
      style={{ width: '100%', height: '100%', ...context.style }}
    />
  );
}

// ---------------------------------------------------------------------------
// 导出
// ---------------------------------------------------------------------------

export const chartHandler: ComponentHandler<ChartComponent, ChartSemanticModel> = {
  type: 'chart',
  validator: chartValidator,
  normalizer: chartNormalizer,
  resolver: chartResolver,
  modelBuilder: chartModelBuilder,
  renderer: chartRenderer,
};
