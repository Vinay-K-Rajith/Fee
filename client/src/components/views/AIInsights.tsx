import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

import { useDashboard, formatCurrency, formatPercentage } from "@/hooks/use-api";
import type { LucideIcon } from "lucide-react";
import {
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    BadgePercent,
    Send,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── AI setup ──────────────────────────────────────────────────────────────────
// Logic moved to backend for security. Calling /api/ai/chat instead.


// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    role: "user" | "ai";
    text: string;
}

interface InsightCard {
    id: string;
    icon: LucideIcon;
    color: string;
    bg: string;
    label: string;
    metric: string;
    insight: string;
}

// ─── Framer variants ──────────────────────────────────────────────────────────

const TypewriterMessage = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(intervalId);
            }
        }, 15); // Adjust speed here
        return () => clearInterval(intervalId);
    }, [text]);

    return (
        <div className="prose prose-sm max-w-none text-[#1E293B] font-open-sans">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-inherit" {...props} />,
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                            <table className="w-full text-left border-collapse" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-3 font-bold text-xs uppercase tracking-wider text-[#64748B]" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-[#F1F5F9] text-sm align-top" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="bg-white divide-y divide-[#F1F5F9]" {...props} />,
                    tr: ({ node, ...props }) => <tr className="hover:bg-[#F8FAFC] transition-colors" {...props} />,
                }}
            >
                {displayedText}
            </ReactMarkdown>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CHAT_STORAGE_KEY = "fee_ai_chat_history";

