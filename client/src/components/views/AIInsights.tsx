import { motion } from "framer-motion";
import { Sparkles, Clock, Zap } from "lucide-react";

// NOTE: The full AI chatbot implementation exists below as a future integration.
// The page is currently in "Coming Soon" mode per product roadmap.

export function AIInsights() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(47,36,131,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 70% 60%, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Floating rings — purely decorative */}
      <motion.div
        className="absolute rounded-full border border-[#2F2483]/10"
        style={{ width: 420, height: 420 }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full border border-[#6366F1]/10"
        style={{ width: 280, height: 280 }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="relative mb-8"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #2F2483 0%, #6366F1 100%)',
          }}
        >
          <Sparkles className="w-9 h-9 text-white" />
        </div>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-40"
          style={{ background: 'linear-gradient(135deg, #2F2483, #6366F1)' }}
        />
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center max-w-lg relative z-10"
      >
        <h1
          className="text-3xl font-bold mb-3 tracking-tight"
          style={{ color: '#1E293B' }}
        >
          AI Insights
        </h1>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
          style={{ background: 'rgba(47,36,131,0.08)', color: '#2F2483' }}
        >
          <Clock className="w-3 h-3" />
          Coming Soon
        </div>
        <p className="text-[15px] text-[#64748B] leading-relaxed">
          Advanced fee analytics powered by Gemini AI. We're training the model on your historical data to surface predictive insights, early-warning flags, and actionable recommendations.
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-3 mt-8 relative z-10"
      >
        {[
          'Predictive defaulter alerts',
          'Natural language queries',
          'Auto-generated reports',
          'Revenue forecasting',
        ].map((f) => (
          <div
            key={f}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium border"
            style={{ borderColor: '#E2E8F0', color: '#475569', background: '#FFFFFF' }}
          >
            <Zap className="w-3 h-3" style={{ color: '#2F2483' }} />
            {f}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
