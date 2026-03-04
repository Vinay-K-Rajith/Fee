import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Smartphone, CreditCard, Gift, ArrowRight, Users, AlertTriangle, TrendingUp, Calendar, Target } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDashboard, formatCurrency } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";

export function ActionCommandCenter() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
        <Skeleton className="h-12 w-80" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error loading action center</p>
      </div>
    );
  }

  const { recommendations, defaulterAnalysis, kpi, benchmarks, tcDropoutAnalysis, concessionAnalysis } = dashboard;

  // Group recommendations by priority
  const immediateActions = recommendations.filter(r => r.priority === 'high').slice(0, 3);
  const systemAutomations = recommendations.filter(r => r.priority === 'medium').slice(0, 2);
  const longTermActions = recommendations.filter(r => r.priority === 'low').slice(0, 2);

  // Helper to get icon by category
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'digital': return CreditCard;
      case 'reminder': return Smartphone;
      case 'collection': return TrendingUp;
      case 'defaulter': return AlertTriangle;
      case 'concession': return Gift;
      case 'retention': return Users;
      case 'outreach': return MapPin;
      case 'scheduling': return Calendar;
      default: return Target;
    }
  };

  const getColorForPriority = (priority: string) => {
    switch (priority) {
      case 'critical': return { text: 'text-red-500', bg: 'bg-red-50' };
      case 'high': return { text: 'text-orange-500', bg: 'bg-orange-50' };
      case 'medium': return { text: 'text-blue-500', bg: 'bg-blue-50' };
      default: return { text: 'text-slate-500', bg: 'bg-slate-50' };
    }
  };

  // Find critical zone from location analysis
  const sortedLocations = [...defaulterAnalysis.locationWise].sort((a: any, b: any) => b.defaulterRate - a.defaulterRate);
  const criticalZone = sortedLocations[0];

  const habitualDefaultersCount = defaulterAnalysis.habitualDefaulters;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B] tracking-tight font-roboto">Action Command Center</h2>
          <p className="text-sm font-semibold text-[#64748B] mt-1 font-open-sans">Direct operational implementation engine.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-open-sans">Total Recommendations</p>
          <p className="text-xl font-black text-[#3B82F6] font-roboto">{recommendations.length} Insights</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bento-card border-none p-4" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 font-open-sans">Habitual Defaulters</p>
              <p className="text-lg font-black text-[#ef4444] font-roboto">{habitualDefaultersCount}</p>
            </div>
          </div>
        </Card>
        <Card className="bento-card border-none p-4" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Gift className="h-4 w-4 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 font-open-sans">Concession Defaulters</p>
              <p className="text-lg font-black text-[#F59E0B] font-roboto">{concessionAnalysis.concessionDefaulters}</p>
            </div>
          </div>
        </Card>
        <Card className="bento-card border-none p-4" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 font-open-sans">TC/Dropouts</p>
              <p className="text-lg font-black text-[#3B82F6] font-roboto">{tcDropoutAnalysis.totalTcDropouts}</p>
            </div>
          </div>
        </Card>
        <Card className="bento-card border-none p-4" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 font-open-sans">Potential Recovery</p>
              <p className="text-lg font-black text-[#10B981] font-roboto">{formatCurrency(kpi.totalExpected - kpi.totalFeeCollection, true)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#ef4444]">
            <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">Immediate Actions</h3>
            <span className="bg-red-50 text-[#ef4444] text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest font-open-sans">Critical</span>
          </div>
          
          {immediateActions.map((action) => {
            const Icon = getIconForCategory(action.category);
            const colors = getColorForPriority(action.priority);
            return (
              <Card 
                key={action.id} 
                className="bento-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-none shadow-md group"
                onClick={() => setActiveDialog(action.category)}
              >
                <div className="flex gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} transition-transform group-hover:rotate-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#1E293B] font-roboto group-hover:text-[#3B82F6] transition-colors">{action.title}</h4>
                    <p className="text-xs font-bold text-[#64748B] mt-2 leading-relaxed font-open-sans line-clamp-2">{action.description}</p>
                    {action.impact && (
                      <p className="text-[10px] font-black text-emerald-500 mt-2 font-open-sans">Expected: {action.impact}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#3B82F6]">
            <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">System Automations</h3>
            <span className="bg-blue-50 text-[#3B82F6] text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest font-open-sans">Medium Term</span>
          </div>
          
          {systemAutomations.map((action) => {
            const Icon = getIconForCategory(action.category);
            const colors = getColorForPriority(action.priority);
            return (
              <Card 
                key={action.category} 
                className="bento-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-none shadow-md group"
                onClick={() => setActiveDialog(action.category)}
              >
                <div className="flex gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} transition-transform group-hover:rotate-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-[#1E293B] font-roboto group-hover:text-[#3B82F6] transition-colors">{action.title}</h4>
                    <p className="text-xs font-bold text-[#64748B] mt-2 leading-relaxed font-open-sans line-clamp-2">{action.description}</p>
                    {action.impact && (
                      <p className="text-[10px] font-black text-emerald-500 mt-2 font-open-sans">Expected: {action.impact}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">Long-Term Strategy</h3>
            <span className="bg-slate-50 text-slate-400 text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest font-open-sans">Planning</span>
          </div>
          
          {longTermActions.length > 0 ? longTermActions.map((action) => (
            <Card key={action.id} className="bento-card border-none bg-slate-50/50 shadow-sm border-dashed border-2 border-slate-200">
              <h4 className="text-base font-black text-slate-500 font-roboto">{action.title}</h4>
              <p className="text-xs font-bold text-slate-400 mt-2 font-open-sans">{action.description}</p>
              <Button variant="link" className="p-0 mt-4 h-auto text-[11px] font-black uppercase text-slate-400 hover:text-[#1E293B]">
                View Framework <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </Card>
          )) : (
            <>
              <Card className="bento-card border-none bg-slate-50/50 shadow-sm border-dashed border-2 border-slate-200">
                <h4 className="text-base font-black text-slate-400 font-roboto">Optimize Fee Structure</h4>
                <p className="text-xs font-bold text-slate-400 mt-2 font-open-sans">Yearly review of flexible, tiered payment plans.</p>
                <Button variant="link" className="p-0 mt-4 h-auto text-[11px] font-black uppercase text-slate-400 hover:text-[#1E293B]">
                  View Framework <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Card>

              <Card className="bento-card border-none bg-slate-50/50 shadow-sm border-dashed border-2 border-slate-200">
                <h4 className="text-base font-black text-slate-400 font-roboto">Revenue Diversification</h4>
                <p className="text-xs font-bold text-slate-400 mt-2 font-open-sans">Introduction of value-added monetizeable facility programs.</p>
                <Button variant="link" className="p-0 mt-4 h-auto text-[11px] font-black uppercase text-slate-400 hover:text-[#1E293B]">
                  View Framework <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </Card>
            </>
          )}
        </div>
      </div>

      <Card className="bento-card border-none mt-12 overflow-hidden relative min-h-[400px]" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', borderRadius: '12px' }}>
        <div className="absolute inset-0 bg-slate-50 z-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231E293B' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-[#1E293B] font-roboto">Geo-Tagged Risk Map</h3>
              <p className="text-xs font-bold text-[#64748B] font-open-sans">Visual delinquency clustering by location</p>
            </div>
            <Button className="bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-black uppercase tracking-widest px-6 h-10 rounded-lg">
              Generate Targeted Campaign
            </Button>
          </div>

          <div className="flex-1 relative">
            {criticalZone && (
              <div className="absolute top-[20%] left-[30%] animate-bounce">
                <MapPin className="text-[#ef4444] h-10 w-10 drop-shadow-xl" fill="white" strokeWidth={2.5} />
                <div className="bg-white px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-black text-[#ef4444] absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap border border-red-50">
                  {criticalZone.location} ({Math.round(criticalZone.defaulterRate)}% defaulters)
                </div>
              </div>
            )}
            
            {defaulterAnalysis.locationWise.slice(1, 3).map((loc: any) => (
              <div key={loc.location} className={`absolute`} style={{ top: `${40}%`, left: `${55}%` }}>
                <MapPin 
                  className={`h-8 w-8 drop-shadow-lg opacity-60 ${loc.defaulterRate > 30 ? 'text-[#F59E0B]' : 'text-[#10B981]'}`} 
                  fill="white" 
                  strokeWidth={2.5} 
                />
              </div>
            ))}
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <p className="text-[#1E293B] font-black tracking-[0.3em] uppercase text-xl font-roboto">Interactive Map Interface</p>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={activeDialog === "digital"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl p-8 rounded-2xl">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
              <CreditCard className="w-7 h-7" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#1E293B] font-roboto">Digital Payment Control</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold font-open-sans mt-2">
              Optimize collection pipelines for the {benchmarks.digitalAdoptionBenchmark}% digital benchmark.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-8">
            {[
              { title: "Enable UPI Gateway", desc: "Allow PhonePe, GPay, etc." },
              { title: "NACH Auto-Debit", desc: "Setup monthly mandates." },
              { title: "Smart Confirmation", desc: "Instant digital receipts." }
            ].map((item, idx) => (
              <div key={`${item.title}-${idx}`} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-sm font-black text-[#1E293B] font-roboto">{item.title}</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 font-open-sans">{item.desc}</p>
                </div>
                <Switch defaultChecked={idx !== 1} />
              </div>
            ))}
          </div>
          
          <Button className="w-full bg-[#1E293B] hover:bg-[#334155] text-white font-black uppercase tracking-widest h-12 rounded-xl" onClick={() => setActiveDialog(null)}>
            Apply Global Configuration
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "reminder"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl p-8 rounded-2xl">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
              <Smartphone className="w-7 h-7" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#1E293B] font-roboto">Reminder Engine</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold font-open-sans mt-2">
              Trigger behavioral-targeted communication cycles.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-8">
            <Button className="w-full justify-start h-14 bg-[#1E293B] text-white hover:bg-[#334155] px-5 rounded-xl border-none shadow-lg">
              <Smartphone className="w-5 h-5 mr-4" />
              <span className="font-bold">Queue WhatsApp: Habitual Defaulters ({habitualDefaultersCount})</span>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-14 bg-white text-[#1E293B] border-slate-200 hover:bg-slate-50 px-5 rounded-xl font-bold">
              <Smartphone className="w-5 h-5 mr-4" />
              Trigger Bulk SMS Alert ({defaulterAnalysis.totalDefaulters} defaulters)
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-14 bg-white text-[#1E293B] border-slate-200 hover:bg-slate-50 px-5 rounded-xl font-bold">
              <Smartphone className="w-5 h-5 mr-4" />
              Schedule Parent Financial Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "defaulter"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl p-8 rounded-2xl">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#1E293B] font-roboto">Defaulter Management</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold font-open-sans mt-2">
              Priority intervention for {defaulterAnalysis.totalDefaulters} defaulting students.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-8">
            <div className="p-5 bg-red-50 rounded-xl border border-red-100">
              <h4 className="text-sm font-black text-[#ef4444] font-roboto">Habitual Defaulters</h4>
              <p className="text-2xl font-black text-[#ef4444] mt-1 font-roboto">{habitualDefaultersCount}</p>
              <p className="text-[11px] font-bold text-red-400 mt-1 font-open-sans">Students defaulting 3+ quarters</p>
            </div>
            <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
              <h4 className="text-sm font-black text-[#F59E0B] font-roboto">Total Pending Balance</h4>
              <p className="text-2xl font-black text-[#F59E0B] mt-1 font-roboto">{formatCurrency(defaulterAnalysis.locationWise.reduce((sum: number, loc: any) => sum + loc.totalBalance, 0), true)}</p>
              <p className="text-[11px] font-bold text-orange-400 mt-1 font-open-sans">Recoverable amount</p>
            </div>
          </div>
          
          <Button className="w-full bg-[#1E293B] hover:bg-[#334155] text-white font-black uppercase tracking-widest h-12 rounded-xl" onClick={() => setActiveDialog(null)}>
            Launch Recovery Campaign
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}