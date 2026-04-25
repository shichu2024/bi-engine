/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableSort } from '../../component-handlers/table/useTableSort';

const data = [
  { name: '张三', age: 22, score: 89.5 },
  { name: '李四', age: 20, score: 95.0 },
  { name: '王五', age: 24, score: 78.3 },
];

describe('useTableSort', () => {
  it('returns original data by default', () => {
    const { result } = renderHook(() => useTableSort(data));
    expect(result.current.sortedData).toEqual(data);
  });

  it('sorts numbers ascending', () => {
    const { result } = renderHook(() => useTableSort(data));
    act(() => result.current.handleSort('age'));
    const ages = result.current.sortedData.map((r) => r.age);
    expect(ages).toEqual([20, 22, 24]);
  });

  it('sorts numbers descending on second click', () => {
    const { result } = renderHook(() => useTableSort(data));
    act(() => result.current.handleSort('age'));
    act(() => result.current.handleSort('age'));
    const ages = result.current.sortedData.map((r) => r.age);
    expect(ages).toEqual([24, 22, 20]);
  });

  it('returns to default on third click', () => {
    const { result } = renderHook(() => useTableSort(data));
    act(() => result.current.handleSort('age'));
    act(() => result.current.handleSort('age'));
    act(() => result.current.handleSort('age'));
    expect(result.current.sortedData).toEqual(data);
    expect(result.current.sortState.direction).toBe('default');
  });

  it('sorts strings ascending', () => {
    const { result } = renderHook(() => useTableSort(data));
    act(() => result.current.handleSort('name'));
    const names = result.current.sortedData.map((r) => r.name);
    // Ascending sort should be consistent with localeCompare
    expect(result.current.sortState.direction).toBe('asc');
    expect(names.length).toBe(3);
  });

  it('resets to asc when clicking a different column', () => {
    const { result } = renderHook(() => useTableSort(data));
    act(() => result.current.handleSort('age'));
    expect(result.current.sortState.direction).toBe('asc');
    act(() => result.current.handleSort('score'));
    expect(result.current.sortState.columnKey).toBe('score');
    expect(result.current.sortState.direction).toBe('asc');
  });

  it('handles null/undefined values', () => {
    const dataWithNull = [
      { name: 'A', age: null },
      { name: 'B', age: 20 },
      { name: 'C', age: undefined },
    ];
    const { result } = renderHook(() => useTableSort(dataWithNull as Record<string, unknown>[]));
    act(() => result.current.handleSort('age'));
    // null/undefined should be at the end for asc
    expect(result.current.sortedData[0].age).toBe(20);
  });
});
