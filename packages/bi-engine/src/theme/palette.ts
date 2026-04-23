// ---------------------------------------------------------------------------
// 图表渲染的默认调色板
// ---------------------------------------------------------------------------

/**
 * 包含 10 种独特、适合色盲人士的默认调色板。
 *
 * 这些颜色经过选择，在常见图表类型（柱状图、折线图、饼图）中
 * 具有足够的对比度和可区分性。
 *
 * 消费者可以通过向 `ChartThemeProvider` 传递自定义调色板来覆盖这些颜色。
 */
export const DEFAULT_PALETTE: readonly string[] = [
  '#5470C6', // 蓝色
  '#91CC75', // 绿色
  '#FAC858', // 金色
  '#EE6666', // 红色
  '#73C0DE', // 青色
  '#3BA272', // 森林绿
  '#FC8452', // 橙色
  '#9A60B4', // 紫色
  '#EA7CCC', // 粉色
  '#48C9B0', // 蓝绿色
] as const;

/**
 * 调色板被视为有效所需的最少颜色数量。
 */
export const MIN_PALETTE_SIZE = 8;

/**
 * 校验自定义调色板是否满足最小数量要求。
 *
 * @param palette - 待校验的调色板。
 * @returns 当调色板至少包含 `MIN_PALETTE_SIZE` 个条目时返回 `true`。
 */
export function isValidPalette(palette: readonly string[]): boolean {
  return palette.length >= MIN_PALETTE_SIZE;
}

/**
 * 按索引解析调色板条目，当索引超出调色板长度时循环回到起始位置。
 *
 * @param palette - 源调色板。
 * @param index   - 从 0 开始的系列索引。
 * @returns 解析位置处的颜色字符串。
 */
export function resolvePaletteColor(
  palette: readonly string[],
  index: number,
): string {
  return palette[index % palette.length];
}
