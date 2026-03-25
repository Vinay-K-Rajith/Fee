import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Send, Loader2, User, Bot, Trash2, Download, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = 'fee-insights-chat-history';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  insights?: string[];
  recommendations?: string[];
  chartData?: any;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I am your **Fee Insights AI Assistant**.  Ask me anything — I can generate tables, comparisons, and actionable insights for you.'
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
    <thead className="bg-gradient-to-r from-emerald-50 to-slate-50" {...props}>{children}</thead>
  ),
  tbody: ({ children, ...props }: any) => (
    <tbody className="divide-y divide-slate-100" {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }: any) => (
    <tr className="hover:bg-slate-50 transition-colors" {...props}>{children}</tr>
  ),
  th: ({ children, ...props }: any) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: any) => (
    <td className="px-3 py-2 text-sm text-slate-700 whitespace-nowrap" {...props}>{children}</td>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-emerald-300 bg-emerald-50/50 pl-4 py-2 my-2 rounded-r-lg text-sm text-slate-700 italic" {...props}>{children}</blockquote>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return <code className="bg-slate-100 text-emerald-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
    }
    return (
      <pre className="bg-slate-50 text-slate-900 rounded-lg p-4 overflow-x-auto my-2 text-sm border border-slate-200">
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  },
  hr: (props: any) => (
    <hr className="my-3 border-slate-200" {...props} />
  ),
  a: ({ children, ...props }: any) => (
    <a className="text-emerald-600 underline hover:text-emerald-800 transition-colors" {...props}>{children}</a>
  ),
};

