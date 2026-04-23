import type { ChartComponent } from 'bi-engine';

interface JsonPreviewProps {
  readonly component: ChartComponent;
  readonly isDark: boolean;
}

export function JsonPreview({
  component,
  isDark,
}: JsonPreviewProps): React.ReactElement {
  const containerStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#0d1117' : '#fafafa',
    border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
    borderRadius: 8,
    padding: 16,
    maxHeight: 500,
    overflow: 'auto',
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    whiteSpace: 'pre',
    color: isDark ? '#c9d1d9' : '#24292f',
  };

  const jsonText = JSON.stringify(component, null, 2);

  return (
    <pre style={containerStyle}>{jsonText}</pre>
  );
}
