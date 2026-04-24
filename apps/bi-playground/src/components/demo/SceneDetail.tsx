import { useState, useCallback } from 'react';
import { Tooltip } from 'antd';
import {
  EditOutlined,
  CodeOutlined,
  CopyOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import type { ChartComponent } from 'bi-engine';
import { InteractivePreview } from './InteractivePreview';
import { DslCodeSnippet } from './DslCodeSnippet';
import styles from './SceneDetail.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SceneDetailProps {
  readonly component: ChartComponent;
  readonly description: string;
  readonly dsl: string;
  readonly sceneId: string;
  readonly componentId: string;
  readonly onOpenEditor: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SceneDetail({
  component,
  description,
  dsl,
  sceneId,
  componentId,
  onOpenEditor,
}: SceneDetailProps): React.ReactElement {
  const [codeVisible, setCodeVisible] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(dsl).catch(() => { /* ignore */ });
  }, [dsl]);

  return (
    <section
      className={styles.sceneDetail}
      id={`${sceneId}-${componentId}`}
      data-testid={`scene-detail-${sceneId}-${componentId}`}
    >
      {/* Demo area */}
      <div className={styles.demoArea}>
        <InteractivePreview component={component} description={description} />
      </div>

      {/* Meta area */}
      <div className={styles.metaArea}>
        <p className={styles.descriptionText}>{description}</p>
        <div className={styles.actionsBar}>
          <Tooltip title="在编辑器中打开">
            <button className={styles.actionButton} onClick={onOpenEditor} aria-label="编辑">
              <EditOutlined />
            </button>
          </Tooltip>
          <Tooltip title={codeVisible ? '收起代码' : '展开代码'}>
            <button
              className={styles.actionButton}
              onClick={() => setCodeVisible((v) => !v)}
              aria-label="代码"
            >
              <CodeOutlined />
            </button>
          </Tooltip>
          <Tooltip title="复制 DSL">
            <button className={styles.actionButton} onClick={handleCopy} aria-label="复制">
              <CopyOutlined />
            </button>
          </Tooltip>
          <Tooltip title="全屏预览">
            <button className={styles.actionButton} onClick={onOpenEditor} aria-label="全屏">
              <ExpandOutlined />
            </button>
          </Tooltip>
        </div>

        {/* Code section — expands below actions bar */}
        {codeVisible && (
          <div className={styles.codeSection}>
            <DslCodeSnippet dsl={dsl} />
          </div>
        )}
      </div>
    </section>
  );
}
