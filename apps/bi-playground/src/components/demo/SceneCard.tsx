import { useState, type ReactNode } from 'react';
import { Card, Typography, Button } from 'antd';
import { CodeOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import type { SceneItem } from './SceneCardList';
import styles from './SceneDemo.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SceneCardProps {
  readonly scene: SceneItem;
  readonly children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SceneCard({
  scene,
  children,
}: SceneCardProps): React.ReactElement {
  const [codeExpanded, setCodeExpanded] = useState(false);

  return (
    <Card
      className={styles.sceneCard}
      data-testid={`scene-card-${scene.id}`}
    >
      {/* Title bar */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderContent}>
          <Typography.Text strong className={styles.cardTitle}>
            {scene.title}
          </Typography.Text>
          {scene.description && (
            <Typography.Text type="secondary" className={styles.cardDescription}>
              {scene.description}
            </Typography.Text>
          )}
        </div>
      </div>

      {/* Preview area - always visible */}
      <div className={styles.previewArea}>
        {children}
      </div>

      {/* Bottom bar - toggle code */}
      <div className={styles.bottomBar}>
        <Button
          type="text"
          size="small"
          icon={<CodeOutlined />}
          onClick={() => setCodeExpanded((prev) => !prev)}
          className={styles.toggleCodeBtn}
        >
          {codeExpanded ? '收起代码' : '展开代码'}
          {codeExpanded ? <UpOutlined /> : <DownOutlined />}
        </Button>
      </div>
    </Card>
  );
}
