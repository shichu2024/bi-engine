/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableFilter } from '../../component-handlers/table/useTableFilter';

const data = [
  { name: '张三', city: '北京', age: 22 },
  { name: '李四', city: '上海', age: 20 },
  { name: '王五', city: '广州', age: 24 },
  { name: '赵六', city: '北京', age: 21 },
];

describe('useTableFilter', () => {
  it('returns all data when no filters set', () => {
    const { result } = renderHook(() => useTableFilter(data));
    expect(result.current.filteredData).toEqual(data);
  });

  it('filters by single column', () => {
    const { result } = renderHook(() => useTableFilter(data));
    act(() => result.current.setFilter('city', '北京'));
    expect(result.current.filteredData).toHaveLength(2);
    expect(result.current.filteredData.every((r) => r.city === '北京')).toBe(true);
  });

  it('filters case-insensitively', () => {
    const { result } = renderHook(() => useTableFilter(data));
    act(() => result.current.setFilter('city', '上海'));
    expect(result.current.filteredData).toHaveLength(1);
  });

  it('intersects multiple column filters', () => {
    const { result } = renderHook(() => useTableFilter(data));
    act(() => result.current.setFilter('city', '北京'));
    act(() => result.current.setFilter('name', '张'));
    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.filteredData[0].name).toBe('张三');
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useTableFilter(data));
    act(() => result.current.setFilter('city', '北京'));
    expect(result.current.filteredData).toHaveLength(2);
    act(() => result.current.clearFilters());
    expect(result.current.filteredData).toHaveLength(4);
  });

  it('returns empty when no matches', () => {
    const { result } = renderHook(() => useTableFilter(data));
    act(() => result.current.setFilter('city', '不存在'));
    expect(result.current.filteredData).toHaveLength(0);
  });

  it('does not filter with empty keyword', () => {
    const { result } = renderHook(() => useTableFilter(data));
    act(() => result.current.setFilter('city', ''));
    expect(result.current.filteredData).toEqual(data);
  });
});
