import { useState } from 'react';
import { Button, Empty } from 'antd';
import { ClearOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChangeEvent {
  id: string;
  timestamp: number;
  source: string;
  summary: string;
}

interface EventLogPanelProps {
  readonly standalone?: boolean;
  /** 外部传入的事件列表（编辑器页签模式） */
  readonly events?: ChangeEvent[];
  readonly onClearEvents?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventLogPanel({
  standalone = false,
  events: externalEvents,
  onClearEvents,
}: EventLogPanelProps): React.ReactElement | null {
  const [internalEvents, setInternalEvents] = useState<ChangeEvent[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  // 使用外部事件或内部事件
  const events = externalEvents ?? internalEvents;
  const clearEvents = onClearEvents ?? (() => setInternalEvents([]));

  if (!standalone && events.length === 0 && collapsed) {
    return null;
  }

  // Standalone mode: fill parent container
  if (standalone) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', color: '#666' }}>
            onChange 事件日志 ({events.length})
          </span>
          {events.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={clearEvents}
            >
              清除
            </Button>
          )}
        </div>

        {events.length > 0 ? (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: 11,
              fontFamily: 'monospace',
              background: '#f5f5f5',
              borderRadius: 4,
              padding: 8,
            }}
          >
            {events.map((evt) => (
              <div key={evt.id} style={{ marginBottom: 4, borderBottom: '1px solid #e0e0e0', paddingBottom: 4 }}>
                <span style={{ color: '#999' }}>
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
                {' '}
                <span style={{
                  color: evt.source === 'text-edit' ? '#1890ff' : '#52c41a',
                  fontWeight: 'bold',
                }}>
                  [{evt.source}]
                </span>
                {' '}
                <span>{evt.summary}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无事件"
            style={{ marginTop: 40 }}
          >
            <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
              开启设计态编辑文本或切换图表类型触发 onChange
            </p>
          </Empty>
        )}
      </div>
    );
  }

  // Inline mode (used in SceneDemoPage)
  return (
    <div style={{ marginTop: 8, borderTop: '1px solid #e8e8e8', paddingTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 'bold', color: '#666' }}>
          onChange 事件日志 ({events.length})
        </span>
        <Button
          type="text"
          size="small"
          icon={collapsed ? <DownOutlined /> : <UpOutlined />}
          onClick={() => setCollapsed((v) => !v)}
        />
        {events.length > 0 && (
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={clearEvents}
          >
            清除
          </Button>
        )}
      </div>

      {!collapsed && events.length > 0 && (
        <div
          style={{
            maxHeight: 150,
            overflowY: 'auto',
            fontSize: 11,
            fontFamily: 'monospace',
            background: '#f5f5f5',
            borderRadius: 4,
            padding: 8,
          }}
        >
          {events.map((evt) => (
            <div key={evt.id} style={{ marginBottom: 4, borderBottom: '1px solid #e0e0e0', paddingBottom: 4 }}>
              <span style={{ color: '#999' }}>
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
              {' '}
              <span style={{
                color: evt.source === 'text-edit' ? '#1890ff' : '#52c41a',
                fontWeight: 'bold',
              }}>
                [{evt.source}]
              </span>
              {' '}
              <span>{evt.summary}</span>
            </div>
          ))}
        </div>
      )}

      {!collapsed && events.length === 0 && (
        <div style={{ fontSize: 11, color: '#999', padding: 4 }}>
          暂无事件。开启设计态编辑文本或切换图表类型触发 onChange。
        </div>
      )}
    </div>
  );
}
