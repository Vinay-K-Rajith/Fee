import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ExecutiveOverview } from "@/components/views/ExecutiveOverview";
import { DefaulterAnalysis } from "@/components/views/DefaulterAnalysis";
import { LeakageConcessions } from "@/components/views/LeakageConcessions";
import { ActionCommandCenter } from "@/components/views/ActionCommandCenter";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={ExecutiveOverview} />
        <Route path="/defaulters" component={DefaulterAnalysis} />
        <Route path="/leakage" component={LeakageConcessions} />
        <Route path="/action" component={ActionCommandCenter} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
