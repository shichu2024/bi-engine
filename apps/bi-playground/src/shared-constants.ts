export type ThemeMode = 'light' | 'dark';

export interface ViewportSize {
  readonly label: string;
  readonly width: number;
  readonly height: number;
}

export const VIEWPORT_SIZES: readonly ViewportSize[] = [
  { label: 'Small (375x300)', width: 375, height: 300 },
  { label: 'Medium (640x480)', width: 640, height: 480 },
  { label: 'Large (960x600)', width: 960, height: 600 },
  { label: 'Full Width', width: 0, height: 500 },
] as const;

export const DARK_PALETTE: readonly string[] = [
  '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE',
  '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#48C9B0',
];

export const LIGHT_PALETTE: readonly string[] = [
  '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE',
  '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#48C9B0',
];
