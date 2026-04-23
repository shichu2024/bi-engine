import type { FixtureEntry } from 'bi-engine/testing';

interface FixtureSelectorProps {
  readonly fixtures: readonly FixtureEntry[];
  readonly selected: FixtureEntry;
  readonly onChange: (fixture: FixtureEntry) => void;
  readonly isDark: boolean;
}

export function FixtureSelector({
  fixtures,
  selected,
  onChange,
  isDark,
}: FixtureSelectorProps): React.ReactElement {
  const selectStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 6,
    border: `1px solid ${isDark ? '#444' : '#ccc'}`,
    backgroundColor: isDark ? '#1a1a2e' : '#fff',
    color: isDark ? '#e0e0e0' : '#333',
    fontSize: 14,
    minWidth: 220,
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = fixtures.find((f) => f.id === e.target.value);
    if (found !== undefined) {
      onChange(found);
    }
  };

  return (
    <label data-testid="fixture-selector" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: isDark ? '#aaa' : '#666' }}>Fixture:</span>
      <select
        value={selected.id}
        onChange={handleChange}
        style={selectStyle}
      >
        {fixtures.map((f) => (
          <option key={f.id} value={f.id}>
            {f.id}
          </option>
        ))}
      </select>
    </label>
  );
}
