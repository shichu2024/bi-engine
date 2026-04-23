import type { ViewportSize } from '../shared-constants';

interface ViewportSwitcherProps {
  readonly viewports: readonly ViewportSize[];
  readonly selectedIndex: number;
  readonly onChange: (index: number) => void;
  readonly isDark: boolean;
}

export function ViewportSwitcher({
  viewports,
  selectedIndex,
  onChange,
  isDark,
}: ViewportSwitcherProps): React.ReactElement {
  const selectStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 6,
    border: `1px solid ${isDark ? '#444' : '#ccc'}`,
    backgroundColor: isDark ? '#1a1a2e' : '#fff',
    color: isDark ? '#e0e0e0' : '#333',
    fontSize: 13,
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <label data-testid="viewport-switcher" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: isDark ? '#aaa' : '#666' }}>Viewport:</span>
      <select
        value={selectedIndex}
        onChange={handleChange}
        style={selectStyle}
      >
        {viewports.map((vp, idx) => (
          <option key={vp.label} value={idx}>
            {vp.label}
          </option>
        ))}
      </select>
    </label>
  );
}
