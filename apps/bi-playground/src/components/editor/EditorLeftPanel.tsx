import { useRef, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { Tabs } from 'antd';
import { CodeOutlined, NotificationOutlined } from '@ant-design/icons';
import { useEditorStore, useThemeStore } from '@/stores';
import { EditorToolbar } from './EditorToolbar';
import { EventLogPanel } from '../demo/EventLogPanel';
import type { ChangeEvent } from '../demo/EventLogPanel';
import { setupMonacoDsl } from './monaco-setup';
import styles from './DslEditor.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditorActions {
  getAction(id: string): { run(): void } | null;
}

interface EditorLeftPanelProps {
  readonly events?: ChangeEvent[];
  readonly onClearEvents?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HISTORY_INTERVAL = 5;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorLeftPanel({ events, onClearEvents }: EditorLeftPanelProps): React.ReactElement {
  const { dsl, setDsl, pushHistory, fontSize, wordWrap } = useEditorStore();
  const themeMode = useThemeStore((s) => s.mode);

  const editorRef = useRef<EditorActions | null>(null);
  const changeCountRef = useRef(0);

  const handleMount: OnMount = useCallback((editorInstance, monaco) => {
    editorRef.current = editorInstance;
    setupMonacoDsl(monaco);
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      const next = value ?? '';
      setDsl(next);

      changeCountRef.current += 1;
      if (changeCountRef.current >= HISTORY_INTERVAL) {
        pushHistory(next);
        changeCountRef.current = 0;
      }
    },
    [setDsl, pushHistory],
  );

  const monacoTheme = themeMode === 'dark' ? 'vs-dark' : 'light';

  const tabItems = [
    {
      key: 'dsl',
      label: (
        <span>
          <CodeOutlined style={{ marginRight: 4 }} />
          DSL
        </span>
      ),
      children: (
        <div className={styles.editorArea}>
          <Editor
            language="json"
            theme={monacoTheme}
            value={dsl}
            onChange={handleChange}
            onMount={handleMount}
            options={{
              fontSize,
              wordWrap,
              minimap: { enabled: false },
              lineNumbers: 'on',
              folding: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      ),
    },
    {
      key: 'events',
      label: (
        <span>
          <NotificationOutlined style={{ marginRight: 4 }} />
          事件日志
        </span>
      ),
      children: (
        <div className={styles.eventLogArea}>
          <EventLogPanel standalone events={events} onClearEvents={onClearEvents} />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <EditorToolbar editorRef={editorRef.current} />
      <Tabs
        className={styles.tabs}
        items={tabItems}
        size="small"
        tabBarStyle={{ padding: '0 12px', margin: 0 }}
      />
    </div>
  );
}

export type { ChangeEvent };