export function AIInsights() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  
  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Fee Insights Data Report');
  const [selectedContent, setSelectedContent] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

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

  const handleSendEmail = async () => {
    if (!emailTo) return;
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/ai/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toAddress: emailTo, subject: emailSubject, content: selectedContent }),
      });
      if (res.ok) {
        setEmailSuccess(true);
        setTimeout(() => {
          setEmailModalOpen(false);
          setEmailSuccess(false);
        }, 2000);
      }
    } catch {
      // Error handling can happen here
    } finally {
      setIsSendingEmail(false);
    }
  };

  const renderChart = (chartData: any) => {
    if (!chartData || !chartData.labels || !chartData.datasets) return null;

    // 12+ vibrant color palette for enhanced visualization
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#6366F1', // Indigo
      '#84CC16', // Lime
      '#0891B2', // Cyan-dark
    ];

    // Helper function to format large numbers concisely
    const formatValueForDisplay = (value: number): string => {
      if (value >= 10000000) return (value / 10000000).toFixed(1) + 'Cr';
      if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
      if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
      return value.toString();
    };

    // Custom tooltip with concise value formatting
    const CustomChartTooltip = (props: any) => {
      const { active, payload } = props;
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-800 mb-2">{payload[0].payload.name}</p>
            {payload.map((entry: any, idx: number) => (
              <p key={idx} style={{ color: entry.color }} className="text-sm">
                {entry.name}: <span className="font-semibold">{formatValueForDisplay(entry.value)}</span>
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    if (chartData.chartType === 'pie') {
      const pieData = chartData.labels.map((lbl: string, idx: number) => ({
        name: lbl,
        value: chartData.datasets[0]?.data[idx] || 0
      }));
      return (
        <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: '580px' }}>
          <div className="flex-1 p-4 flex flex-col" style={{ minHeight: '540px' }}>
            <ResponsiveContainer width="100%" height={480}>
              <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 80 }}>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={140} label={({ name, value }) => `${name}: ${formatValueForDisplay(value)}`}>
                   {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                   ))}
                </Pie>
                <RechartsTooltip content={<CustomChartTooltip />} />
                <Legend verticalAlign="bottom" height={60} wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    // Convert to recharts format for Bar/Line: { name: 'Q1', series1: 10, series2: 20 }
    const rechartsData = chartData.labels.map((label: string, index: number) => {
      const dataPoint: any = { name: label };
      chartData.datasets.forEach((ds: any) => {
        dataPoint[ds.label] = ds.data[index];
      });
      return dataPoint;
    });

      return (
        <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: '580px' }}>
          <div className="flex-1 p-4 flex flex-col" style={{ minHeight: '540px' }}>
            <ResponsiveContainer width="100%" height={480}>
              {chartData.chartType === 'bar' ? (
                <BarChart data={rechartsData} margin={{ top: 20, right: 30, left: 50, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={11} tickMargin={10} />
                  <YAxis fontSize={11} width={60} tickFormatter={formatValueForDisplay} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    content={<CustomChartTooltip />}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  {chartData.datasets.map((ds: any, idx: number) => (
                    <Bar 
                      key={ds.label} 
                      dataKey={ds.label} 
                      fill={colors[idx % colors.length]} 
                      radius={[6, 6, 0, 0]}
                      animationDuration={800}
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={rechartsData} margin={{ top: 20, right: 30, left: 50, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={11} tickMargin={10} />
                  <YAxis fontSize={11} width={60} tickFormatter={formatValueForDisplay} />
                  <RechartsTooltip 
                    content={<CustomChartTooltip />}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                  {chartData.datasets.map((ds: any, idx: number) => (
                    <Line 
                      key={ds.label} 
                      type="monotone" 
                      dataKey={ds.label} 
                      stroke={colors[idx % colors.length]} 
                      strokeWidth={3}
                      activeDot={{ r: 7 }} 
                      dot={{ fill: colors[idx % colors.length], strokeWidth: 2, r: 5 }}
                      animationDuration={800}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      );
  };

  const handleDownloadPDF = async (msgId: string, elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) {
      console.error("PDF element not found");
      return;
    }
    try {
      // Adding standard backgroundColor and a small delay ensures complex Recharts are rendered fully before canvas capture
      setTimeout(async () => {
        const canvas = await html2canvas(el, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`AI-Report-${msgId}.pdf`);
      }, 500);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };



  const chatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      // Create a simplified history array excluding loading messages to avoid confusing the AI
      const historyContext = messages
        .filter(m => m.id !== 'loading')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery, history: historyContext }),
      });
      if (!res.ok) throw new Error('Failed to get AI response');
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev.filter(m => m.id !== 'loading'), {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response || data.text,
        insights: data.insights,
        recommendations: data.recommendations,
        chartData: data.chartData
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
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-6xl mx-auto">
      <div className="flex items-center gap-3 p-6 pb-4 shrink-0">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
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
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
            )}

            <div className={`${msg.chartData ? 'w-full max-w-full p-5' : 'max-w-[85%] rounded-2xl px-5 py-3.5'} rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'}`}>
              {msg.id === 'loading' ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing 3 years data...</span>
                </div>
              ) : msg.role === 'assistant' ? (
                <div id={`report-content-${msg.id}`}>
                  <div className="flex justify-end mb-4 gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedContent(msg.content);
                        setEmailModalOpen(true);
                      }}
                      className="text-xs text-slate-400 hover:text-emerald-600 h-6 px-2 pr-3 flex items-center gap-1 bg-slate-50 rounded-md"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDownloadPDF(msg.id, `report-content-${msg.id}`)}
                      className="text-xs text-slate-400 hover:text-emerald-600 h-6 px-2 pr-3 flex items-center gap-1 bg-slate-50 rounded-md"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </Button>
                  </div>
                  {msg.chartData ? (
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-5 pr-4 max-h-[580px] overflow-y-auto">
                        <div className="markdown-body text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="col-span-7">
                        {renderChart(msg.chartData)}
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-3.5">
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
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
        <form onSubmit={onSubmit} className="relative flex items-center bg-white shadow-sm border border-slate-200 rounded-full pr-1 overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
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
            className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 mx-1 shrink-0"
          >
            <Send className="w-4 h-4 text-white -ml-0.5" />
          </Button>
        </form>
        <div className="text-center mt-3 text-xs text-slate-400">
          AI Insights has context from 2023 to 2026. Hallucinations may occur.
        </div>
      </div>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Email AI Report</DialogTitle>
            <DialogDescription>
              Send this formatted analysis and insights directly to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">To Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.edu"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject" className="text-sm font-medium">Subject Line</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contentPreview" className="text-sm font-medium">Content Preview (Markdown)</Label>
              <Textarea 
                id="contentPreview" 
                value={selectedContent} 
                className="h-24 text-xs font-mono text-slate-500 bg-slate-50 resize-none opacity-80"
                readOnly
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail || !emailTo} className={emailSuccess ? "bg-green-600 hover:bg-green-700" : ""}>
              {isSendingEmail ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : emailSuccess ? 'Sent!' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
