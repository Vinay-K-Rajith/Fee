import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MapPin, Smartphone, CreditCard, Gift, ArrowRight, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sample action modules based on the brief
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
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    description: "Set up SMS, WhatsApp, and email reminders for upcoming due dates."
  }
];

const systemAutomations = [
  {
    id: "loyalty-program",
    title: "Loyalty & Referral Program",
    icon: Gift,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    description: "Incentivize timely payments with early discounts and referral benefits."
  },
  {
    id: "geo-targeting",
    title: "Geo-Targeted Outreach",
    icon: MapPin,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    description: "Generate targeted campaigns for problematic zones identified in the heatmap."
  }
];

const longTermStrategies = [
  {
    id: "fee-structure",
    title: "Optimize Fee Structure",
    icon: null,
    color: "text-slate-500",
    bgColor: "bg-slate-50",
    description: "Conduct a yearly review and offer flexible, tiered payment plans."
  },
  {
    id: "revenue-streams",
    title: "Diversify Revenue",
    icon: null,
    color: "text-slate-500",
    bgColor: "bg-slate-50",
    description: "Introduce value-added programs and monetize school facilities."
  }
];

export function ActionCommandCenter() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-primary">Action Command Center</h2>
        <p className="text-muted-foreground mt-1">Implement strategy and operations directly from this dashboard.</p>
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Immediate Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-destructive">
            <h3 className="font-semibold text-primary">Immediate Actions</h3>
            <span className="bg-slate-100 text-slate-600 text-xs py-1 px-2 rounded-full font-medium">High Priority</span>
          </div>
          
          {immediateActions.map(action => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.id} 
                className="floating-card cursor-pointer hover:border-accent/50 transition-all hover:shadow-lg group"
                onClick={() => setActiveDialog(action.id)}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.bgColor} ${action.color}`}>
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary group-hover:text-accent transition-colors">{action.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Column 2: System Automations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-accent">
            <h3 className="font-semibold text-primary">System Automations</h3>
            <span className="bg-slate-100 text-slate-600 text-xs py-1 px-2 rounded-full font-medium">Medium Term</span>
          </div>
          
          {systemAutomations.map(action => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.id} 
                className="floating-card cursor-pointer hover:border-accent/50 transition-all hover:shadow-lg group"
                onClick={() => setActiveDialog(action.id)}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${action.bgColor} ${action.color}`}>
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-primary group-hover:text-accent transition-colors">{action.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Column 3: Long-Term Strategies */}
        <div className="space-y-4 opacity-80">
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-300">
            <h3 className="font-semibold text-primary">Long-Term Strategies</h3>
            <span className="bg-slate-100 text-slate-600 text-xs py-1 px-2 rounded-full font-medium">Planning</span>
          </div>
          
          {longTermStrategies.map(action => (
            <Card key={action.id} className="bg-white border-slate-200 border-dashed shadow-sm">
              <CardContent className="p-5">
                <h4 className="font-bold text-slate-700">{action.title}</h4>
                <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                <Button variant="link" className="px-0 mt-2 h-auto text-xs text-slate-400">View Framework <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>

      {/* Map Section */}
      <Card className="floating-card overflow-hidden border-0 mt-8">
        <div className="p-6 pb-2 border-b border-border bg-white flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary">Geo-Tagged Defaulter Map</h3>
            <p className="text-sm text-muted-foreground">Identifying problematic areas/locations visually</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-white">
            Generate Geo-Targeted Campaign
          </Button>
        </div>
        <CardContent className="p-0 bg-slate-50 relative h-[300px]">
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-[#e8efe9] opacity-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          {/* Map Pins */}
          <div className="absolute top-[30%] left-[25%] animate-bounce">
            <MapPin className="text-destructive h-8 w-8 drop-shadow-md" fill="white" />
            <div className="bg-white px-2 py-1 rounded shadow-sm text-xs font-bold absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">East Zone (High)</div>
          </div>
          
          <div className="absolute top-[60%] left-[60%]">
            <MapPin className="text-accent h-6 w-6 drop-shadow-md" fill="white" />
          </div>
          
          <div className="absolute top-[40%] left-[75%]">
            <MapPin className="text-accent h-6 w-6 drop-shadow-md" fill="white" />
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-400 font-medium tracking-widest uppercase text-sm">INTERACTIVE MAP VISUALIZATION</p>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs for Action Modules */}
      <Dialog open={activeDialog === "digital-payments"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl text-primary">Strengthen Digital Payments</DialogTitle>
            <DialogDescription className="text-slate-500">
              Configure system integrations to push towards the 75% digital payment benchmark.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <h4 className="font-semibold text-primary">Enable UPI Integration</h4>
                <p className="text-sm text-slate-500">Allow payments via PhonePe, GPay, etc.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <h4 className="font-semibold text-primary">Auto-Debit Enrollment</h4>
                <p className="text-sm text-slate-500">Setup mandate via NACH for monthly fees.</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <h4 className="font-semibold text-primary">Real-time Transaction Alerts</h4>
                <p className="text-sm text-slate-500">Send instant confirmation receipts to parents.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90">Save Configuration</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "automate-reminders"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl text-primary">Automate Reminders</DialogTitle>
            <DialogDescription className="text-slate-500">
              Configure communication channels for fee reminders. Focus on Business & Daily Wage segments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Button className="w-full justify-start h-14 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 shadow-none">
              <Smartphone className="w-5 h-5 mr-3" />
              Send WhatsApp Reminder to Habitual Defaulters (142 queued)
            </Button>
            
            <Button className="w-full justify-start h-14 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-none">
              <Smartphone className="w-5 h-5 mr-3" />
              Trigger Bulk SMS Alert for Upcoming Quarter
            </Button>
            
            <Button className="w-full justify-start h-14 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-none">
              <Smartphone className="w-5 h-5 mr-3" />
              Schedule Monthly Virtual Parent Meet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "loyalty-program"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px] border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl text-primary">Loyalty & Referral Program</DialogTitle>
            <DialogDescription className="text-slate-500">
              Setup incentives to encourage early payments and stable revenue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="p-4 border rounded-xl bg-slate-50">
              <h4 className="font-semibold text-primary mb-2">Early Payment Discount</h4>
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded border flex-1 text-center font-medium">5% Off Total</div>
                <span className="text-slate-400">if paid before</span>
                <div className="bg-white p-2 rounded border flex-1 text-center font-medium">April 15th</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <h4 className="font-semibold text-primary">Sibling Priority Admission</h4>
                <p className="text-sm text-slate-500">For accounts with 0 default history.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
             <Button className="bg-primary hover:bg-primary/90 w-full">Activate Program</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
