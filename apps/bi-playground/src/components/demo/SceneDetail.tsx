import { useState } from 'react';
import { Button, Space } from 'antd';
import { CodeOutlined, DownOutlined, UpOutlined, EditOutlined } from '@ant-design/icons';
import type { ChartComponent } from 'bi-engine';
import { useThemeStore } from '@/stores';
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
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';
  const [codeVisible, setCodeVisible] = useState(false);

  return (
    <div
      className={styles.sceneDetail}
      data-testid={`scene-detail-${sceneId}-${componentId}`}
    >
      {/* Chart preview - always visible */}
      <InteractivePreview component={component} description={description} />

      {/* Bottom action bar */}
      <div className={styles.actionBar}>
        <Button
          type="text"
          size="small"
          icon={<CodeOutlined />}
          onClick={() => setCodeVisible((prev) => !prev)}
        >
          {codeVisible ? '收起代码' : '展开代码'}
          {codeVisible ? <UpOutlined style={{ marginLeft: 4 }} /> : <DownOutlined style={{ marginLeft: 4 }} />}
        </Button>

        <div className={styles.actionBarSpacer} />

        <Space size={8}>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={onOpenEditor}
          >
            在编辑器中打开
          </Button>
        </Space>
      </div>

      {/* Code section - collapsible */}
      {codeVisible && (
        <div className={styles.codeSection}>
          <DslCodeSnippet dsl={dsl} isDark={isDark} />
        </div>
      )}
    </div>
  );
}
