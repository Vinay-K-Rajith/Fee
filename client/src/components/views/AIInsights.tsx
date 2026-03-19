import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Send, Loader2, User, Bot, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const STORAGE_KEY = 'fee-insights-chat-history';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  insights?: string[];
  recommendations?: string[];
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I am your **Fee Insights AI Assistant**. I have full context on all **3 years** of school fee collection data (2023-24, 2024-25, 2025-26). Ask me anything — I can generate tables, comparisons, and actionable insights for you.'
};

function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Corrupted data, ignore
  }
  return [WELCOME_MESSAGE];
}

function saveChatHistory(messages: ChatMessage[]) {
  try {
    // Don't save the loading placeholder
    const toSave = messages.filter(m => m.id !== 'loading');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable, ignore
  }
}

// Custom markdown components for elegant rendering
const markdownComponents = {
  h1: ({ children, ...props }: any) => (
    <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className="text-lg font-semibold text-slate-800 mt-3 mb-1.5" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="text-base font-semibold text-slate-700 mt-2 mb-1" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: any) => (
    <p className="text-[15px] leading-relaxed text-slate-700 my-1.5" {...props}>{children}</p>
  ),
  strong: ({ children, ...props }: any) => (
    <strong className="font-semibold text-slate-900" {...props}>{children}</strong>
  ),
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside space-y-1 my-2 text-[15px] text-slate-700" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside space-y-1 my-2 text-[15px] text-slate-700" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="leading-relaxed" {...props}>{children}</li>
  ),
  table: ({ children, ...props }: any) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full text-sm" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: any) => (
    <thead className="bg-gradient-to-r from-indigo-50 to-blue-50" {...props}>{children}</thead>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-slate-100" {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-slate-50 transition-colors" {...props}>{children}</tr>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider whitespace-nowrap" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-3 py-2 text-sm text-slate-700 whitespace-nowrap" {...props}>{children}</td>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-indigo-300 bg-indigo-50/50 pl-4 py-2 my-2 rounded-r-lg text-sm text-slate-700 italic" {...props}>{children}</blockquote>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
    }
    return (
      <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-2 text-sm">
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  },
  hr: (props: any) => (
    <hr className="my-3 border-slate-200" {...props} />
  ),
  a: ({ children, ...props }: any) => (
    <a className="text-indigo-600 underline hover:text-indigo-800 transition-colors" {...props}>{children}</a>
  ),
};

export function AIInsights() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever messages change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([WELCOME_MESSAGE]);
  }, []);

  const renderDetailsPanel = (insights?: string[], recommendations?: string[]) => {
    if (!insights?.length && !recommendations?.length) return null;

    return (
      <div className="mt-4 space-y-3">
        {insights && insights.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="font-semibold text-blue-900 text-sm mb-2">Key Insights</div>
            <ul className="space-y-1">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm text-blue-800 flex gap-2">
                  <span className="text-blue-600 mt-1 flex-shrink-0">→</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="font-semibold text-amber-900 text-sm mb-2">Recommendations</div>
            <ul className="space-y-1">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-amber-800 flex gap-2">
                  <span className="text-amber-600 mt-1 flex-shrink-0">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const chatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });
      if (!res.ok) throw new Error('Failed to get AI response');
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        insights: data.insights,
        recommendations: data.recommendations
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error analyzing the data for that request.',
      }]);
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || chatMutation.isPending) return;

    const userQ = query;
    setQuery('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userQ }]);
    setMessages(prev => [...prev, { id: 'loading', role: 'assistant', content: 'Thinking...' }]);

    chatMutation.mutate(userQ);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      <div className="flex items-center gap-3 p-6 pb-4 shrink-0">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">AI Data Assistant</h1>
          <p className="text-sm text-slate-500">Full context on all 3 years of fee data. Just ask your questions.</p>
        </div>
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors gap-1.5"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs">Clear</span>
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
              {msg.id === 'loading' ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing 3 years data...</span>
                </div>
              ) : msg.role === 'assistant' ? (
                <>
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {renderDetailsPanel(msg.insights, msg.recommendations)}
                </>
              ) : (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 shrink-0 bg-transparent">
        <form onSubmit={onSubmit} className="relative flex items-center bg-white shadow-sm border border-slate-200 rounded-full pr-1 overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about trends, defaulters, concessions..."
            className="h-14 border-0 shadow-none focus-visible:ring-0 text-[15px] pl-6 pb-0.5 bg-transparent"
            disabled={chatMutation.isPending}
          />
          <Button
            type="submit"
            disabled={!query.trim() || chatMutation.isPending}
            size="icon"
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 mx-1 shrink-0"
          >
            <Send className="w-4 h-4 text-white -ml-0.5" />
          </Button>
        </form>
        <div className="text-center mt-3 text-xs text-slate-400">
          AI Insights has context from 2023 to 2026. Hallucinations may occur.
        </div>
      </div>
    </div>
  );
}