export function AIInsights() {
    const { data: dashboard, isLoading } = useDashboard();

    // Initialise messages from localStorage so chat survives page refreshes
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const stored = localStorage.getItem(CHAT_STORAGE_KEY);
            return stored ? (JSON.parse(stored) as Message[]) : [];
        } catch {
            return [];
        }
    });
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const [chatReady, setChatReady] = useState(messages.length > 0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        } catch {
            // Storage quota exceeded or unavailable — fail silently
        }
    }, [messages]);

    // Auto-scroll chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    // Build system context from dashboard data
    const buildSystemPrompt = () => {
        if (!dashboard) return "";
        const { kpi, benchmarks, defaulterAnalysis, concessionAnalysis, tcDropoutAnalysis } = dashboard;
        return `You are a financial and data support AI assistant for the Entab Fee Analytics Dashboard. You help admins and users solve problems related to fee collections, billing, defaulters, concessions, and revenue performance.

When answering, always use the following formatting triggers to help the UI render your response beautifully:
- For a summary, start with '**Quick Answer:**'
- For instructions, always use '**Step-by-Step Guide:**' as a heading, then list each step as a numbered list (1., 2., ...) (very important) (ensure all steps are clearly given in every response think step by step)
- For important notes, use '**Note:**' or '**Warning:**' at the start of the line whenever it is important to the user
- Use markdown formatting for clarity (bold for headings, lists, etc.)

If a scenario matches, provide the steps or answer in a clear, friendly, and professional manner using the above structure. Remember if exists step by step guide is more important than quick answers or warning. If you don't have info on that particular query ask the user create a new support ticket or send a mail to support@entab.org.

FEE DASHBOARD CONTEXT:
- Total students: ${kpi.totalStudents}
- Total fee collection: ${formatCurrency(kpi.totalFeeCollection)}  
- Collection rate: ${formatPercentage(kpi.collectionRate)} (target: ${benchmarks.collectionRateBenchmark}%)
- Total defaulters: ${kpi.totalDefaulters} (${formatPercentage(kpi.defaulterRate)} of students; target: <${benchmarks.defaulterRateBenchmark}%)
- Outstanding balance (pending recovery): ${formatCurrency(kpi.totalBalance)}
- Concession given: ${formatCurrency(concessionAnalysis.totalConcessionGiven)} (${formatPercentage(concessionAnalysis.concessionRate)} of collection)
- Students with concession: ${concessionAnalysis.studentsWithConcession}
- Concession defaulters: ${concessionAnalysis.concessionDefaulters} (${formatPercentage(concessionAnalysis.concessionDefaulterRate)} rate)
- TC/Dropout count: ${tcDropoutAnalysis.totalTcDropouts}, revenue loss: ${formatCurrency(tcDropoutAnalysis.revenueLoss)}
- Retention rate: ${formatPercentage(tcDropoutAnalysis.retentionRate)} (target: ${benchmarks.retentionRateBenchmark}%)
- Digital adoption: ${kpi.digitalAdoption}% (target: ${benchmarks.digitalAdoptionBenchmark}%)
- Habitual defaulters: ${defaulterAnalysis.habitualDefaulters}
- First-time defaulters: ${defaulterAnalysis.firstTimeDefaulters}

Base your analytics answers purely on this datastore.`;
    };

    // Generate insight cards from live data
    const buildInsights = () => {
        if (!dashboard) return [];
        const { kpi, benchmarks, defaulterAnalysis, concessionAnalysis, tcDropoutAnalysis } = dashboard;

        const collectionGap = benchmarks.collectionRateBenchmark - kpi.collectionRate;
        const concessionRisk = concessionAnalysis.concessionDefaulterRate;
        const retentionGap = benchmarks.retentionRateBenchmark - tcDropoutAnalysis.retentionRate;

        return [
            {
                id: "collection",
                icon: (collectionGap > 0 ? TrendingDown : TrendingUp) as LucideIcon,
                color: collectionGap > 0 ? "#F59E0B" : "#10B981",
                bg: collectionGap > 0 ? "from-amber-50 to-orange-50 border-amber-100" : "from-emerald-50 to-green-50 border-emerald-100",
                label: "Collection Performance",
                metric: formatPercentage(kpi.collectionRate),
                insight: collectionGap > 0
                    ? `${formatPercentage(collectionGap)} below the ${benchmarks.collectionRateBenchmark}% target. Recovering the ${formatCurrency(kpi.totalBalance, true)} outstanding could close this gap significantly.`
                    : `Exceeds the ${benchmarks.collectionRateBenchmark}% target by ${formatPercentage(-collectionGap)}. Maintain momentum with proactive reminders before due dates.`,
            },
            {
                id: "defaulters",
                icon: AlertTriangle as LucideIcon,
                color: "#EF4444",
                bg: "from-red-50 to-rose-50 border-red-100",
                label: "Defaulter Risk",
                metric: `${defaulterAnalysis.habitualDefaulters} habitual`,
                insight: `${defaulterAnalysis.habitualDefaulters} students have defaulted repeatedly. They represent ${formatPercentage((defaulterAnalysis.habitualDefaulters / kpi.totalStudents) * 100)} of enrolment but likely a disproportionate share of outstanding balance. Priority for targeted outreach.`,
            },
            {
                id: "concession",
                icon: BadgePercent as LucideIcon,
                color: concessionRisk > 20 ? "#F59E0B" : "#3B82F6",
                bg: concessionRisk > 20 ? "from-amber-50 to-yellow-50 border-amber-100" : "from-blue-50 to-indigo-50 border-blue-100",
                label: "Concession Leakage",
                metric: formatPercentage(concessionRisk) + " default rate",
                insight: `${concessionAnalysis.concessionDefaulters} students receiving concessions are also defaulting — a ${formatPercentage(concessionRisk)} leakage rate. Review concession eligibility to reduce unproductive waivers.`,
            },
            {
                id: "retention",
                icon: (retentionGap > 0 ? TrendingDown : TrendingUp) as LucideIcon,
                color: retentionGap > 0 ? "#8B5CF6" : "#10B981",
                bg: retentionGap > 0 ? "from-violet-50 to-purple-50 border-violet-100" : "from-emerald-50 to-green-50 border-emerald-100",
                label: "Retention & TC Loss",
                metric: formatCurrency(tcDropoutAnalysis.revenueLoss, true) + " lost",
                insight: `${tcDropoutAnalysis.totalTcDropouts} TC/dropout students caused ${formatCurrency(tcDropoutAnalysis.revenueLoss, true)} in revenue loss. Retention rate is ${formatPercentage(tcDropoutAnalysis.retentionRate)}${retentionGap > 0 ? `, ${formatPercentage(retentionGap)} below target` : ` — above target`}. Early intervention for at-risk students is key.`,
            },
        ] as InsightCard[];
    };

    const quickPrompts = [
        "Which student group poses the highest default risk?",
        "How can we improve digital payment adoption?",
        "What's the fastest way to recover the outstanding balance?",
        "Are concessions being given to the right students?",
    ];

    const sendMessage = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || thinking) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setThinking(true);
        setChatReady(true);

        try {
            const systemPrompt = buildSystemPrompt();

            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: trimmed,
                    context: systemPrompt
                })
            });

            if (!response.ok) throw new Error("API request failed");

            const result = await response.json();
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", text: result.text };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            const errMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                text: "Sorry, I couldn't reach the AI service right now. Please try again.",
            };
            setMessages((prev) => [...prev, errMsg]);
        } finally {
            setThinking(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setChatReady(false);
        try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch { /* ignore */ }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                <div className="h-8 w-64 bg-slate-100 rounded" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-100 rounded-xl" />)}
                </div>
                <div className="h-96 bg-slate-100 rounded-xl" />
            </div>
        );
    }

    const insights = buildInsights();

    return (
        <div className="space-y-8 font-open-sans">
            {/* ── Header + DataReports video ─────────────────────────────── */}
            <div className="flex items-start justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-[#1E293B] font-roboto">AI Insights</h2>
                    </div>
                    <p className="text-sm font-semibold text-[#64748B] max-w-lg">
                        Advanced analysis of your fee data. Explore auto-generated insights or ask anything about your school's financial performance.
                    </p>
                </motion.div>

                {/* DataReports.mp4 — decorative data reel (bare layout, no card) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="shrink-0"
                    style={{ width: 140, height: 70 }}
                >
                    <video
                        src="/DataReports.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-lg opacity-80 mix-blend-multiply"
                    />
                </motion.div>
            </div>

            {/* ── Insight Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.map((ins, i) => {
                    const Icon = ins.icon;
                    return (
                        <motion.div
                            key={ins.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.12 }}
                        >
                            <Card className={`bg-gradient-to-br ${ins.bg} border p-5 h-full`} style={{ borderRadius: "14px" }}>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ins.color + "20" }}>
                                        <Icon className="h-4 w-4" style={{ color: ins.color }} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">{ins.label}</p>
                                </div>
                                <p className="text-2xl font-black font-roboto mb-2" style={{ color: ins.color }}>{ins.metric}</p>
                                <p className="text-xs font-semibold text-[#475569] leading-relaxed">{ins.insight}</p>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Chatbot ────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
            >
                <Card className="border-none overflow-hidden" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.06)", borderRadius: "16px" }}>
                    {/* Chat header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-[#1E293B]">AI Fee Analyst</p>
                                <p className="text-[10px] font-semibold text-[#64748B]">Ask anything about your fee data</p>
                            </div>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={clearChat}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] hover:text-[#1E293B] transition-colors"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Quick prompts — show only before first message */}
                    <AnimatePresence>
                        {!chatReady && (
                            <motion.div
                                initial={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-6 pt-5 pb-2"
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-3">Suggested questions</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickPrompts.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => { setInput(q); inputRef.current?.focus(); }}
                                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-[#475569] hover:bg-purple-100 hover:text-purple-700 transition-all border border-transparent hover:border-purple-200"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Messages */}
                    <div className="px-6 py-4 min-h-[260px] max-h-[420px] overflow-y-auto space-y-4" style={{ scrollBehavior: "smooth" }}>
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.28 }}
                                    layout
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "ai" && (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                                            <Sparkles className="h-3.5 w-3.5 text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm font-medium"
                                            : "bg-slate-50 text-[#1E293B] border border-slate-100 rounded-tl-sm font-normal"
                                            }`}
                                    >
                                        {msg.role === "ai" ? <TypewriterMessage text={msg.text} /> : msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Thinking indicator — aimation.mp4 */}
                        <AnimatePresence>
                            {thinking && (
                                <motion.div
                                    key="thinking"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-2 rounded-2xl rounded-tl-sm">
                                        <video
                                            src="/aimation.mp4"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="h-6 w-6 rounded object-cover"
                                        />
                                        <span className="text-xs font-semibold text-[#64748B]">Analysing your data…</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input bar */}
                    <div className="px-6 pb-5 pt-3 border-t border-slate-100">
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                            className="flex items-center gap-3"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your fee data, defaulters, trends…"
                                disabled={thinking}
                                className="flex-1 text-sm px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all disabled:opacity-50"
                            />
                            <motion.button
                                type="submit"
                                disabled={!input.trim() || thinking}
                                whileTap={{ scale: 0.93 }}
                                whileHover={{ scale: 1.05 }}
                                className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                            >
                                <Send className="h-4 w-4" />
                            </motion.button>
                        </form>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
