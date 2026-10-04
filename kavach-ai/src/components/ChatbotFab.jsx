import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Waves } from 'lucide-react';
import { api } from '../lib/api.js';

const SUGGESTIONS = [
  'What should I do if my street is flooded?',
  'How do I register a vulnerable family member?',
  'Share the Indian emergency numbers.',
  'Explain the live map in one line.',
];

export default function ChatbotFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I am Pravaah, your flood safety helper. Ask me about safe routes, reports, or what to do in an emergency.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    const next = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const history = next.slice(0, -1).slice(-8);
      const res = await api.chat(msg, history);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, engine: res.engine }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'I cannot reach the Pravaah backend right now. Please try again in a moment.', engine: 'offline' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-raised ring-1 ring-amber2-500/40 transition hover:scale-105 ${
          open ? 'bg-ink-900 text-paper-50' : 'btn-amber'
        }`}
        aria-label={open ? 'Close chat' : 'Open Pravaah chat'}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-amber2-500/40" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-40 flex h-[min(560px,calc(100vh-128px))] w-[min(360px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl bg-white shadow-raised ring-1 ring-ink-100 sm:right-6">
          <header className="flex items-center gap-3 border-b border-ink-100 bg-paper-50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber2-500 text-ink-900">
              <Waves size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                Pravaah assistant
                <Sparkles size={12} className="text-amber2-600" />
              </div>
              <div className="text-[11px] text-ink-500">Flood safety, routes and SOS, in plain words.</div>
            </div>
          </header>

          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} engine={m.engine} />
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Loader2 size={12} className="animate-spin" />
                Pravaah is thinking...
              </div>
            )}
            {messages.length <= 1 && !busy && (
              <div className="pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">
                  Try asking
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-ink-100 bg-paper-50 px-2.5 py-1 text-[11px] text-ink-700 hover:border-amber2-500/50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-ink-100 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                rows={1}
                placeholder="Ask about safe routes, reports or SOS..."
                className="max-h-28 min-h-[38px] flex-1 resize-none rounded-xl border border-ink-100 bg-paper-50 px-3 py-2 text-sm text-ink-900 outline-none focus:border-amber2-500"
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full btn-amber disabled:opacity-50"
                aria-label="Send"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            <div className="mt-1 text-[10px] text-ink-400">
              In an emergency, call 112. This chat is for guidance.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, content, engine }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-900 px-3 py-2 text-paper-50">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <div className="rounded-2xl rounded-bl-md bg-paper-50 px-3 py-2 text-ink-800 ring-1 ring-ink-100">
          {content}
        </div>
        {engine && (
          <div className="mt-1 pl-1 text-[10px] uppercase tracking-widest text-ink-400">
            {engine === 'gemini' ? 'via Gemini' : engine === 'fallback' ? 'via rules' : engine}
          </div>
        )}
      </div>
    </div>
  );
}
