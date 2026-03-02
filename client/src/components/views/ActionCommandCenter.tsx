import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Smartphone, CreditCard, Gift, ArrowRight } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const immediateActions = [
  {
    id: "digital-payments",
    title: "Strengthen Digital Payments",
    icon: CreditCard,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    description: "Implement 100% digital payment methods to reduce administrative workload."
  },
  {
    id: "automate-reminders",
    title: "Automate Reminders",
    icon: Smartphone,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    description: "Set up SMS, WhatsApp, and email reminders for upcoming due dates."
  }
];

const systemAutomations = [
  {
    id: "loyalty-program",
    title: "Loyalty & Referral Program",
    icon: Gift,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    description: "Incentivize timely payments with early discounts and referral benefits."
  },
  {
    id: "geo-targeting",
    title: "Geo-Targeted Outreach",
    icon: MapPin,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    description: "Generate targeted campaigns for problematic zones identified in the heatmap."
  }
];

export function ActionCommandCenter() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-source-sans">
      <div>
        <h2 className="text-2xl font-black text-[#1E293B] tracking-tight font-roboto">Action Command Center</h2>
        <p className="text-sm font-semibold text-[#64748B] mt-1 font-open-sans">Direct operational implementation engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#ef4444]">
            <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">Immediate Actions</h3>
            <span className="bg-red-50 text-[#ef4444] text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest font-open-sans">Critical</span>
          </div>
          
          {immediateActions.map(action => (
            <Card 
              key={action.id} 
              className="bento-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-none shadow-md group"
              onClick={() => setActiveDialog(action.id)}
            >
              <div className="flex gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${action.bgColor} ${action.color} transition-transform group-hover:rotate-6`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#1E293B] font-roboto group-hover:text-[#3B82F6] transition-colors">{action.title}</h4>
                  <p className="text-xs font-bold text-[#64748B] mt-2 leading-relaxed font-open-sans line-clamp-2">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#3B82F6]">
            <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">System Automations</h3>
            <span className="bg-blue-50 text-[#3B82F6] text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest font-open-sans">Medium Term</span>
          </div>
          
          {systemAutomations.map(action => (
            <Card 
              key={action.id} 
              className="bento-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border-none shadow-md group"
              onClick={() => setActiveDialog(action.id)}
            >
              <div className="flex gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${action.bgColor} ${action.color} transition-transform group-hover:rotate-6`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#1E293B] font-roboto group-hover:text-[#3B82F6] transition-colors">{action.title}</h4>
                  <p className="text-xs font-bold text-[#64748B] mt-2 leading-relaxed font-open-sans line-clamp-2">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
            <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-widest font-roboto">Long-Term Strategy</h3>
            <span className="bg-slate-50 text-slate-400 text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest font-open-sans">Planning</span>
          </div>
          
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
              <p className="text-xs font-bold text-[#64748B] font-open-sans">Visual delinquency clustering</p>
            </div>
            <Button className="bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-black uppercase tracking-widest px-6 h-10 rounded-lg">
              Generate Targeted Campaign
            </Button>
          </div>

          <div className="flex-1 relative">
            <div className="absolute top-[20%] left-[30%] animate-bounce">
              <MapPin className="text-[#ef4444] h-10 w-10 drop-shadow-xl" fill="white" strokeWidth={2.5} />
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-black text-[#ef4444] absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap border border-red-50">East Zone (Critical)</div>
            </div>
            
            <div className="absolute top-[50%] left-[60%]">
              <MapPin className="text-[#3B82F6] h-8 w-8 drop-shadow-lg opacity-60" fill="white" strokeWidth={2.5} />
            </div>

            <div className="absolute top-[40%] left-[75%]">
              <MapPin className="text-[#10B981] h-8 w-8 drop-shadow-lg opacity-60" fill="white" strokeWidth={2.5} />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <p className="text-[#1E293B] font-black tracking-[0.3em] uppercase text-xl font-roboto">Interactive Map Interface</p>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={activeDialog === "digital-payments"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl p-8 rounded-2xl">
          <DialogHeader>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
              <CreditCard className="w-7 h-7" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#1E293B] font-roboto">Digital Payment Control</DialogTitle>
            <DialogDescription className="text-slate-500 font-bold font-open-sans mt-2">
              Optimize collection pipelines for the 75% digital benchmark.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-8">
            {[
              { title: "Enable UPI Gateway", desc: "Allow PhonePe, GPay, etc." },
              { title: "NACH Auto-Debit", desc: "Setup monthly mandates." },
              { title: "Smart Confirmation", desc: "Instant digital receipts." }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-sm font-black text-[#1E293B] font-roboto">{item.title}</h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 font-open-sans">{item.desc}</p>
                </div>
                <Switch defaultChecked={i !== 1} />
              </div>
            ))}
          </div>
          
          <Button className="w-full bg-[#1E293B] hover:bg-[#334155] text-white font-black uppercase tracking-widest h-12 rounded-xl" onClick={() => setActiveDialog(null)}>
            Apply Global Configuration
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "automate-reminders"} onOpenChange={(open) => !open && setActiveDialog(null)}>
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
              <span className="font-bold">Queue WhatsApp: Habitual Defaulters (142)</span>
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-14 bg-white text-[#1E293B] border-slate-200 hover:bg-slate-50 px-5 rounded-xl font-bold">
              <Smartphone className="w-5 h-5 mr-4" />
              Trigger Q4 Bulk SMS Alert
            </Button>
            
            <Button variant="outline" className="w-full justify-start h-14 bg-white text-[#1E293B] border-slate-200 hover:bg-slate-50 px-5 rounded-xl font-bold">
              <Smartphone className="w-5 h-5 mr-4" />
              Schedule Parent Financial Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
