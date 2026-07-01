// ChatPane.tsx
// Scrollable message history pane. Handles auto-scroll, empty state, and typing indicator.

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import ChatMessage from './ChatMessage';

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

interface ChatPaneProps {
  messages: Message[];
  isLoading: boolean;
}

const EmptyState = (): ReactNode => (
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    textAlign: 'center',
    fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
  }}>
    {/* Large decorative icon */}
    <div style={{
      width: 72,
      height: 72,
      borderRadius: 18,
      background: 'linear-gradient(135deg, rgba(196,114,0,0.08), rgba(196,114,0,0.15))',
      border: '1.5px solid rgba(196,114,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.25rem',
    }}>
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
        <path d="M24 6L6 14V26C6 35.4 14.1 43.2 24 46C33.9 43.2 42 35.4 42 26V14L24 6Z"
          stroke="#C47200" strokeWidth="2" strokeLinejoin="round" fill="rgba(196,114,0,0.08)" />
        <path d="M16 28l5 5 11-11" stroke="#C47200" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    <h3 style={{
      margin: '0 0 0.5rem',
      fontSize: '1.05rem',
      fontWeight: 600,
      color: '#2C3340',
      letterSpacing: '-0.01em',
    }}>
      Ready to assist
    </h3>
    {/* <p style={{
      margin: '0 0 1.5rem',
      fontSize: '0.85rem',
      color: '#6B7B8D',
      maxWidth: 380,
      lineHeight: 1.6,
    }}>
      Ask anything about warehouse operations, safety procedures, or defence vehicle specifications.
    </p> */}

    {/* Suggestion chips */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: 500 }}>
      {[
        'What are the forklift safety protocols?',
        'Summarise hazardous material storage guidelines',
        'Vehicle maintenance schedule for defence trucks',
        'Emergency evacuation procedures',
      ].map((suggestion) => (
        <button
          key={suggestion}
          style={{
            padding: '0.45rem 0.9rem',
            fontSize: '0.78rem',
            background: 'rgba(196,114,0,0.06)',
            border: '1px solid rgba(196,114,0,0.18)',
            borderRadius: 99,
            color: '#8B4A00',
            cursor: 'default', // suggestions are display-only in this component
            fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
            lineHeight: 1.4,
            textAlign: 'left',
          }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);

const TypingIndicator = (): ReactNode => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    opacity: 1,
    animation: 'fadeIn 0.3s ease',
  }}>
    {/* Bot avatar */}
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      background: 'linear-gradient(135deg, #C47200, #E88B00)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 2,
      boxShadow: '0 2px 8px rgba(196,114,0,0.25)',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="8" width="18" height="12" rx="2.5" stroke="#fff" strokeWidth="1.8" />
        <path d="M12 8V5M9 5h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8.5" cy="14" r="1.5" fill="#fff" opacity="0.8" />
        <circle cx="15.5" cy="14" r="1.5" fill="#fff" opacity="0.8" />
      </svg>
    </div>

    <div style={{
      background: '#FEFCF9',
      border: '1px solid rgba(196,114,0,0.15)',
      borderRadius: '4px 16px 16px 16px',
      padding: '0.85rem 1.1rem',
      boxShadow: '0 2px 12px rgba(196,114,0,0.06)',
    }}>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', height: 16 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#C47200',
              opacity: 0.5,
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ChatPane = ({ messages, isLoading }: ChatPaneProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      ref={paneRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem 1.5rem 0',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(196,114,0,0.2) transparent',
      }}
    >
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={idx === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          {isLoading && <TypingIndicator />}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatPane;
