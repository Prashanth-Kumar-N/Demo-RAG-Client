# LogiSense RAG UI — Integration Guide

A full-screen chat UI for your LlamaIndex RAG backend, built with React + PrimeReact + Tailwind + Axios.

---

## File Structure

```
src/components/rag/
├── RAGChat.jsx          ← Root component — drop this into your App
├── IndexLoader.jsx      ← Cinematic loading screen (radar animation)
├── ChatHeader.jsx       ← App header with logo + status badge
├── ChatPane.jsx         ← Scrollable message history
├── ChatMessage.jsx      ← Individual message bubble (user + assistant)
├── ChatInput.jsx        ← Textarea + action bar (mode select, send)
├── ToastManager.jsx     ← Global toast notification system
├── RAGLogo.jsx          ← SVG logo mark + wordmark
└── ragApi.js            ← Axios API layer (replace dummies with real calls)
```

---

## 1. Drop into your App

```jsx
// App.jsx (or wherever your router lives)
import RAGChat from './components/rag/RAGChat';

function App() {
  return <RAGChat />;
}
```

`RAGChat` is fully self-contained — it renders the loader, header, chat pane, input, and toasts.

---

## 2. Install dependencies

If not already in your project:

```bash
npm install axios
```

PrimeReact and Tailwind are already in your setup per your requirements.

---

## 3. Wire up the real backend (`ragApi.js`)

Open `ragApi.js` and replace the two dummy functions:

### `loadIndex()`
Called once on app mount. Should hit your LlamaIndex endpoint that loads/warms the index.

```js
// Replace dummy with:
export async function loadIndex() {
  const response = await api.post('/api/index/load');
  // Expected response shape: { status: 'ok', documentCount: N, vectorDimensions: N }
  return response.data;
}
```

### `queryRAG(query, responseMode)`
Called on every user query. Maps directly to LlamaIndex's `query_engine.query()`.

```js
// Replace dummy with:
export async function queryRAG(query, responseMode = 'compact') {
  const response = await api.post('/api/query', {
    query,
    response_mode: responseMode,  // passed to LlamaIndex ResponseMode enum
  });
  // Expected response shape: { answer: string, sources: string[], latencyMs: number }
  return response.data;
}
```

Set your backend URL via env var:
```
REACT_APP_API_URL=http://localhost:8000
```

---

## 4. LlamaIndex Response Modes

The UI's mode selector maps directly to LlamaIndex `ResponseMode` values:

| UI Label           | `response_mode` value sent to backend |
|--------------------|---------------------------------------|
| Compact            | `compact`                             |
| Tree Summarize     | `tree_summarize`                      |
| Refine             | `refine`                              |
| Simple Summarize   | `simple_summarize`                    |
| Accumulate         | `accumulate`                          |
| Compact Accumulate | `compact_accumulate`                  |

In your FastAPI/Flask backend, pass this directly to the query engine:
```python
from llama_index.core.response_synthesizers import ResponseMode

response = query_engine.query(
    query,
    response_mode=ResponseMode(response_mode)
)
```

---

## 5. Toast notifications

Call from anywhere after `<ToastManager />` is mounted:

```js
import { toast } from './components/rag/ToastManager';

toast.success('Done!', { title: 'Optional Title' });
toast.error('Something went wrong');
toast.warning('Heads up');
toast.info('FYI');

// Persistent toast (won't auto-dismiss):
toast.error('Critical error', { duration: Infinity });
```

---

## 6. Fonts

The UI uses **Söhne** (Claude's font) with **Inter** as fallback. Söhne is a licensed font — if you have it available, place it in your `public/fonts/` folder and add to your CSS:

```css
@font-face {
  font-family: 'Söhne';
  src: url('/fonts/soehne-buch.woff2') format('woff2');
  font-weight: 400;
}
@font-face {
  font-family: 'Söhne';
  src: url('/fonts/soehne-kraftig.woff2') format('woff2');
  font-weight: 600;
}
```

Without Söhne, Inter (loaded from Google Fonts via `RAGChat.jsx`) renders beautifully as a fallback.

---

## Colour Tokens

| Token         | Value       | Usage                      |
|---------------|-------------|----------------------------|
| Amber Primary | `#C47200`   | Buttons, accents, icons    |
| Amber Deep    | `#8B4A00`   | Text on amber bg, labels   |
| Parchment     | `#F7F3EE`   | Page background            |
| Card          | `#FEFCF9`   | Message bubbles, inputs    |
| Border        | `#E8DDD0`   | Subtle dividers            |
| Slate Text    | `#2C3340`   | Primary text               |
| Muted Text    | `#6B7B8D`   | Secondary / placeholder    |
| Soft Text     | `#A0AEBF`   | Timestamps, hints          |
