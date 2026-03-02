import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  WalletCards, 
  UserX, 
  Droplet, 
  ShieldAlert
} from "lucide-react";

const navItems = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, path: "/" },
  { id: "defaulters", label: "Defaulter Analysis", icon: UserX, path: "/defaulters" },
  { id: "leakage", label: "Leakage & Concessions", icon: Droplet, path: "/leakage" },
  { id: "action", label: "Action Command Center", icon: ShieldAlert, path: "/action" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white text-[#5A6474] flex flex-col h-full shrink-0 border-r border-[#E2E8F0] font-open-sans">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-[#1E293B] flex items-center gap-2 font-roboto">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <WalletCards className="h-5 w-5 text-emerald-600" />
          </div>
          EduFinance
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.id} href={item.path}>
              <div 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                  isActive 
                    ? "bg-[#E6F0F9] text-[#1E293B] font-bold" 
                    : "text-[#5A6474] hover:bg-slate-50 font-medium"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? "text-[#3B82F6]" : "text-[#5A6474] group-hover:text-[#1E293B]"
                }`} />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#E2E8F0] mt-auto">
        <div className="bg-slate-50 rounded-xl p-4 text-sm border border-[#E2E8F0]">
          <p className="text-[#64748B] mb-2 font-medium">School Status</p>
          <div className="flex items-center gap-2 text-[#1E293B] font-bold">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse"></span>
            Collection Active
          </div>
        </div>
      </div>
    </aside>
  );
}
