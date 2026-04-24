import { useState, useCallback, useMemo } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/stores';
import styles from './SceneDetail.module.css';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DslCodeSnippetProps {
  readonly dsl: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TokenType = 'string' | 'number' | 'boolean' | 'null' | 'key' | 'punctuation' | 'whitespace';

/**
 * Tokenize a JSON string into segments with simple syntax classification.
 * Covers: strings, numbers, booleans, null, punctuation, keys, and whitespace.
 */
function tokenizeJson(raw: string): ReadonlyArray<Readonly<{ text: string; type: TokenType }>> {
  const tokens: Array<{ text: string; type: TokenType }> = [];

  // Regex captures JSON tokens AND whitespace in order
  const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\]:,])|([ \t\r\n]+)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    if (match[1] !== undefined) {
      tokens.push({ text: match[1], type: 'key' });
    } else if (match[2] !== undefined) {
      tokens.push({ text: match[2], type: 'string' });
    } else if (match[3] !== undefined) {
      tokens.push({ text: match[3], type: 'number' });
    } else if (match[4] !== undefined) {
      tokens.push({ text: match[4], type: 'boolean' });
    } else if (match[5] !== undefined) {
      tokens.push({ text: match[5], type: 'null' });
    } else if (match[6] !== undefined) {
      tokens.push({ text: match[6], type: 'punctuation' });
    } else if (match[7] !== undefined) {
      tokens.push({ text: match[7], type: 'whitespace' });
    }
  }

  return tokens;
}

function getTokenClassName(type: string, isDark: boolean): string {
  if (type === 'whitespace') return '';
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
}: DslCodeSnippetProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === 'dark';

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
      className={styles.codeSnippetContainer}
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
