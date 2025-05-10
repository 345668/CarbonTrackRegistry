import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { RoleProtectedRoute } from "@/lib/role-protected-route";
import { AnimatePresence } from "framer-motion";
import { AnimatedRoute } from "@/components/ui/animated-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
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
import VerifyCertificate from "./pages/verify-certificate";
import Blockchain from "./pages/blockchain";
import ApiDocs from "./pages/api-docs";
import Analytics from "./pages/Analytics";

function Router() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Switch key={location}>
        <AnimatedRoute path="/auth" component={AuthPage} />
        <AnimatedRoute path="/verify-certificate" component={VerifyCertificate} />
        <ProtectedRoute path="/" component={Dashboard} />
        <ProtectedRoute path="/projects" component={Projects} />
        <ProtectedRoute path="/projects/new" component={NewProject} />
        <ProtectedRoute path="/projects/:id" component={ProjectDetail} />
        <ProtectedRoute path="/carbon-credits" component={CarbonCredits} />
        <ProtectedRoute path="/verification" component={Verification} />
        <ProtectedRoute path="/map" component={MapView} />
        <ProtectedRoute path="/methodologies" component={Methodologies} />
        <ProtectedRoute path="/users" component={Users} />
        <ProtectedRoute path="/settings" component={Settings} />
        <ProtectedRoute path="/blockchain" component={Blockchain} />
        <ProtectedRoute path="/analytics" component={Analytics} />
        <RoleProtectedRoute 
          path="/api-docs" 
          component={ApiDocs} 
          allowedRoles={['admin', 'developer']} 
        />
        <AnimatedRoute path="/:rest*" component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

// Create a layout handler component to check auth status
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
