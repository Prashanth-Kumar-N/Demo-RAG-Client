// RAGChat.jsx
// Main orchestrator component. Manages app state: index loading, message history,
// query submission, and wires together all sub-components.

import { useState, useCallback, useEffect } from 'react';
import IndexLoader from './IndexLoader';
import ChatHeader from './ChatHeader';
import ChatPane from './ChatPane';
import ChatInput from './ChatInput';
import ToastManager, { toast } from './ToastManager';
import { loadIndex, queryRAG } from './ragApi';

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const RAGChat = () => {
  const [indexStatus, setIndexStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [showLoader, setShowLoader] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);

  // ── Load index on mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadIndex()
      .then((result) => {
        setIndexStatus('ready');
        setTimeout(() => {
          toast.success(
            `Index loaded — ${result.documentCount} documents, ${result.vectorDimensions}-dim vectors ready.`,
            { title: 'System Ready' }
          );
        }, 1400);
      })
      .catch((err) => {
        console.error('Index load failed:', err);
        setIndexStatus('error');
        setTimeout(() => {
          toast.error('Failed to load the vector index. Check the backend and refresh.', {
            title: 'Initialisation Error',
            duration: Infinity,
          });
        }, 1400);
      });
  }, []);

  // ── Handle loader completion ─────────────────────────────────────────────
  const handleLoaderFinished = useCallback(() => {
    setShowLoader(false);
  }, []);

  // ── Submit a query ────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (queryText, responseMode) => {
      if (isQuerying || indexStatus !== 'ready') return;

      const userMsg = {
        id: Date.now(),
        role: 'user',
        content: queryText,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsQuerying(true);

      try {
        const result = await queryRAG(queryText, responseMode);

        const assistantMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.answer,
          responseMode,
          sources: result.sources || [],
          timestamp: formatTime(),
          latencyMs: result.latencyMs,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (result.latencyMs > 2000) {
          toast.info(`Response generated in ${(result.latencyMs / 1000).toFixed(1)}s`, {
            title: 'Retrieval Complete',
          });
        }
      } catch (err) {
        console.error('Query failed:', err);
        toast.error('Query failed. Please try again or check the backend connection.', {
          title: 'Query Error',
        });

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: 'Sorry, I encountered an error while processing your query. Please try again.',
            timestamp: formatTime(),
            sources: [],
          },
        ]);
      } finally {
        setIsQuerying(false);
      }
    },
    [isQuerying, indexStatus]
  );

  // ── Reset conversation ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setMessages([]);
    toast.info('Conversation cleared.', { title: 'New Chat' });
  }, []);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <ToastManager />

      {showLoader && (
        <IndexLoader onLoaded={handleLoaderFinished} />
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          background: 'linear-gradient(160deg, #F7F3EE 0%, #F2EBE1 60%, #EFE8DF 100%)',
          fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
          overflow: 'hidden',
        }}
      >
        <ChatHeader
          indexStatus={indexStatus}
          messageCount={messages.length}
          onReset={messages.length > 0 ? handleReset : null}
        />

        <ChatPane messages={messages} isLoading={isQuerying} />

        <ChatInput
          onSend={handleSend}
          disabled={indexStatus !== 'ready'}
          isLoading={isQuerying}
        />
      </div>
    </>
  );
};

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: 'Söhne', 'Inter', system-ui, -apple-system, sans-serif;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(196, 114, 0, 0.2);
    border-radius: 99px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(196, 114, 0, 0.38);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.85); }
  }
  @keyframes dropUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  textarea::placeholder {
    color: #B0BECC;
    font-style: italic;
  }

  button:focus-visible {
    outline: 2px solid rgba(196, 114, 0, 0.5);
    outline-offset: 2px;
  }
`;

export default RAGChat;
