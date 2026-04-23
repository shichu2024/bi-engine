import { useRef, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useEditorStore, useThemeStore } from '@/stores';
import { EditorToolbar } from './EditorToolbar';
import { setupMonacoDsl } from './monaco-setup';
import styles from './DslEditor.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal interface for the Monaco editor actions used by the toolbar. */
interface EditorActions {
  getAction(id: string): { run(): void } | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HISTORY_INTERVAL = 5;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DslEditor(): React.ReactElement {
  const { dsl, setDsl, pushHistory, fontSize, wordWrap } = useEditorStore();
  const mode = useThemeStore((s) => s.mode);

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

  const monacoTheme = mode === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className={styles.container}>
      <EditorToolbar editorRef={editorRef.current} />
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
    </div>
  );
}
