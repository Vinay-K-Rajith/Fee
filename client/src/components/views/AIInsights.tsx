import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Send, Loader2, User, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#2F2483', '#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  chartConfig?: any;
}

export function AIInsights() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I am your Fee Insights AI Assistant. I have context on all 3 years of school fee collection data. Ask me anything, and I can generate statistics or charts for you.'
  }]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const renderChart = (data: any, chartConfig: any) => {
    if (!data || !data.length || !chartConfig || !chartConfig.type || chartConfig.type === 'null') return null;

    const { type, xAxis, yAxis } = chartConfig;

    if (type === 'bar') {
      return (
        <div className="mt-4 h-64 w-full bg-white rounded-lg p-4 border border-slate-100 shadow-sm text-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xAxis} tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <RechartsTooltip />
              <Legend wrapperStyle={{fontSize: 12}} />
              <Bar dataKey={yAxis} fill="#6366F1" radius={[4, 4, 0, 0]}>
                 {data.map((entry: any, index: number) => (
                     <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (type === 'line') {
      return (
        <div className="mt-4 h-64 w-full bg-white rounded-lg p-4 border border-slate-100 shadow-sm text-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xAxis} tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <RechartsTooltip />
              <Legend wrapperStyle={{fontSize: 12}} />
              <Line type="monotone" dataKey={yAxis} stroke="#8B5CF6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    if (type === 'pie') {
      return (
        <div className="mt-4 h-64 w-full bg-white rounded-lg p-4 border border-slate-100 shadow-sm text-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey={yAxis} nameKey={xAxis} cx="50%" cy="50%" outerRadius={80} label={{fontSize: 12}}>
                {data.map((entry: any, index: number) => (
                  <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend wrapperStyle={{fontSize: 12}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return null;
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
        content: data.explanation,
        data: data.data,
        chartConfig: data.chartConfig
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
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">AI Data Assistant</h1>
          <p className="text-sm text-slate-500">Given all 3 years context. Just ask your questions.</p>
        </div>
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
               ) : (
                 <>
                   <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                   {renderChart(msg.data, msg.chartConfig)}
                 </>
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

