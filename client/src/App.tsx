import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardHome } from "@/pages/DashboardHome";
import { CollectionPerformance } from "@/pages/CollectionPerformance";
import { DefaulterAnalytics } from "@/pages/DefaulterAnalytics";
import { ConcessionsLosses } from "@/pages/ConcessionsLosses";
import { DemographicsOperations } from "@/pages/DemographicsOperations";
import { AIInsights } from "@/components/views/AIInsights";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardHome} />
        <Route path="/collections" component={CollectionPerformance} />
        <Route path="/defaulters" component={DefaulterAnalytics} />
        <Route path="/concessions" component={ConcessionsLosses} />
        <Route path="/demographics" component={DemographicsOperations} />
        <Route path="/ai-insights" component={AIInsights} />
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
