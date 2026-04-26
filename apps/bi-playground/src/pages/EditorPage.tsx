import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Switch, Tag, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { getUnifiedFixtureById } from 'bi-engine/testing';
import type { BIEngineComponent } from 'bi-engine';
import { BIEngine, ChartThemeProvider, DARK_THEME_TOKENS } from 'bi-engine';
import { EditorLeftPanel } from '@/components/editor/EditorLeftPanel';
import type { ChangeEvent } from '@/components/editor/EditorLeftPanel';
import { SplitPane } from '@/components/editor/SplitPane';
import { useEditorStore, useThemeStore, useLocaleStore } from '@/stores';
import styles from './EditorPage.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DesignMode = 'runtime' | 'design';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorPage(): React.ReactElement {
  const { componentId, sceneId } = useParams<{
    readonly componentId: string;
    readonly sceneId: string;
  }>();

  const initDsl = useEditorStore((s) => s.initDsl);

  // 局部状态：仅在此编辑页面内生效
  const [mode, setMode] = useState<DesignMode>('runtime');
  const [events, setEvents] = useState<ChangeEvent[]>([]);
  const [localSchema, setLocalSchema] = useState<BIEngineComponent | null>(null);

  useEffect(() => {
    const fixtureId = componentId ?? '';
    const fixture = getUnifiedFixtureById(fixtureId);

    if (fixture) {
      initDsl(JSON.stringify(fixture.component, null, 2));
    } else {
      initDsl('');
    }

    return () => {
      initDsl('');
    };
  }, [componentId, sceneId, initDsl]);

  const toggleMode = useCallback(() => {
    setMode((prev) => prev === 'runtime' ? 'design' : 'runtime');
  }, []);

  const addEvent = useCallback((source: string, summary: string) => {
    setEvents((prev) => [
      ...prev,
      { id: `evt-${Date.now()}-${prev.length}`, timestamp: Date.now(), source, summary },
    ]);
  }, []);

  const clearEvents = useCallback(() => setEvents([]), []);

  return (
    <div data-testid="editor-page" className={styles.editorPage}>
      <SplitPane
        left={<EditorLeftPanel events={events} onClearEvents={clearEvents} />}
        right={
          <EditorPreview
            mode={mode}
            toggleMode={toggleMode}
            addEvent={addEvent}
            localSchema={localSchema}
            setLocalSchema={setLocalSchema}
          />
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditorPreview
// ---------------------------------------------------------------------------

interface EditorPreviewProps {
  readonly mode: DesignMode;
  readonly toggleMode: () => void;
  readonly addEvent: (source: string, summary: string) => void;
  readonly localSchema: BIEngineComponent | null;
  readonly setLocalSchema: (schema: BIEngineComponent | null) => void;
}

function EditorPreview({
  mode,
  toggleMode,
  addEvent,
  localSchema,
  setLocalSchema,
}: EditorPreviewProps): React.ReactElement {
  const themeMode = useThemeStore((s) => s.mode);
  const isDark = themeMode === 'dark';
  const locale = useLocaleStore((s) => s.locale);
  const dsl = useEditorStore((s) => s.dsl);

  // Parse DSL
  let parsedComponent: BIEngineComponent | null = null;
  try {
    if (dsl.trim()) {
      parsedComponent = JSON.parse(dsl) as BIEngineComponent;
    }
  } catch {
    parsedComponent = null;
  }

  const activeComponent = localSchema ?? parsedComponent;

  const handleChange = useCallback(
    (newSchema: BIEngineComponent) => {
      setLocalSchema(newSchema);
      const source = newSchema.type === 'text' ? 'text-edit'
        : 'chart-switch';
      const summary = newSchema.type === 'text'
        ? `content → "${(newSchema as { dataProperties: { content: string } }).dataProperties.content.slice(0, 30)}..."`
        : `type → ${newSchema.type}`;
      addEvent(source, summary);
    },
    [addEvent, setLocalSchema],
  );

  // Reset local schema when DSL changes externally
  useEffect(() => {
    setLocalSchema(null);
  }, [dsl, setLocalSchema]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar with mode switch */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        height: 40,
        padding: '0 12px',
        borderBottom: '1px solid var(--editor-border-color, #e0e0e0)',
        backgroundColor: 'var(--editor-toolbar-bg, #fafafa)',
        gap: 8,
      }}>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip title={mode === 'design' ? '当前：设计态（可编辑文本）' : '当前：运行态（只读预览）'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <EyeOutlined style={{ fontSize: 12, color: mode === 'runtime' ? '#1890ff' : '#999' }} />
              <Switch
                size="small"
                checked={mode === 'design'}
                onChange={toggleMode}
              />
              <EditOutlined style={{ fontSize: 12, color: mode === 'design' ? '#1890ff' : '#999' }} />
            </div>
          </Tooltip>
          <Tag color={mode === 'design' ? 'blue' : 'green'} style={{ fontSize: 11, margin: 0 }}>
            {mode === 'design' ? '设计态' : '运行态'}
          </Tag>
        </div>
      </div>

      {/* Preview area */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {activeComponent && activeComponent.type ? (
          <ChartThemeProvider tokens={isDark ? DARK_THEME_TOKENS : undefined}>
            <BIEngine
              schema={activeComponent}
              mode={mode}
              locale={locale}
              onChange={handleChange}
            />
          </ChartThemeProvider>
        ) : (
          <div style={{ color: '#999', textAlign: 'center', paddingTop: 48 }}>
            在左侧编辑器中输入 DSL JSON 以预览
          </div>
        )}
      </div>
    </div>
  );
}
