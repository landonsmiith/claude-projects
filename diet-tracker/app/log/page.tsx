'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, XCircle, UtensilsCrossed, Dumbbell, Scale } from 'lucide-react';

type Intent = 'food' | 'exercise' | 'weight';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PendingEntry {
  type: 'food' | 'exercise' | 'weight';
  data: Record<string, unknown>;
}

const INTENT_CONFIG: Record<
  Intent,
  {
    label: string;
    icon: typeof UtensilsCrossed;
    placeholder: string;
    color: string;
  }
> = {
  food: {
    label: 'Food',
    icon: UtensilsCrossed,
    placeholder: 'What did you eat? (e.g. 2 scrambled eggs and toast)',
    color: 'text-green-600',
  },
  exercise: {
    label: 'Exercise',
    icon: Dumbbell,
    placeholder: 'What exercise did you do? (e.g. 30 min run)',
    color: 'text-blue-600',
  },
  weight: {
    label: 'Weight',
    icon: Scale,
    placeholder: 'What is your current weight? (e.g. 185 lbs)',
    color: 'text-purple-600',
  },
};

export default function LogPage() {
  const [intent, setIntent] = useState<Intent>('food');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  const reset = () => {
    setMessages([]);
    setInput('');
    setPending(null);
    setSaved(false);
    inputRef.current?.focus();
  };

  const switchIntent = (newIntent: Intent) => {
    setIntent(newIntent);
    reset();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setPending(null);
    setSaved(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          intent,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      if (data.pending) {
        setPending(data.pending);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const confirmSave = async () => {
    if (!pending) return;
    setSaving(true);

    try {
      if (pending.type === 'food') {
        await fetch('/api/food-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending.data),
        });
      } else if (pending.type === 'exercise') {
        await fetch('/api/exercise-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending.data),
        });
      } else if (pending.type === 'weight') {
        await fetch('/api/weight-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending.data),
        });
      }
      setSaved(true);
      setPending(null);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            pending.type === 'food'
              ? 'Saved! Want to log something else?'
              : pending.type === 'exercise'
              ? 'Exercise logged! Great work!'
              : 'Weight logged!',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to save. Please try again.' },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const cfg = INTENT_CONFIG[intent];

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Intent tabs */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
        {(
          Object.entries(INTENT_CONFIG) as [Intent, (typeof INTENT_CONFIG)[Intent]][]
        ).map(([key, c]) => {
          const Icon = c.icon;
          const active = key === intent;
          return (
            <button
              key={key}
              onClick={() => switchIntent(key)}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors border-b-2 ${
                active
                  ? `border-current ${c.color}`
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className="mt-0.5">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <cfg.icon
              size={36}
              className={`mx-auto mb-3 ${cfg.color} opacity-50`}
            />
            <div className="text-gray-400 text-sm">{cfg.placeholder}</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pending confirmation card */}
        {pending && !saved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 w-full">
            <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
              Ready to Save
            </div>
            {pending.type === 'food' && (
              <div className="space-y-1 text-sm text-gray-700">
                <div className="font-medium">{pending.data.description as string}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {pending.data.mealType as string}
                </div>
                <div className="flex gap-3 text-xs mt-2 text-gray-600">
                  <span>
                    <b>{Math.round(pending.data.calories as number)}</b> kcal
                  </span>
                  <span>
                    P <b>{Math.round(pending.data.protein as number)}g</b>
                  </span>
                  <span>
                    C <b>{Math.round(pending.data.carbs as number)}g</b>
                  </span>
                  <span>
                    F <b>{Math.round(pending.data.fat as number)}g</b>
                  </span>
                </div>
              </div>
            )}
            {pending.type === 'exercise' && (
              <div className="space-y-1 text-sm text-gray-700">
                <div className="font-medium">{pending.data.description as string}</div>
                <div className="flex gap-3 text-xs mt-2 text-gray-600">
                  <span>
                    <b>{Math.round(pending.data.caloriesBurned as number)}</b> kcal burned
                  </span>
                  {pending.data.durationMins && (
                    <span>
                      <b>{pending.data.durationMins as number}</b> min
                    </span>
                  )}
                </div>
              </div>
            )}
            {pending.type === 'weight' && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">{pending.data.weight as number} lbs</span>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={confirmSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-60"
              >
                <CheckCircle size={15} />
                {saving ? 'Saving...' : 'Confirm & Save'}
              </button>
              <button
                onClick={() => setPending(null)}
                className="flex items-center justify-center gap-1 px-3 bg-white border border-gray-200 text-gray-500 text-sm py-2 rounded-xl"
              >
                <XCircle size={15} />
                Edit
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div className="text-center">
            <button onClick={reset} className="text-sm text-green-600 font-medium underline">
              Log another
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={cfg.placeholder}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-h-28 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
