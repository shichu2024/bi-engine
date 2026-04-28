import { useState, useCallback, useMemo } from 'react';
import type { BIEngineComponent, BITheme, ColumnRenderer } from 'bi-engine';
import { BIEngine } from 'bi-engine';
import { useThemeStore, useLocaleStore } from '@/stores';
import styles from './SceneDetail.module.css';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InteractivePreviewProps {
  readonly component: BIEngineComponent;
  readonly description: string;
  readonly toolbar?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InteractivePreview({
  component,
  toolbar,
}: InteractivePreviewProps): React.ReactElement {
  const themeMode = useThemeStore((s) => s.mode);
  const theme: BITheme = themeMode === 'dark' ? 'dark' : 'light';
  const locale = useLocaleStore((s) => s.locale);
  const isTable = component.type === 'table';

  const [localSchema, setLocalSchema] = useState<BIEngineComponent>(component);

  // 自定义列渲染函数（仅 table-custom-render fixture 使用）
  const columnRenderers = useMemo<Record<string, ColumnRenderer> | undefined>(() => {
    if (component.id !== 'table-custom-render') return undefined;
    const statusColors: Record<string, string> = {
      completed: '#52c41a',
      in_progress: '#fa8c16',
      pending: '#d9d9d9',
    };
    const statusLabels: Record<string, string> = {
      completed: '已完成',
      in_progress: '进行中',
      pending: '待开始',
    };
    return {
      status: (value) => {
        const s = String(value ?? '');
        return (
          <span style={{ color: statusColors[s] ?? '#333', fontWeight: 500 }}>
            {statusLabels[s] ?? s}
          </span>
        );
      },
      progress: (value) => {
        const n = Number(value ?? 0);
        const color = n === 100 ? '#52c41a' : n > 50 ? '#fa8c16' : '#1890ff';
        return (
          <span style={{ color, fontWeight: 500 }}>
            {n}%
          </span>
        );
      },
      link: (_value) => {
        return (
          <span style={{ color: '#1890ff', textDecoration: 'underline', cursor: 'pointer' }}>
            查看
          </span>
        );
      },
    };
  }, [component.id]);

  const handleChange = useCallback(
    (newSchema: BIEngineComponent) => {
      setLocalSchema(newSchema);
    },
    [],
  );

  return (
    <div
      className={isTable ? styles.previewContainerTable : styles.previewContainer}
      data-testid="interactive-preview"
    >
      {toolbar && <div style={{ marginBottom: 8 }}>{toolbar}</div>}
      <BIEngine
        schema={localSchema}
        mode="chat"
        theme={theme}
        locale={locale}
        onChange={handleChange}
        columnRenderers={columnRenderers}
      />
    </div>
  );
}
