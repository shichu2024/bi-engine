import { useState, useCallback } from 'react';
import { ChartView, ChartStateView, createValidationError } from 'bi-engine';
import type { ChartComponent, ChartViewError, ChartRenderError } from 'bi-engine';
import { ComponentHeader } from './ComponentHeader';
import type { ReactNode } from 'react';

interface ChartPreviewProps {
  readonly component: ChartComponent;
  readonly description: string;
  readonly toolbar?: ReactNode;
}

export function ChartPreview({
  component,
  description,
  toolbar,
}: ChartPreviewProps): React.ReactElement {
  const [chartState, setChartState] = useState<'loading' | 'empty' | 'error' | 'success'>('success');
  const [errorObj, setErrorObj] = useState<ChartRenderError | undefined>(undefined);

  const handleError = useCallback((error: ChartViewError) => {
    setChartState('error');
    setErrorObj(createValidationError(error.code, error.message));
  }, []);

  const errorForState = chartState === 'error' ? errorObj : undefined;
  const title = component.dataProperties.title ?? description ?? '';

  return (
    <div data-testid="chart-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title !== '' && (
        <ComponentHeader title={title} toolbar={toolbar} />
      )}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <ChartStateView state={chartState} error={errorForState}>
          <ChartView
            component={component}
            onError={handleError}
          />
        </ChartStateView>
      </div>
    </div>
  );
}
