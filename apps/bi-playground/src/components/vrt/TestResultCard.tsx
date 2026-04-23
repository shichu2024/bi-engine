import { useState } from 'react';
import { Card, Tag, Progress, Typography } from 'antd';
import type { TestRunResult } from '@/services/vrt';
import { DiffViewer } from './DiffViewer';
import styles from './Vrt.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TestResultCardProps {
  readonly result: TestRunResult;
  readonly baselineDataURL?: string;
  readonly currentDataURL?: string;
  readonly diffImageDataURL?: string;
  readonly onExpand?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatExecTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  } catch {
    return isoString;
  }
}

function getProgressStatus(
  percentage: number,
): 'success' | 'exception' | 'normal' {
  if (percentage === 0) return 'success';
  if (percentage > 5) return 'exception';
  return 'normal';
}

function getProgressColor(percentage: number): string | undefined {
  if (percentage === 0) return '#52c41a';
  if (percentage > 5) return '#ff4d4f';
  return '#faad14';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TestResultCard({
  result,
  baselineDataURL,
  currentDataURL,
  diffImageDataURL,
  onExpand,
}: TestResultCardProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const isPassed = result.status === 'passed';
  const tagColor = isPassed ? 'green' : 'red';
  const tagText = isPassed ? 'passed' : 'failed';

  function handleToggleExpand(): void {
    const nextState = !expanded;
    setExpanded(nextState);
    if (nextState) {
      onExpand?.();
    }
  }

  return (
    <Card className={styles.resultCard} size="small">
      {/* Header */}
      <div className={styles.cardHeaderRow}>
        <Tag color={tagColor}>{tagText}</Tag>
        <span className={styles.cardTitleText}>{result.testCaseId}</span>
        <span className={styles.cardExecTime}>
          {formatExecTime(result.executedAt)}
        </span>
      </div>

      {/* Failure diff thumbnail and metrics */}
      {!isPassed && (
        <div>
          {diffImageDataURL && (
            <div
              className={styles.diffThumbnailWrapper}
              onClick={handleToggleExpand}
              data-testid="diff-thumbnail"
            >
              <img
                src={diffImageDataURL}
                alt="Diff thumbnail"
                className={styles.diffThumbnail}
              />
            </div>
          )}

          <div className={styles.diffMetricsRow}>
            <span className={styles.diffMetricText}>
              差异像素: {result.diffPixelCount.toLocaleString()}
            </span>
            <Progress
              percent={Math.min(result.diffPercentage, 100)}
              size="small"
              status={getProgressStatus(result.diffPercentage)}
              strokeColor={getProgressColor(result.diffPercentage)}
              style={{ maxWidth: 120, flex: 1 }}
            />
            <span className={`${styles.diffMetricText} ${styles.diffPercentage}`}>
              {result.diffPercentage.toFixed(2)}%
            </span>
          </div>

          <Typography.Text
            className={styles.expandHint}
            onClick={handleToggleExpand}
          >
            {expanded ? '收起详情' : '点击查看详情'}
          </Typography.Text>
        </div>
      )}

      {/* Expanded DiffViewer */}
      {expanded && !isPassed && baselineDataURL && currentDataURL && diffImageDataURL && (
        <div style={{ marginTop: 12 }}>
          <DiffViewer
            baselineDataURL={baselineDataURL}
            currentDataURL={currentDataURL}
            diffImageDataURL={diffImageDataURL}
            diffInfo={{
              pixelCount: result.diffPixelCount,
              percentage: result.diffPercentage,
            }}
          />
        </div>
      )}
    </Card>
  );
}
