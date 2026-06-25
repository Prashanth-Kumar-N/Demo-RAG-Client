// ToastManager.jsx
// Provides a global toast notification system.
// Usage: import { useToast } from './ToastManager' — call toast.show({ type, message })
// Also export the ToastContainer to place at the app root.

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1.8"/>
      <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1.8"/>
      <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L2 20h20L12 3Z" fill="rgba(234,179,8,0.12)" stroke="#eab308" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 10v4M12 17v.5" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="rgba(196,114,0,0.1)" stroke="#C47200" strokeWidth="1.8"/>
      <path d="M12 11v5M12 8v.5" stroke="#C47200" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

const ACCENT_COLORS = {
  success: { left: '#22c55e', bg: 'rgba(34,197,94,0.05)' },
  error: { left: '#ef4444', bg: 'rgba(239,68,68,0.05)' },
  warning: { left: '#eab308', bg: 'rgba(234,179,8,0.05)' },
  info: { left: '#C47200', bg: 'rgba(196,114,0,0.05)' },
};

const Toast = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const accent = ACCENT_COLORS[toast.type] || ACCENT_COLORS.info;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t1);
  }, []);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 280);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    if (toast.duration !== Infinity) {
      const t = setTimeout(dismiss, toast.duration || 4000);
      return () => clearTimeout(t);
    }
  }, [dismiss, toast.duration]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        padding: '0.75rem 0.9rem',
        background: '#FEFCF9',
        border: '1px solid rgba(196,114,0,0.14)',
        borderLeft: `3px solid ${accent.left}`,
        borderRadius: 10,
        boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)',
        minWidth: 280,
        maxWidth: 380,
        backdropFilter: 'blur(8px)',
        fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
        transform: leaving ? 'translateX(120%)' : visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
        cursor: 'default',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>{ICONS[toast.type] || ICONS.info}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <p style={{ margin: '0 0 2px', fontSize: '0.82rem', fontWeight: 600, color: '#2C3340' }}>
            {toast.title}
          </p>
        )}
        <p style={{
          margin: 0,
          fontSize: toast.title ? '0.76rem' : '0.82rem',
          color: toast.title ? '#6B7B8D' : '#2C3340',
          lineHeight: 1.5,
        }}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={dismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#A0AEBF',
          padding: '1px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          borderRadius: 4,
          marginTop: '-1px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#6B7B8D'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#A0AEBF'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

let _showToast = null;

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(({ type = 'info', title, message, duration }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose globally (simple approach for POC)
  useEffect(() => {
    _showToast = show;
    return () => { _showToast = null; };
  }, [show]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <Toast toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
};

// Global toast function — call anywhere after ToastContainer is mounted
export const toast = {
  show: (opts) => _showToast?.(opts),
  success: (message, opts = {}) => _showToast?.({ type: 'success', message, ...opts }),
  error: (message, opts = {}) => _showToast?.({ type: 'error', message, ...opts }),
  warning: (message, opts = {}) => _showToast?.({ type: 'warning', message, ...opts }),
  info: (message, opts = {}) => _showToast?.({ type: 'info', message, ...opts }),
};

// Hook version
export const useToast = () => {
  const ctx = useContext(ToastContext);
  return ctx || toast;
};

export default ToastContainer;
