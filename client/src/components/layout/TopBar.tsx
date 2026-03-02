import { Bell, Search, Download, UserCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="h-16 bg-secondary/50 border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students, classes..." 
            className="pl-9 bg-white border-none shadow-sm focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-md shadow-sm border border-slate-100">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Academic Year 2024-25</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" className="bg-white border-accent/20 text-accent hover:bg-accent hover:text-white transition-colors" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
        
        <div className="h-8 w-px bg-border mx-2"></div>
        
        <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-secondary"></span>
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer pl-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-primary">Admin User</p>
            <p className="text-xs text-muted-foreground">Finance Head</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
