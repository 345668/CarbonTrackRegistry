import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProjectLocations from "@/components/dashboard/ProjectLocations";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RecentProjects from "@/components/dashboard/RecentProjects";
import VerificationPipeline from "@/components/dashboard/VerificationPipeline";

export default function Dashboard() {
  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Carbon Registry Dashboard</h1>
            <p className="mt-1 text-sm text-neutral-700">Overview of all carbon projects and credits</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/projects/new">
              <Button className="inline-flex items-center">
                <span className="material-icons text-sm mr-2">add</span>
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
