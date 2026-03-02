import { Bell, Search, Download, UserCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0 z-10 font-open-sans">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <Input 
            placeholder="Search students, classes..." 
            className="pl-10 h-10 bg-[#F1F5F9] border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-100 placeholder:text-[#64748B] text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] bg-[#F8F9FA] px-3 py-2 rounded-lg border border-[#E2E8F0] h-9">
          <Calendar className="h-3.5 w-3.5 text-[#3B82F6]" />
          <span className="flex items-center">ACADEMIC YEAR 2024-25</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="h-9 px-4 bg-white border-[#CBD5E1] text-[#1E293B] hover:bg-slate-50 text-xs font-semibold" 
          size="sm"
        >
          <Download className="h-3.5 w-3.5 mr-2" />
          Export Report
        </Button>
        
        <div className="h-8 w-px bg-[#E2E8F0] mx-1"></div>
        
        <button className="relative p-2 text-[#64748B] hover:text-[#1E293B] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#F59E0B] border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer pl-2 group">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[#1E293B] group-hover:text-[#3B82F6] transition-colors">Admin User</p>
            <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Finance Head</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-[#E2E8F0] flex items-center justify-center text-[#64748B] group-hover:border-blue-200 transition-all overflow-hidden">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
