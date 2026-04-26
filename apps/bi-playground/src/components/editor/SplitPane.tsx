import { useState, useRef, useCallback, useEffect } from 'react';
import { useThemeStore } from '@/stores';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SplitPaneProps {
  readonly left: React.ReactNode;
  readonly right: React.ReactNode;
  readonly defaultRatio?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_RATIO = 0.3;
const MAX_RATIO = 0.7;
const HANDLE_WIDTH = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SplitPane({
  left,
  right,
  defaultRatio = 0.5,
}: SplitPaneProps): React.ReactElement {
  const [ratio, setRatio] = useState(defaultRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = useThemeStore((s) => s.mode) === 'dark';

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const offset = event.clientX - rect.left;
      const nextRatio = offset / rect.width;
      const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, nextRatio));
      setRatio(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const leftStyle: React.CSSProperties = {
    width: `calc(${ratio * 100}% - ${HANDLE_WIDTH / 2}px)`,
    height: '100%',
    overflow: 'hidden',
  };

  const rightStyle: React.CSSProperties = {
    width: `calc(${(1 - ratio) * 100}% - ${HANDLE_WIDTH / 2}px)`,
    height: '100%',
    overflow: 'hidden',
  };

  const handleStyle: React.CSSProperties = {
    width: HANDLE_WIDTH,
    cursor: 'col-resize',
    backgroundColor: isDragging ? '#1890ff' : (isDark ? '#444' : '#e0e0e0'),
    transition: isDragging ? 'none' : 'background-color 0.2s ease',
    flexShrink: 0,
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={leftStyle}>{left}</div>
      <div
        style={handleStyle}
        onMouseDown={handleMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={Math.round(MIN_RATIO * 100)}
        aria-valuemax={Math.round(MAX_RATIO * 100)}
        tabIndex={0}
      />
      <div style={rightStyle}>{right}</div>
    </div>
  );
}
