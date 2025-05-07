import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentProjects() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return <RecentProjectsLoading />;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-neutral-900">Recent Projects</h2>
          <Link href="/projects/new">
            <div>
              <Button variant="default" size="sm">Create a new project</Button>
            </div>
          </Link>
        </div>
        <div className="bg-white rounded-lg p-8 text-center">
          <span className="material-icons text-5xl text-neutral-300 mb-2">eco</span>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects yet</h3>
          <p className="text-neutral-500 mb-4">Start by creating your first carbon project</p>
          <Link href="/projects/new">
            <div>
              <Button>Create Project</Button>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Show only the 3 most recent projects
  const recentProjects = [...projects]
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-900">Recent Projects</h2>
        <Link href="/projects">
          <div className="text-sm font-medium text-primary hover:text-primary-dark cursor-pointer">View all projects</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recentProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

function RecentProjectsLoading() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
