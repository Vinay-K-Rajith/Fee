import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  WalletCards, 
  UserX, 
  Droplet, 
  Users, 
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
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-full shrink-0 shadow-lg">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <WalletCards className="h-6 w-6 text-sidebar-ring" />
          EduFinance
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.id} href={item.path}>
              <a 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-white" 
                    : "text-slate-300 hover:bg-sidebar-accent/50 hover:text-white"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-sidebar-ring" : ""}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent/30 rounded-lg p-4 text-sm">
          <p className="text-slate-300 mb-2">School Status</p>
          <div className="flex items-center gap-2 text-white font-medium">
            <span className="h-2 w-2 rounded-full bg-success"></span>
            Collection Active
          </div>
        </div>
      </div>
    </aside>
  );
}
