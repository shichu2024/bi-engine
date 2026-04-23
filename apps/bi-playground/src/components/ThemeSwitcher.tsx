import type { ThemeMode } from '../shared-constants';

interface ThemeSwitcherProps {
  readonly mode: ThemeMode;
  readonly onChange: (mode: ThemeMode) => void;
  readonly isDark: boolean;
}

export function ThemeSwitcher({
  mode,
  onChange,
  isDark,
}: ThemeSwitcherProps): React.ReactElement {
  const buttonBase: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: 6,
    border: `1px solid ${isDark ? '#444' : '#ccc'}`,
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.15s',
  };

  const activeStyle: React.CSSProperties = {
    ...buttonBase,
    backgroundColor: isDark ? '#5470C6' : '#5470C6',
    color: '#fff',
    borderColor: '#5470C6',
  };

  const inactiveStyle: React.CSSProperties = {
    ...buttonBase,
    backgroundColor: isDark ? '#1a1a2e' : '#fff',
    color: isDark ? '#e0e0e0' : '#333',
  };

  return (
    <div data-testid="theme-switcher" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 13, color: isDark ? '#aaa' : '#666', marginRight: 4 }}>Theme:</span>
      <button
        onClick={() => onChange('light')}
        style={mode === 'light' ? activeStyle : inactiveStyle}
      >
        Light
      </button>
      <button
        onClick={() => onChange('dark')}
        style={mode === 'dark' ? activeStyle : inactiveStyle}
      >
        Dark
      </button>
    </div>
  );
}
