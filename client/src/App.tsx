import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import CarbonCredits from "./pages/CarbonCredits";
import Verification from "./pages/Verification";
import MapView from "./pages/MapView";
import Methodologies from "./pages/Methodologies";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/new" component={NewProject} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/carbon-credits" component={CarbonCredits} />
      <Route path="/verification" component={Verification} />
      <Route path="/map" component={MapView} />
      <Route path="/methodologies" component={Methodologies} />
      <Route path="/users" component={Users} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout>
          <Router />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
