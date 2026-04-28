import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Segmented, Tag, Tooltip } from 'antd';
import { getUnifiedFixtureById } from 'bi-engine/testing';
import type { BIEngineComponent, BITheme } from 'bi-engine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PlaygroundMode = 'chat' | 'edit' | 'view';
import { BIEngine } from 'bi-engine';
import { EditorLeftPanel } from '@/components/editor/EditorLeftPanel';
import type { ChangeEvent } from '@/components/editor/EditorLeftPanel';
import { SplitPane } from '@/components/editor/SplitPane';
import { useEditorStore, useThemeStore, useLocaleStore } from '@/stores';
import styles from './EditorPage.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditorPreviewProps {
  readonly mode: PlaygroundMode;
  readonly setMode: (mode: PlaygroundMode) => void;
  readonly addEvent: (source: string, summary: string) => void;
  readonly localSchema: BIEngineComponent | null;
  readonly setLocalSchema: (schema: BIEngineComponent | null) => void;
}

// ---------------------------------------------------------------------------
// Mode config
// ---------------------------------------------------------------------------

const MODE_OPTIONS = [
  { label: 'Chat', value: 'chat' as PlaygroundMode },
  { label: 'Edit', value: 'edit' as PlaygroundMode },
  { label: 'View', value: 'view' as PlaygroundMode },
];

const MODE_TAG_CONFIG: Record<PlaygroundMode, { color: string; text: string }> = {
  chat: { color: 'purple', text: 'Chat' },
  edit: { color: 'blue', text: 'Edit' },
  view: { color: 'green', text: 'View' },
};

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
  const [mode, setMode] = useState<PlaygroundMode>('view');
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
            setMode={setMode}
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

function EditorPreview({
  mode,
  setMode,
  addEvent,
  localSchema,
  setLocalSchema,
}: EditorPreviewProps): React.ReactElement {
  const themeMode = useThemeStore((s) => s.mode);
  const theme: BITheme = themeMode === 'dark' ? 'dark' : 'light';
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

  const tagConfig = MODE_TAG_CONFIG[mode];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar with mode selector */}
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
          <Tooltip title={`当前模式：${tagConfig.text}`}>
            <Segmented
              size="small"
              options={MODE_OPTIONS}
              value={mode}
              onChange={(val) => setMode(val as PlaygroundMode)}
            />
          </Tooltip>
          <Tag color={tagConfig.color} style={{ fontSize: 11, margin: 0 }}>
            {tagConfig.text}
          </Tag>
        </div>
      </div>

      {/* Preview area */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {activeComponent && activeComponent.type ? (
          <BIEngine
            schema={activeComponent}
            mode={mode}
            theme={theme}
            locale={locale}
            onChange={handleChange}
          />
        ) : (
          <div style={{ color: '#999', textAlign: 'center', paddingTop: 48 }}>
            在左侧编辑器中输入 DSL JSON 以预览
          </div>
        )}
      </div>
    </div>
  );
}
