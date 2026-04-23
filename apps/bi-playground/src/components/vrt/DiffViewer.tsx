import { Typography, Image, Statistic, Button, Space } from 'antd';
import {
  CheckCircleOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import styles from './Vrt.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DiffInfo {
  pixelCount: number;
  percentage: number;
}

export interface DiffViewerProps {
  readonly baselineDataURL: string;
  readonly currentDataURL: string;
  readonly diffImageDataURL: string;
  readonly diffInfo: DiffInfo;
  readonly onUpdateBaseline?: () => void;
  readonly onOpenEditor?: () => void;
  readonly onIgnore?: () => void;
  readonly onRetest?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DiffViewer({
  baselineDataURL,
  currentDataURL,
  diffImageDataURL,
  diffInfo,
  onUpdateBaseline,
  onOpenEditor,
  onIgnore,
  onRetest,
}: DiffViewerProps): React.ReactElement {
  return (
    <div className={styles.diffViewerContainer}>
      {/* Three-column image comparison */}
      <div className={styles.imageGrid}>
        <div className={styles.imageColumn}>
          <Typography.Text className={styles.imageColumnTitle}>
            基准图
          </Typography.Text>
          <Image
            src={baselineDataURL}
            alt="Baseline"
            className={styles.normalImage}
            style={{ width: '100%' }}
          />
        </div>

        <div className={styles.imageColumn}>
          <Typography.Text className={styles.imageColumnTitle}>
            当前截图
          </Typography.Text>
          <Image
            src={currentDataURL}
            alt="Current screenshot"
            className={styles.normalImage}
            style={{ width: '100%' }}
          />
        </div>

        <div className={styles.imageColumn}>
          <Typography.Text
            className={`${styles.imageColumnTitle} ${styles.diffImageColumnTitle}`}
          >
            差异高亮图
          </Typography.Text>
          <Image
            src={diffImageDataURL}
            alt="Diff highlight"
            className={styles.diffImage}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Diff statistics */}
      <div className={styles.diffStatsRow}>
        <Statistic
          title="差异像素数"
          value={diffInfo.pixelCount}
          valueStyle={{ fontSize: 18 }}
        />
        <Statistic
          title="差异百分比"
          value={diffInfo.percentage}
          precision={2}
          suffix="%"
          valueStyle={{
            fontSize: 18,
            color: diffInfo.percentage > 0 ? '#cf1322' : undefined,
          }}
        />
      </div>

      {/* Action buttons */}
      <div className={styles.actionBar}>
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onUpdateBaseline}
          >
            更新基准图
          </Button>
          <Button icon={<EditOutlined />} onClick={onOpenEditor}>
            跳转编辑器
          </Button>
          <Button icon={<EyeInvisibleOutlined />} onClick={onIgnore}>
            忽略差异
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRetest}>
            重新测试
          </Button>
        </Space>
      </div>
    </div>
  );
}
