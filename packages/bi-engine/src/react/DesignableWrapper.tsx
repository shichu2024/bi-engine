// ============================================================================
// react/DesignableWrapper.tsx — 设计态包装器
// ============================================================================

import { useRenderMode, RenderMode } from '../platform/render-mode';
import { useSelection } from '../design/selection-context';
import { useChartTheme } from '../theme/chart-theme-context';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DesignableWrapperProps {
  children: React.ReactNode;
  componentId: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (componentId: string) => void;
}

// ---------------------------------------------------------------------------
// DesignableWrapper
// ---------------------------------------------------------------------------

/**
 * 设计态包装器。
 *
 * - RUNTIME：不添加额外 DOM 层，直接渲染 children。
 * - DESIGN：包裹一层 div，添加 data 属性、选中边框、拖拽手柄占位。
 */
export function DesignableWrapper({
  children,
  componentId,
  className,
  style,
  onClick,
}: DesignableWrapperProps): React.ReactNode {
  const mode = useRenderMode();
  const { selectedId, select } = useSelection();
  const { tokens: t } = useChartTheme();
  const isSelected = selectedId === componentId;

  // RUNTIME：零开销，直接渲染 children
  if (mode === RenderMode.RUNTIME) {
    return <>{children}</>;
  }

  // DESIGN：包裹交互层
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    select(componentId);
    onClick?.(componentId);
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    ...(isSelected ? {
      outline: `2px solid ${t.border.selectedColor}`,
      outlineOffset: '-2px',
    } : {}),
    ...style,
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      onClick={handleClick}
      data-component-id={componentId}
      data-render-mode={mode}
    >
      {children}
      {isSelected && <DesignOverlay componentId={componentId} color={t.border.selectedColor} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DesignOverlay — 拖拽手柄与操作按钮占位
// ---------------------------------------------------------------------------

function DesignOverlay({ componentId, color }: { componentId: string; color: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* 四角拖拽手柄占位 */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
        <div
          key={pos}
          data-position={pos}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            background: color,
            pointerEvents: 'auto',
            ...(pos.includes('t') ? { top: -4 } : { bottom: -4 }),
            ...(pos.includes('l') ? { left: -4 } : { right: -4 }),
          }}
        />
      ))}
    </div>
  );
}
