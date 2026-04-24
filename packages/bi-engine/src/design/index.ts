// ============================================================================
// design/index.ts — 设计态公共导出
// ============================================================================

export {
  SelectionProvider,
  useSelection,
  type SelectionProviderProps,
} from './selection-context';

export {
  DesignableWrapper,
  type DesignableWrapperProps,
} from '../react/DesignableWrapper';

export {
  isGridLayout,
  isAbsoluteLayout,
  getComponentDisplayName,
  getComponentIcon,
} from './utils';
