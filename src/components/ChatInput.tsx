// ChatInput.tsx
// The query input area with an attached action pane (response mode selector, submit button).
// Claude.ai-style attached toolbar below the textarea.

import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

type ResponseMode = 'compact' | 'tree_summarize' | 'refine' | 'simple_summarize' | 'accumulate' | 'compact_accumulate';

interface ResponseModeOption {
  value: ResponseMode;
  label: string;
  description: string;
}

interface ChatInputProps {
  onSend: (query: string, responseMode: ResponseMode) => void;
  disabled: boolean;
  isLoading: boolean;
}

const RESPONSE_MODES: ResponseModeOption[] = [
  { value: 'compact', label: 'Compact', description: 'Compact, concise answer' },
  { value: 'tree_summarize', label: 'Tree Summarize', description: 'Hierarchical summarization' },
  { value: 'refine', label: 'Refine', description: 'Iterative answer refinement' },
  { value: 'simple_summarize', label: 'Simple Summarize', description: 'Quick plain summary' },
  { value: 'accumulate', label: 'Accumulate', description: 'Combine all node responses' },
  { value: 'compact_accumulate', label: 'Compact Accumulate', description: 'Compact + accumulate' },
];

const SendIcon = ({ size = 16 }: { size?: number }): ReactNode => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ModeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const ChatInput = ({ onSend, disabled, isLoading }: ChatInputProps) => {
  const [query, setQuery] = useState<string>('');
  const [responseMode, setResponseMode] = useState<ResponseMode>('compact');
  const [modeDropdownOpen, setModeDropdownOpen] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = () => {
    const q = query.trim();
    if (!q || disabled || isLoading) return;
    onSend(q, responseMode);
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const selectedMode = RESPONSE_MODES.find((m) => m.value === responseMode);
  const canSend = query.trim().length > 0 && !disabled && !isLoading;

  return (
    <div style={{ padding: '0 1.5rem 1.5rem', fontFamily: "'Söhne', 'Inter', system-ui, sans-serif" }}>
      {/* Outer container — the "card" that groups textarea + action bar */}
      <div
        style={{
          background: '#FEFCF9',
          border: '1.5px solid rgba(196,114,0,0.2)',
          borderRadius: 14,
          boxShadow: '0 2px 20px rgba(196,114,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          overflow: 'visible',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(196,114,0,0.45)';
          e.currentTarget.style.boxShadow = '0 2px 20px rgba(196,114,0,0.14), 0 0 0 3px rgba(196,114,0,0.07)';
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.style.borderColor = 'rgba(196,114,0,0.2)';
            e.currentTarget.style.boxShadow = '0 2px 20px rgba(196,114,0,0.08), 0 1px 4px rgba(0,0,0,0.05)';
          }
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={
            disabled
              ? 'System is initialising — please wait…'
              : 'Ask about warehouse procedures, safety protocols, or vehicle specifications…'
          }
          rows={1}
          style={{
            width: '100%',
            minHeight: 52,
            maxHeight: 200,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            padding: '0.85rem 1.1rem 0.4rem',
            fontSize: '0.92rem',
            lineHeight: 1.65,
            color: disabled ? '#A0AEBF' : '#2C3340',
            fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
            boxSizing: 'border-box',
            display: 'block',
            caretColor: '#C47200',
          }}
        />

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(196,114,0,0.1)', margin: '0 0.75rem' }} />

        {/* Action pane */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          gap: '0.75rem',
        }}>
          {/* Left: mode selector */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => !disabled && setModeDropdownOpen((v) => !v)}
              disabled={disabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.7rem',
                background: modeDropdownOpen ? 'rgba(196,114,0,0.1)' : 'rgba(196,114,0,0.06)',
                border: '1px solid rgba(196,114,0,0.18)',
                borderRadius: 8,
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? '#A0AEBF' : '#8B4A00',
                fontSize: '0.76rem',
                fontWeight: 500,
                fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
                transition: 'background 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              <ModeIcon />
              <span>{selectedMode?.label}</span>
              <span style={{
                transform: modeDropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
                display: 'flex',
              }}>
                <ChevronIcon />
              </span>
            </button>

            {/* Dropdown */}
            {modeDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 0,
                  background: '#FEFCF9',
                  border: '1px solid rgba(196,114,0,0.18)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(196,114,0,0.1)',
                  minWidth: 230,
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'dropUp 0.15s ease',
                }}
              >
                <div style={{
                  padding: '0.4rem 0.7rem',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#A0AEBF',
                  fontWeight: 600,
                  borderBottom: '1px solid rgba(196,114,0,0.08)',
                }}>
                  Response Mode
                </div>
                {RESPONSE_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => { setResponseMode(mode.value); setModeDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '0.55rem 0.85rem',
                      background: responseMode === mode.value ? 'rgba(196,114,0,0.07)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(196,114,0,0.05)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s',
                      fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
                    }}
                    onMouseEnter={(e) => { if (responseMode !== mode.value) e.currentTarget.style.background = 'rgba(196,114,0,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = responseMode === mode.value ? 'rgba(196,114,0,0.07)' : 'transparent'; }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: responseMode === mode.value ? '#C47200' : '#2C3340' }}>
                      {mode.label}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#6B7B8D', marginTop: '1px' }}>
                      {mode.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: hint + send button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!disabled && (
              <span style={{
                fontSize: '0.67rem',
                color: '#A0AEBF',
                whiteSpace: 'nowrap',
              }}>
                ↵ Send · Shift+↵ Newline
              </span>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSend}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: canSend
                  ? 'linear-gradient(135deg, #C47200, #E88B00)'
                  : 'rgba(196,114,0,0.12)',
                border: 'none',
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: canSend ? '#fff' : '#C4A882',
                transition: 'background 0.2s, transform 0.1s, box-shadow 0.2s',
                boxShadow: canSend ? '0 2px 8px rgba(196,114,0,0.35)' : 'none',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseDown={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(1.05)'; }}
            >
              {isLoading
                ? <LoadSpinner />
                : <SendIcon />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Hint text */}
      <p style={{
        textAlign: 'center',
        fontSize: '0.67rem',
        color: '#A0AEBF',
        marginTop: '0.5rem',
        marginBottom: 0,
      }}>
        LogiSense may make errors. Always verify critical operational data.
      </p>
    </div>
  );
};

const LoadSpinner = (): ReactNode => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      strokeDasharray="40 20" />
  </svg>
);

export default ChatInput;
