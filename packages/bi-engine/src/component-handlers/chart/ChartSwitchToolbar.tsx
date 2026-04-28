// ============================================================================
// component-handlers/chart/ChartSwitchToolbar.tsx — 图表类型切换按钮组
// ============================================================================

import { useMemo, useCallback } from 'react';
import type { ThemeTokens } from '../../theme/theme-tokens';
import { DEFAULT_THEME_TOKENS } from '../../theme/theme-tokens';
import type { SwitchTarget } from './chart-switch';
import { CHART_TYPE_ICONS } from './chart-icons';
import { useLocale } from '../../locale';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartSwitchToolbarProps {
  /** 当前展示类型 */
  currentType: string;
  /** 可切换的目标列表 */
  switchableTypes: SwitchTarget[];
  /** 切换回调 */
  onSwitch: (target: SwitchTarget) => void;
  /** 主题 */
  theme?: ThemeTokens;
}

// ---------------------------------------------------------------------------
// Style factory
// ---------------------------------------------------------------------------

function createToolbarStyles(t: ThemeTokens) {
  return {
    icons: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      flexShrink: 0,
      padding: 2,
      backgroundColor: t.border.dividerColor,
      borderRadius: t.border.radius,
    } as React.CSSProperties,
    iconBtn: (active: boolean): React.CSSProperties => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: t.border.radius,
      border: 'none',
      cursor: active ? 'default' : 'pointer',
      background: active ? t.table.selectedBg : 'transparent',
      color: active ? t.semantic.info : t.font.tertiaryColor,
      transition: 'background-color 0.15s, color 0.15s',
    }),
  };
}

// ---------------------------------------------------------------------------
// ChartSwitchToolbar
// ---------------------------------------------------------------------------

export function ChartSwitchToolbar({
  currentType,
  switchableTypes,
  onSwitch,
  theme,
}: ChartSwitchToolbarProps): React.ReactElement | null {
  const t = theme ?? DEFAULT_THEME_TOKENS;
  const locale = useLocale();
  const styles = useMemo(() => createToolbarStyles(t), [t]);

  const resolveLabel = useCallback(
    (target: SwitchTarget): string => {
      const key = target.labelKey as keyof typeof locale.chart.type;
      return locale.chart.type[key] ?? target.labelKey;
    },
    [locale],
  );

  const handleClick = useCallback(
    (target: SwitchTarget) => {
      if (target.type !== currentType) {
        onSwitch(target);
      }
    },
    [currentType, onSwitch],
  );

  if (switchableTypes.length === 0) return null;

  return (
    <div style={styles.icons}>
      {switchableTypes.map((target) => {
        const IconComponent = CHART_TYPE_ICONS[target.type];
        if (!IconComponent) return null;
        const isActive = target.type === currentType;
        const label = resolveLabel(target);

        return (
          <button
            key={target.type}
            title={label}
            style={styles.iconBtn(isActive)}
            onClick={() => handleClick(target)}
            type="button"
          >
            <IconComponent active={isActive} color={isActive ? t.semantic.info : t.font.tertiaryColor} />
          </button>
        );
      })}
    </div>
  );
}
