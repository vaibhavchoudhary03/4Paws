import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AnimalsIndex from "@/pages/animals/index";
import AnimalDetail from "@/pages/animals/[id]";
import IntakeWizard from "@/pages/intake/wizard";
import MedicalIndex from "@/pages/medical/index";
import AdoptionsPipeline from "@/pages/adoptions/pipeline";
import FostersPortal from "@/pages/fosters/portal";
import VolunteersPortal from "@/pages/volunteers/portal";
import ReportsIndex from "@/pages/reports/index";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/animals/:id" component={AnimalDetail} />
      <Route path="/animals" component={AnimalsIndex} />
      <Route path="/intake" component={IntakeWizard} />
      <Route path="/medical" component={MedicalIndex} />
      <Route path="/adoptions" component={AdoptionsPipeline} />
      <Route path="/fosters" component={FostersPortal} />
      <Route path="/volunteers" component={VolunteersPortal} />
      <Route path="/reports" component={ReportsIndex} />
      <Route component={NotFound} />
    </Switch>
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
