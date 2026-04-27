// ============================================================================
// component-handlers/chart/chart-icons.tsx — 图表类型 SVG 图标 (IconPark)
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
// Icon Components — Source: https://github.com/bytedance/IconPark
// ---------------------------------------------------------------------------

/** chart-histogram */
export function BarIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6V42H42" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 30V34" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 22V34" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 6V34" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 14V34" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** chart-line */
export function LineIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6V42H42" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 34L22 18L32 27L42 6" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** chart-line-area */
export function AreaIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6V42H42" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 34L22 18L32 27L42 6V34H14Z" fill={c} stroke={c} strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

/** table-file (outline) */
export function TableIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="40" height="36" rx="2" stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M4 18H44" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M17.5 18V42" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M30.5 18V42" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M4 30H44" stroke={c} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** chart-pie */
export function PieIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4V24H44Z"
        fill={c} stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M43.0844 18H30V4.91553C36.2202 6.86917 41.1308 11.7798 43.0844 18Z"
        fill={c} stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/** chart-scatter */
export function ScatterIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6V42H42" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path fillRule="evenodd" clipRule="evenodd" d="M20 24C22.2091 24 24 22.2091 24 20C24 17.7909 22.2091 16 20 16C17.7909 16 16 17.7909 16 20C16 22.2091 17.7909 24 20 24Z" fill={c} />
      <path fillRule="evenodd" clipRule="evenodd" d="M37 16C39.7614 16 42 13.7614 42 11C42 8.23858 39.7614 6 37 6C34.2386 6 32 8.23858 32 11C32 13.7614 34.2386 16 37 16Z" fill={c} />
      <path fillRule="evenodd" clipRule="evenodd" d="M15 36C16.6569 36 18 34.6569 18 33C18 31.3431 16.6569 30 15 30C13.3431 30 12 31.3431 12 33C12 34.6569 13.3431 36 15 36Z" fill={c} />
      <path fillRule="evenodd" clipRule="evenodd" d="M33 32C34.6569 32 36 30.6569 36 29C36 27.3431 34.6569 26 33 26C31.3431 26 30 27.3431 30 29C30 30.6569 31.3431 32 33 32Z" fill={c} />
    </svg>
  );
}

/** radar-chart */
export function RadarIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 3L45.8741 18.8926L38 45H10L2.12549 18.8926L24 3Z" fill={c} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M38 45L31 37" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 45L17 37" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 19L12 22" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 19L36 22" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 3V13" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 13L30.0073 17.5706L36 22L31 37H17L12 22L17.9927 17.5706L24 13Z" fill={c} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M7.59406 14.9194L2.12549 18.8926L4.09412 25.4194" stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M8.03125 38.4731L9.99988 45H16.9999" stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M31 45H38L39.9685 38.4731" stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M40.4053 14.9194L45.8738 18.8926L43.9053 25.4194" stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M29.4684 6.97315L24 3L18.5312 6.97315" stroke={c} strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

/** dashboard-one */
export function GaugeIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 7C13 7 4 16 4 27C4 32.2 5.7 37.4 9 41H39C42.3 37.4 44 32.2 44 27C44 16 35 7 24 7Z" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="30" r="4" fill={c} stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 20V26" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 12V14" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 28H11" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 18L14.4 19.4" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M37 28H39" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 19.4L35.4 18" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** chart-stock */
export function CandlestickIcon({ color }: ChartIconProps): React.ReactElement {
  const c = color ?? 'currentColor';
  return (
    <svg viewBox="0 0 48 48" width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="16" width="8" height="16" fill={c} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M10 6V16" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 32V42" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="34" y="16" width="8" height="16" fill={c} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M38 6V16" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 32V42" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="20" y="14" width="8" height="16" fill={c} stroke={c} strokeWidth="4" strokeLinejoin="round" />
      <path d="M24 4V14" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 30V40" stroke={c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
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
