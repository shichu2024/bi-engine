import { useCallback, useEffect } from 'react';
import { Button, Select, Space, Switch, Tooltip } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  SunOutlined,
  MoonOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useThemeStore, useViewportStore } from '@/stores';
import styles from './LivePreview.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PreviewToolbarProps {
  readonly isFullscreen: boolean;
  readonly onFullscreenChange: (fullscreen: boolean) => void;
  readonly disableAnimation: boolean;
  readonly onDisableAnimationChange: (disabled: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PreviewToolbar({
  isFullscreen,
  onFullscreenChange,
  disableAnimation,
  onDisableAnimationChange,
}: PreviewToolbarProps): React.ReactElement {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const viewports = useViewportStore((s) => s.viewports);
  const selectedIndex = useViewportStore((s) => s.selectedIndex);
  const setSelectedIndex = useViewportStore((s) => s.setSelectedIndex);

  const handleFullscreenToggle = useCallback(() => {
    onFullscreenChange(!isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  const handleAnimationToggle = useCallback(
    (checked: boolean) => {
      onDisableAnimationChange(!checked);
    },
    [onDisableAnimationChange],
  );

  const handleViewportChange = useCallback(
    (value: number) => {
      setSelectedIndex(value);
    },
    [setSelectedIndex],
  );

  // ESC to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFullscreenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onFullscreenChange]);

  const viewportOptions = viewports.map((vp, idx) => ({
    value: idx,
    label: `${vp.label} (${vp.width || 'auto'}x${vp.height})`,
  }));

  return (
    <div className={styles.toolbar}>
      <Space size={4}>
        <Tooltip title={isFullscreen ? '退出全屏' : '全屏预览'}>
          <Button
            type="text"
            size="small"
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={handleFullscreenToggle}
          />
        </Tooltip>

        <Tooltip title={mode === 'dark' ? '切换为亮色主题' : '切换为暗色主题'}>
          <Switch
            checkedChildren={<SunOutlined />}
            unCheckedChildren={<MoonOutlined />}
            checked={mode === 'dark'}
            onChange={toggleMode}
          />
        </Tooltip>

        <Select
          size="small"
          value={selectedIndex}
          options={viewportOptions}
          onChange={handleViewportChange}
          style={{ minWidth: 180 }}
        />

        <Tooltip title={disableAnimation ? '启用动画' : '禁用动画'}>
          <Switch
            checkedChildren={<StopOutlined />}
            unCheckedChildren={<StopOutlined />}
            checked={disableAnimation}
            onChange={handleAnimationToggle}
          />
        </Tooltip>
      </Space>

      <div className={styles.toolbarSpacer} />
    </div>
  );
}
