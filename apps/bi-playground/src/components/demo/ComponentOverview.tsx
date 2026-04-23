import { Typography, Tag, Button, Space } from 'antd';
import { BookOutlined } from '@ant-design/icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComponentOverviewProps {
  readonly componentName: string;
  readonly description: string;
  readonly version?: string;
  readonly tags?: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ComponentOverview({
  componentName,
  description,
  version,
  tags,
}: ComponentOverviewProps): React.ReactElement {
  return (
    <div data-testid="component-overview">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Space align="center" size="small">
            <Typography.Title level={3} style={{ margin: 0 }}>
              {componentName}
            </Typography.Title>
            {version && <Tag color="blue">{version}</Tag>}
          </Space>
        </div>

        <Typography.Paragraph type="secondary">
          {description}
        </Typography.Paragraph>

        {tags && tags.length > 0 && (
          <div data-testid="component-overview-tags">
            <Space size={[4, 8]} wrap>
              {tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </div>
        )}

        <div>
          <Button
            type="link"
            icon={<BookOutlined />}
            href="#"
            data-testid="component-overview-api-link"
          >
            View Full API Documentation
          </Button>
        </div>
      </Space>
    </div>
  );
}
