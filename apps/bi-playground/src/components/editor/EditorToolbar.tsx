import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Popconfirm, Slider, Space, Tooltip, message } from 'antd';
import {
  ArrowLeftOutlined,
  UndoOutlined,
  FormatPainterOutlined,
  CopyOutlined,
  DownloadOutlined,
  SaveOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useEditorStore } from '@/stores';
import styles from './DslEditor.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal interface for the actions we need from the Monaco editor instance. */
interface EditorActions {
  getAction(id: string): { run(): void } | null;
}

interface EditorToolbarProps {
  readonly editorRef: EditorActions | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function downloadAsJson(content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  const filename = `component-scene-${timestamp}.json`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorToolbar({ editorRef }: EditorToolbarProps): React.ReactElement {
  const navigate = useNavigate();
  const { dsl, resetDsl, fontSize, setFontSize } = useEditorStore();

  const handleReset = useCallback(() => {
    resetDsl();
  }, [resetDsl]);

  const handleFormat = useCallback(() => {
    editorRef?.getAction('editor.action.formatDocument')?.run();
  }, [editorRef]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(dsl);
      void message.success('DSL 已复制到剪贴板');
    } catch {
      void message.error('复制失败，请手动复制');
    }
  }, [dsl]);

  const handleExport = useCallback(() => {
    downloadAsJson(dsl);
  }, [dsl]);

  const handleFontSizeChange = useCallback(
    (value: number) => {
      setFontSize(value);
    },
    [setFontSize],
  );

  return (
    <div className={styles.toolbar}>
      <Space size={4}>
        <Tooltip title="返回场景列表">
          <Button type="text" size="small" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} />
        </Tooltip>

        <Popconfirm
          title="确认重置"
          description="将恢复到初始 DSL，当前编辑内容将丢失。"
          onConfirm={handleReset}
          okText="确认"
          cancelText="取消"
        >
          <Tooltip title="重置">
            <Button type="text" size="small" icon={<UndoOutlined />} />
          </Tooltip>
        </Popconfirm>

        <Tooltip title="格式化">
          <Button type="text" size="small" icon={<FormatPainterOutlined />} onClick={handleFormat} />
        </Tooltip>

        <Tooltip title="复制 DSL">
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={handleCopy} />
        </Tooltip>

        <Tooltip title="导出配置">
          <Button type="text" size="small" icon={<DownloadOutlined />} onClick={handleExport} />
        </Tooltip>

        <Tooltip title="待实现">
          <Button type="text" size="small" icon={<SaveOutlined />} disabled>
            保存为测试用例
          </Button>
        </Tooltip>

        <Tooltip title="待实现">
          <Button type="text" size="small" icon={<PlayCircleOutlined />} disabled>
            运行测试
          </Button>
        </Tooltip>
      </Space>

      <div className={styles.toolbarSpacer} />

      <div className={styles.fontSizeGroup}>
        <span className={styles.fontSizeLabel}>字号</span>
        <Slider
          min={10}
          max={24}
          step={1}
          value={fontSize}
          onChange={handleFontSizeChange}
          style={{ width: 100, margin: 0 }}
        />
        <span className={styles.fontSizeLabel}>{fontSize}</span>
      </div>
    </div>
  );
}
