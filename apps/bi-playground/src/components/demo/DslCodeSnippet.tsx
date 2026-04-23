import { useState, useCallback, useMemo } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import styles from './SceneDetail.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DslCodeSnippetProps {
  readonly dsl: string;
  readonly isDark: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Tokenize a JSON string into segments with simple syntax classification.
 * Covers: strings, numbers, booleans, null, punctuation, and keys.
 */
function tokenizeJson(raw: string): ReadonlyArray<Readonly<{ text: string; type: 'string' | 'number' | 'boolean' | 'null' | 'key' | 'punctuation' }>> {
  const tokens: Array<{ text: string; type: 'string' | 'number' | 'boolean' | 'null' | 'key' | 'punctuation' }> = [];

  // Regex captures JSON tokens in order
  const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\]:,])/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    if (match[1] !== undefined) {
      // Key (string followed by colon)
      tokens.push({ text: match[1], type: 'key' });
    } else if (match[2] !== undefined) {
      // String value
      tokens.push({ text: match[2], type: 'string' });
    } else if (match[3] !== undefined) {
      // Number
      tokens.push({ text: match[3], type: 'number' });
    } else if (match[4] !== undefined) {
      // Boolean
      tokens.push({ text: match[4], type: 'boolean' });
    } else if (match[5] !== undefined) {
      // Null
      tokens.push({ text: match[5], type: 'null' });
    } else if (match[6] !== undefined) {
      // Punctuation
      tokens.push({ text: match[6], type: 'punctuation' });
    }
  }

  return tokens;
}

function getTokenClassName(type: string, isDark: boolean): string {
  const suffix = isDark ? 'Dark' : 'Light';
  const map: Record<string, string> = {
    string: styles[`tokenString${suffix}`],
    number: styles[`tokenNumber${suffix}`],
    boolean: styles[`tokenBoolean${suffix}`],
    null: styles[`tokenNull${suffix}`],
    key: styles[`tokenKey${suffix}`],
    punctuation: styles[`tokenPunctuation${suffix}`],
  };
  return map[type] ?? '';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DslCodeSnippet({
  dsl,
  isDark,
}: DslCodeSnippetProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  const formattedDsl = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(dsl), null, 2);
    } catch {
      return dsl;
    }
  }, [dsl]);

  const tokens = useMemo(() => tokenizeJson(formattedDsl), [formattedDsl]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(formattedDsl).then(() => {
      setCopied(true);
      message.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      message.error('Failed to copy');
    });
  }, [formattedDsl]);

  return (
    <div
      className={`${styles.codeSnippetContainer} ${isDark ? styles.codeSnippetContainerDark : styles.codeSnippetContainerLight}`}
      data-testid="dsl-code-snippet"
    >
      <div className={styles.codeSnippetHeader}>
        <span className={styles.codeSnippetLabel}>DSL</span>
        <Button
          type="text"
          size="small"
          icon={<CopyOutlined />}
          onClick={handleCopy}
          data-testid="dsl-copy-button"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className={styles.codeSnippetPre}>
        <code className={styles.codeSnippetCode}>
          {tokens.map((token, index) => (
            <span key={index} className={getTokenClassName(token.type, isDark)}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
