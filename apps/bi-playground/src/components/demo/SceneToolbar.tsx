import { Space, Button } from 'antd';
import { EditOutlined, ThunderboltOutlined, CameraOutlined } from '@ant-design/icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SceneToolbarProps {
  readonly onOpenEditor: () => void;
  readonly onRunTest?: () => void;
  readonly onGenerateBaseline?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SceneToolbar({
  onOpenEditor,
  onRunTest,
  onGenerateBaseline,
}: SceneToolbarProps): React.ReactElement {
  return (
    <div data-testid="scene-toolbar">
      <Space>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={onOpenEditor}
          data-testid="toolbar-open-editor"
        >
          Open in Editor
        </Button>
        <Button
          icon={<ThunderboltOutlined />}
          onClick={onRunTest}
          disabled
          data-testid="toolbar-run-test"
        >
          Run Test
        </Button>
        <Button
          icon={<CameraOutlined />}
          onClick={onGenerateBaseline}
          disabled
          data-testid="toolbar-generate-baseline"
        >
          Generate Baseline
        </Button>
      </Space>
    </div>
  );
}
