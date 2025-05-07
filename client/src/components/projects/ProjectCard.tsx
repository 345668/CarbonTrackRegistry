import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { truncateText, getCategoryColor, getStatusColor, formatNumber } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  showFooter?: boolean;
}

export default function ProjectCard({ project, showFooter = true }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.projectId}`}>
      <a className="block">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
          <div className="relative h-40">
            {project.imageUrl ? (
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${project.imageUrl})` }}
              ></div>
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                <span className="material-icons text-4xl text-neutral-300">eco</span>
              </div>
            )}
            <div className="absolute top-0 right-0 mt-2 mr-2">
              <Badge className={getCategoryColor(project.category)}>
                {project.category}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4 flex-grow">
            <h3 className="text-md font-medium text-neutral-900 mb-1">{project.name}</h3>
            <p className="text-sm text-neutral-700 mb-3 line-clamp-2">
              {truncateText(project.description, 100)}
            </p>
            <div className="flex justify-between items-center">
              <div>
                <Badge variant="outline" className={getStatusColor(project.status)}>
                  <span className="flex-shrink-0 h-2 w-2 rounded-full bg-current mr-1.5"></span>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </div>
              <div className="text-sm font-medium text-neutral-900">{formatNumber(project.estimatedReduction)} tCO₂e</div>
            </div>
          </CardContent>
          {showFooter && (
            <CardFooter className="px-4 py-3 bg-neutral-50 border-t">
              <div className="flex justify-between items-center w-full">
                <div className="text-xs text-neutral-500">
                  <span className="material-icons text-neutral-400 text-xs mr-1 align-text-top">location_on</span>
                  {project.location}
                </div>
                <div className="text-xs text-neutral-500">ID: {project.projectId}</div>
              </div>
            </CardFooter>
          )}
        </Card>
      </a>
    </Link>
  );
}
