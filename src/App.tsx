// RAGChat.tsx
// Main orchestrator component. Manages app state: index loading, message history,
// query submission, and wires together all sub-components.

import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import IndexLoader from './components/IndexLoader';
import ChatHeader from './components/ChatHeader';
import ChatPane from './components/ChatPane';
import ChatInput from './components/ChatInput';
import ToastManager, { toast } from './components/ToastManager';
import { loadIndex, queryRAG } from './components/ragApi';

type IndexStatus = 'loading' | 'ready' | 'error';
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
  timestamp: string;
  responseMode?: ResponseMode;
  sources?: SourceNode[];
  isStreaming?: boolean;
  latencyMs?: number;
}

const formatTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const App = (): ReactNode => {
  const [indexStatus, setIndexStatus] = useState<IndexStatus>('loading');
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  // ── Load index on mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadIndex()
      .then((result) => {
        if (result.status === 'ok') {
          setIndexStatus('ready');
          setTimeout(() => {
            toast.success(
              `Index loaded`,
              { title: 'System Ready' }
            );
          }, 1000);
        } else {
          // throw an error her with message that the catch block catches
          throw new Error(result.message || 'Index load failed');
        }

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
    async (queryText: string, responseMode: ResponseMode) => {
      if (isQuerying || indexStatus !== 'ready') return;

      const userMsg: Message = {
        id: Date.now(),
        role: 'user',
        content: queryText,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsQuerying(true);

      try {
        const result = await queryRAG(queryText, responseMode);

        const assistantMsg: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.response_text,
          responseMode,
          sources: result.source_nodes || [],
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
      <ToastManager />

      {showLoader && (
        <IndexLoader onLoaded={handleLoaderFinished} />
      )}

      <div className="flex flex-col h-screen overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #F7F3EE 0%, #F2EBE1 60%, #EFE8DF 100%)',
          fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
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



export default App;
