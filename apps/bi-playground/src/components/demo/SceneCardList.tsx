import { Empty } from 'antd';
import type { ReactNode } from 'react';
import { SceneCard } from './SceneCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SceneItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly thumbnail?: string;
}

interface SceneCardListProps {
  readonly scenes: SceneItem[];
  readonly children: (sceneId: string) => ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SceneCardList({
  scenes,
  children,
}: SceneCardListProps): React.ReactElement {
  if (scenes.length === 0) {
    return (
      <Empty
        description="No scenes available"
        data-testid="scene-card-list-empty"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} data-testid="scene-card-list">
      {scenes.map((scene) => (
        <SceneCard key={scene.id} scene={scene}>
          {children(scene.id)}
        </SceneCard>
      ))}
    </div>
  );
}
