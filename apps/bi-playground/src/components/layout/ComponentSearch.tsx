import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Input } from 'antd';
import type { InputRef } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useComponentStore } from '@/stores';
import styles from './ComponentSearch.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComponentSearchRef {
  focus: () => void;
}

export interface ComponentSearchProps {
  /** Optional callback fired when the user presses Enter after typing a keyword. */
  onSearch?: (keyword: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Return the list of fixture entries that match the given keyword.
 * Re-uses the same matching logic as ComponentTree for consistency.
 */
function getFilteredComponents(
  components: readonly { readonly id: string; readonly description: string; readonly seriesKind: string }[],
  keyword: string,
) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return components;
  }
  return components.filter(
    (c) =>
      c.id.toLowerCase().includes(normalized) ||
      c.description.toLowerCase().includes(normalized) ||
      c.seriesKind.toLowerCase().includes(normalized),
  );
}

// ---------------------------------------------------------------------------
// ComponentSearch
// ---------------------------------------------------------------------------

export const ComponentSearch = forwardRef<ComponentSearchRef, ComponentSearchProps>(
  function ComponentSearch(props, ref) {
    const { onSearch } = props;

    const searchKeyword = useComponentStore((s) => s.searchKeyword);
    const setSearchKeyword = useComponentStore((s) => s.setSearchKeyword);
    const components = useComponentStore((s) => s.components);
    const selectComponent = useComponentStore((s) => s.selectComponent);

    const inputRef = useRef<InputRef>(null);

    // -- Expose focus() to parent via ref ------------------------------------

    useImperativeHandle(ref, () => ({
      focus() {
        inputRef.current?.focus();
      },
    }), []);

    // -- Handlers -----------------------------------------------------------

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchKeyword(e.target.value);
      },
      [setSearchKeyword],
    );

    const handlePressEnter = useCallback(() => {
      onSearch?.(searchKeyword);

      const filtered = getFilteredComponents(components, searchKeyword);
      const firstMatch = filtered[0];
      if (firstMatch) {
        selectComponent(firstMatch.id);
      }
    }, [components, searchKeyword, selectComponent, onSearch]);

    // -- Render -------------------------------------------------------------

    return (
      <div className={styles.searchWrapper}>
        <Input
          ref={inputRef}
          className={styles.searchInput}
          prefix={<SearchOutlined />}
          placeholder="搜索组件..."
          allowClear
          value={searchKeyword}
          onChange={handleChange}
          onPressEnter={handlePressEnter}
        />
      </div>
    );
  },
);
