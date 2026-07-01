// ChatMessage.tsx
// Renders a single message bubble — either user query or RAG assistant response.
// Handles animated appearance, source citations display, and response mode badge.

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type ResponseMode = 'compact' | 'tree_summarize' | 'refine' | 'simple_summarize' | 'accumulate' | 'compact_accumulate';

interface SourceNode {
  metadata: {
    chunk_id: string;
    chunk_index: number;
    chunk_size: number;
    chunk_total: number;
    file_name: string;
    page_number: number;
  };
  rank: number;
  response: string;
  score: number;
}

interface Message {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  responseMode?: ResponseMode;
  timestamp?: string;
  sources?: SourceNode[];
  isStreaming?: boolean;
  latencyMs?: number;
}

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

const UserIcon = (): ReactNode => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const BotIcon = (): ReactNode => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="8" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 8V5M9 5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="8.5" cy="14" r="1.5" fill="currentColor" opacity="0.7"/>
    <circle cx="15.5" cy="14" r="1.5" fill="currentColor" opacity="0.7"/>
    <path d="M9 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CopyIcon = (): ReactNode => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8"/>
  </svg>
);

const RESPONSE_MODE_LABELS: Record<ResponseMode, string> = {
  compact: 'Compact',
  tree_summarize: 'Tree Summarize',
  refine: 'Refine',
  simple_summarize: 'Simple Summarize',
  accumulate: 'Accumulate',
  compact_accumulate: 'Compact Accumulate',
};

const ChatMessage = ({ message, isLatest }: ChatMessageProps) => {
  const { role, content, responseMode, timestamp, sources, isStreaming } = message;
  const isUser = role === 'user';
  const [visible, setVisible] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>(isUser ? content : '');
  const streamIdx = useRef<number>(0);

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Streaming text effect for assistant messages
  useEffect(() => {
    if (isUser || !isLatest) {
      setDisplayedText(content);
      return;
    }
    if (!content) return;
    streamIdx.current = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      streamIdx.current += 3; // chars per tick — feels fast but readable
      if (streamIdx.current >= content.length) {
        setDisplayedText(content);
        clearInterval(interval);
      } else {
        setDisplayedText(content.slice(0, streamIdx.current));
      }
    }, 18);
    return () => clearInterval(interval);
  }, [content, isUser, isLatest]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        maxWidth: '100%',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: isUser ? '50%' : '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isUser
            ? 'linear-gradient(135deg, #E8DDD0, #D4C4B0)'
            : 'linear-gradient(135deg, #C47200, #E88B00)',
          color: isUser ? '#8B6A4A' : '#fff',
          marginTop: '2px',
          boxShadow: isUser ? 'none' : '0 2px 8px rgba(196,114,0,0.25)',
        }}
      >
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: 'min(680px, 80%)', minWidth: 0 }}>
        {/* Label row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.35rem',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
        }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: isUser ? '#8B6A4A' : '#C47200',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {isUser ? 'You' : 'LogiSense'}
          </span>
          {!isUser && responseMode && (
            <span style={{
              fontSize: '0.62rem',
              padding: '1px 7px',
              borderRadius: 99,
              background: 'rgba(196,114,0,0.1)',
              color: '#8B4A00',
              border: '1px solid rgba(196,114,0,0.2)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}>
              {RESPONSE_MODE_LABELS[responseMode] || responseMode}
            </span>
          )}
          {timestamp && (
            <span style={{ fontSize: '0.62rem', color: '#A0AEBF', marginLeft: '0.25rem' }}>
              {timestamp}
            </span>
          )}
        </div>

        {/* Content bubble */}
        <div
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #EDE4D8, #E5D8C8)'
              : '#FEFCF9',
            border: isUser
              ? '1px solid rgba(196,114,0,0.12)'
              : '1px solid rgba(196,114,0,0.15)',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            padding: '0.85rem 1.1rem',
            boxShadow: isUser
              ? '0 1px 3px rgba(0,0,0,0.04)'
              : '0 2px 12px rgba(196,114,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            position: 'relative',
          }}
        >
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            lineHeight: 1.7,
            color: '#2C3340',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
          }}>
            {displayedText}
            {isStreaming && isLatest && (
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '14px',
                background: '#C47200',
                marginLeft: '2px',
                borderRadius: 1,
                animation: 'blink 1s step-end infinite',
                verticalAlign: 'text-bottom',
              }} />
            )}
          </p>

          {/* Copy button (assistant only) */}
          {!isUser && !isStreaming && content && (
            <button
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy response'}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.6rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: copied ? '#C47200' : '#A0AEBF',
                padding: '3px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
              }}
            >
              <CopyIcon />
            </button>
          )}
        </div>

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#A0AEBF', alignSelf: 'center' }}>Sources:</span>
            {sources.map((src, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.67rem',
                  padding: '2px 8px',
                  background: 'rgba(196,114,0,0.07)',
                  border: '1px solid rgba(196,114,0,0.15)',
                  borderRadius: 99,
                  color: '#8B4A00',
                  fontWeight: 500,
                }}
              >
                {src.metadata.file_name} - (Page {src.metadata.page_number})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
