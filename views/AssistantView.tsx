import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';

const STARTERS = [
  'When is the next SpaceX launch?',
  'How does the James Webb Space Telescope work?',
  'What happened on the Artemis II mission?',
  'Compare Falcon 9 and LVM3',
  'How far away is Voyager 1?',
  'What causes the northern lights?',
];

export const AssistantView: React.FC<{ initialPrompt?: string }> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef<string | undefined>(undefined);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && sentInitial.current !== initialPrompt) {
      sentInitial.current = initialPrompt;
      send(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const send = async (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || loading) return;
    const user: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: prompt, timestamp: new Date().toISOString() };
    const history = messages.filter((m) => !m.id.startsWith('err')).map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, user]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { id: `${data.error ? 'err' : 'a'}-${Date.now()}`, role: 'assistant', content: data.text, timestamp: new Date().toISOString(), sources: data.sources || [] },
      ]);
    } catch {
      setMessages((m) => [...m, { id: `err-${Date.now()}`, role: 'assistant', content: 'Sorry, I couldn’t reach the assistant. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">Ask AI</h1>
          <p className="mt-2 text-slate-500">Ask anything about space. Answers include links so you can check them — AI can make mistakes.</p>
        </div>
        {!empty && (
          <button onClick={() => setMessages([])} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50">
            <RotateCcw className="w-4 h-4" /> New chat
          </button>
        )}
      </div>

      <div className="flex-1 mt-8 space-y-6">
        {empty && (
          <div className="grid sm:grid-cols-2 gap-3">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm text-sm text-slate-700">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md bg-slate-900 text-white whitespace-pre-wrap">{m.content}</div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="prose-chat">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>
                    {m.content}
                  </ReactMarkdown>
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 max-w-[220px]">
                        <span className="truncate">{s.title}</span> ↗
                      </a>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(m.content);
                    setCopied(m.id);
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700"
                >
                  {copied === m.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex gap-3 items-center text-sm text-slate-500">
            <span className="w-8 h-8 rounded-full bg-blue-700/10 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" />
            </span>
            Thinking…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="sticky bottom-4 mt-8"
      >
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-slate-200 shadow-lg focus-within:border-blue-500">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask a question about space…"
            aria-label="Your question"
            className="flex-1 px-3 py-2 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-40">
            Send <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
