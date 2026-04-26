// ============================================================================
// component-handlers/chart/chart-icons.tsx — 图表类型 SVG 图标
// ============================================================================

import type { FC } from 'react';

// ---------------------------------------------------------------------------
// Icon Props
// ---------------------------------------------------------------------------

export interface ChartIconProps {
  active?: boolean;
  color?: string;
}

// ---------------------------------------------------------------------------
// Icon Components
// ---------------------------------------------------------------------------

export function BarIcon({ color }: ChartIconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill={color ?? 'currentColor'}>
      <rect x="4" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="6" width="4" height="14" rx="1" />
      <rect x="16" y="9" width="4" height="11" rx="1" />
    </svg>
  );
}

export function LineIcon({ color }: ChartIconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={color ?? 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,17 8,11 13,14 21,5" />
    </svg>
  );
}

export function AreaIcon({ color }: ChartIconProps): React.ReactElement {
  const fill = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <path d="M3 17L8 11L13 14L21 5V19H3Z" fill={fill} opacity={0.3} stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TableIcon({ color }: ChartIconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={color ?? 'currentColor'} strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="10" y1="10" x2="10" y2="20" />
      <line x1="15" y1="10" x2="15" y2="20" />
    </svg>
  );
}

export function PieIcon({ color }: ChartIconProps): React.ReactElement {
  const fill = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10h-8V4.5C13.1 2.57 12.57 2 12 2z" fill={fill} opacity={0.3} stroke={fill} strokeWidth="1.5" />
      <path d="M12 2v10h10c0-5.52-4.48-10-10-10z" fill={fill} opacity={0.6} />
    </svg>
  );
}

export function ScatterIcon({ color }: ChartIconProps): React.ReactElement {
  const fill = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <circle cx="6" cy="14" r="2" fill={fill} />
      <circle cx="10" cy="8" r="2" fill={fill} />
      <circle cx="14" cy="12" r="2" fill={fill} />
      <circle cx="18" cy="6" r="2" fill={fill} />
      <circle cx="8" cy="18" r="1.5" fill={fill} opacity={0.6} />
      <circle cx="16" cy="16" r="1.5" fill={fill} opacity={0.6} />
    </svg>
  );
}

export function RadarIcon({ color }: ChartIconProps): React.ReactElement {
  const fill = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <polygon points="12,3 21,10 18,20 6,20 3,10" fill="none" stroke={fill} strokeWidth="1.5" />
      <polygon points="12,7 17,11 15.5,17 8.5,17 7,11" fill={fill} opacity={0.25} stroke={fill} strokeWidth="1" />
    </svg>
  );
}

export function GaugeIcon({ color }: ChartIconProps): React.ReactElement {
  const fill = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <path d="M12 2a10 10 0 0 0-10 10h5a5 5 0 0 1 10 0h5a10 10 0 0 0-10-10z" fill="none" stroke={fill} strokeWidth="1.5" />
      <line x1="12" y1="12" x2="16" y2="7" stroke={fill} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill={fill} />
    </svg>
  );
}

export function CandlestickIcon({ color }: ChartIconProps): React.ReactElement {
  const fill = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={16} height={16}>
      <rect x="5" y="8" width="3" height="8" fill={fill} opacity={0.6} />
      <line x1="6.5" y1="5" x2="6.5" y2="8" stroke={fill} strokeWidth="1" />
      <line x1="6.5" y1="16" x2="6.5" y2="19" stroke={fill} strokeWidth="1" />
      <rect x="10.5" y="6" width="3" height="10" fill={fill} opacity={0.8} />
      <line x1="12" y1="3" x2="12" y2="6" stroke={fill} strokeWidth="1" />
      <line x1="12" y1="16" x2="12" y2="20" stroke={fill} strokeWidth="1" />
      <rect x="16" y="9" width="3" height="6" fill={fill} opacity={0.4} />
      <line x1="17.5" y1="7" x2="17.5" y2="9" stroke={fill} strokeWidth="1" />
      <line x1="17.5" y1="15" x2="17.5" y2="18" stroke={fill} strokeWidth="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Icon Registry
// ---------------------------------------------------------------------------

export const CHART_TYPE_ICONS: Record<string, FC<ChartIconProps>> = {
  bar: BarIcon,
  line: LineIcon,
  area: AreaIcon,
  table: TableIcon,
  pie: PieIcon,
  scatter: ScatterIcon,
  radar: RadarIcon,
  gauge: GaugeIcon,
  candlestick: CandlestickIcon,
};
