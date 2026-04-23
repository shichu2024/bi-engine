import { useState, useCallback } from 'react';
import { ChartView, ChartStateView, createValidationError } from 'bi-engine';
import type { ChartComponent, ChartViewError, ChartRenderError } from 'bi-engine';

interface ChartPreviewProps {
  readonly component: ChartComponent;
  readonly description: string;
}

export function ChartPreview({
  component,
  description,
}: ChartPreviewProps): React.ReactElement {
  const [chartState, setChartState] = useState<'loading' | 'empty' | 'error' | 'success'>('success');
  const [errorObj, setErrorObj] = useState<ChartRenderError | undefined>(undefined);

  const handleError = useCallback((error: ChartViewError) => {
    setChartState('error');
    setErrorObj(createValidationError(error.code, error.message));
  }, []);

  const errorForState = chartState === 'error' ? errorObj : undefined;

  return (
    <div data-testid="chart-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ChartStateView state={chartState} error={errorForState}>
        <ChartView
          component={component}
          onError={handleError}
        />
      </ChartStateView>
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 12,
        fontSize: 11,
        color: '#999',
        pointerEvents: 'none',
      }}>
        {description}
      </div>
    </div>
  );
}
