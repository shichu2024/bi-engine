import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUnifiedFixtureById } from 'bi-engine/testing';
import { DslEditor } from '@/components/editor/DslEditor';
import { LivePreview } from '@/components/editor/LivePreview';
import { SplitPane } from '@/components/editor/SplitPane';
import { useEditorStore } from '@/stores';
import styles from './EditorPage.module.css';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorPage(): React.ReactElement {
  const { componentId, sceneId } = useParams<{
    readonly componentId: string;
    readonly sceneId: string;
  }>();

  const initDsl = useEditorStore((s) => s.initDsl);

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

  return (
    <div data-testid="editor-page" className={styles.editorPage}>
      <SplitPane
        left={<DslEditor />}
        right={<LivePreview />}
      />
    </div>
  );
}
