import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  WalletCards,
  UserX,
  Droplet,
  Sparkles,
  BarChart3,
  TrendingUp,
  PieChart
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "collections", label: "Collection Performance", icon: TrendingUp, path: "/collections" },
  { id: "defaulters", label: "Defaulter Analytics", icon: UserX, path: "/defaulters", badge: "Critical" },
  { id: "concessions", label: "Concessions & Losses", icon: Droplet, path: "/concessions" },
  { id: "demographics", label: "Demographics & Ops", icon: PieChart, path: "/demographics" },
  { id: "ai-insights", label: "AI Insights", icon: Sparkles, path: "/ai-insights" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white text-[#5A6474] flex flex-col h-full shrink-0 border-r border-[#E2E8F0] font-open-sans">
      <div className="p-6">
        <div className="flex flex-col gap-1 items-start">
          <img src="https://www.entab.in/images-latest/logo.webp" alt="Entab Logo" className="h-8 object-contain" />
          <p className="text-[11px] font-black tracking-widest text-[#64748B] mt-1 font-open-sans uppercase">Fee Analytics</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link key={item.id} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer text-[13.5px] ${isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} strokeWidth={isActive ? 2 : 1.7} />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${item.id === "ai-insights"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-blue-100 text-blue-600"
                    }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>



      <div className="p-4 border-t border-[#E2E8F0]">
        <div className="bg-slate-50 rounded-xl p-4 text-sm border border-[#E2E8F0]">
          <p className="text-[#64748B] mb-2 font-medium">System Status</p>
          <div className="flex items-center gap-2 text-[#1E293B] font-bold">
            <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            All Systems Active
          </div>
        </div>
      </div>
    </aside>
  );
}
