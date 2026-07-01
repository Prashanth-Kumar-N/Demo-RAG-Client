// ChatHeader.tsx
// App header with logo, system status badge, and optional metadata.

import type { ReactNode } from 'react';
import RAGLogo from './RAGLogo';

type StatusType = 'ready' | 'loading' | 'error';

interface StatusDotProps {
  status: StatusType;
}

interface ChatHeaderProps {
  indexStatus?: StatusType;
  messageCount?: number;
  onReset?: (() => void) | null;
}

const StatusDot = ({ status }: StatusDotProps): ReactNode => {
  const colors = {
    ready: '#22c55e',
    loading: '#eab308',
    error: '#ef4444',
  };
  const labels = {
    ready: 'Index Ready',
    loading: 'Loading Index…',
    error: 'Connection Error',
  };
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.28rem 0.7rem',
      background: 'rgba(196,114,0,0.06)',
      border: '1px solid rgba(196,114,0,0.14)',
      borderRadius: 99,
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: colors[status] || '#A0AEBF',
        display: 'inline-block',
        boxShadow: status === 'ready' ? '0 0 0 2px rgba(34,197,94,0.2)' :
                   status === 'loading' ? '0 0 0 2px rgba(234,179,8,0.2)' : 'none',
        animation: status === 'loading' ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }} />
      <span style={{
        fontSize: '0.72rem',
        fontWeight: 500,
        color: '#6B7B8D',
        fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
        letterSpacing: '0.01em',
      }}>
        {labels[status] || 'Unknown'}
      </span>
    </div>
  );
};

const ChatHeader = ({ indexStatus = 'loading', messageCount = 0, onReset }: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 h-14 bg-white border-b border-gray-200 sticky top-0 z-50"
      style={{
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
        fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* Left: Logo */}
      <RAGLogo size={34} showText />

      {/* Center: corpus label */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#A0AEBF',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Warehouse · Safety · Defence
        </span>
      </div>

      {/* Right: status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <StatusDot status={indexStatus} />

        {messageCount > 0 && onReset && (
          <button
            onClick={onReset}
            title="Clear conversation"
            style={{
              background: 'none',
              border: '1px solid rgba(196,114,0,0.18)',
              borderRadius: 8,
              padding: '0.28rem 0.65rem',
              fontSize: '0.73rem',
              color: '#8B6A4A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
              fontWeight: 500,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(196,114,0,0.06)';
              e.currentTarget.style.borderColor = 'rgba(196,114,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = 'rgba(196,114,0,0.18)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 3v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Chat
          </button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
