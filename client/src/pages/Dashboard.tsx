import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProjectMapView from "@/components/dashboard/ProjectMapView";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentProjects from "@/components/dashboard/RecentProjects";
import VerificationPipeline from "@/components/dashboard/VerificationPipeline";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
      }
    });
  };

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Carbon Registry Dashboard
              </h1>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleSignOut}
                className="md:hidden text-sm"
                disabled={logoutMutation.isPending}
              >
                <span className="material-icons text-sm mr-1">logout</span>
                {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
            <p className="mt-2 text-sm text-neutral-600 max-w-2xl">
              Monitor your carbon offset projects, track verification progress, and manage credits in one central location
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleSignOut}
              className="hidden md:inline-flex items-center gap-1.5 shadow-sm"
              disabled={logoutMutation.isPending}
            >
              <span className="material-icons text-sm">logout</span>
              {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
            </Button>
            <Link href="/projects">
              <Button variant="outline" className="inline-flex items-center gap-1.5 shadow-sm">
                <span className="material-icons text-sm">view_list</span>
                View All Projects
              </Button>
            </Link>
            <Link href="/verify-certificate">
              <Button variant="outline" className="inline-flex items-center gap-1.5 shadow-sm">
                <span className="material-icons text-sm">verified</span>
                Verify Certificate
              </Button>
            </Link>
            <Link href="/blockchain">
              <Button variant="outline" className="inline-flex items-center gap-1.5 shadow-sm">
                <span className="material-icons text-sm">account_balance</span>
                Blockchain
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="inline-flex items-center gap-1.5 shadow-sm">
                <span className="material-icons text-sm">insights</span>
                Advanced Analytics
              </Button>
            </Link>
            <Link href="/api-docs">
              <Button variant="outline" className="inline-flex items-center gap-1.5 shadow-sm">
                <span className="material-icons text-sm">api</span>
                API Documentation
              </Button>
            </Link>
            <Link href="/projects/new">
              <Button className="inline-flex items-center gap-1.5 shadow-sm">
                <span className="material-icons text-sm">add</span>
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Project Map and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ProjectMapView />
        <RecentActivity />
      </div>

      {/* Recent Projects */}
      <RecentProjects />

      {/* Verification Status */}
      <VerificationPipeline />
    </div>
  );
}
