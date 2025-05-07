import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";
import { truncateText, getCategoryColor, getStatusColor, formatNumber } from "@/lib/utils";
import { Leaf, MapPin } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  showFooter?: boolean;
}

export default function ProjectCard({ project, showFooter = true }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Function to handle image load errors
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <Link href={`/projects/${project.projectId}`}>
      <div className="block cursor-pointer">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col border-neutral-200/80">
          <div className="relative h-40">
            {project.imageUrl && !imageError ? (
              <>
                {/* Use real img element for better error handling */}
                <img 
                  src={project.imageUrl}
                  alt={project.name} 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                {/* Fallback div using background-image (display:none when error) */}
                <div 
                  className={`absolute inset-0 bg-cover bg-center ${imageError ? 'hidden' : ''}`}
                  style={{ backgroundImage: `url(${project.imageUrl})` }}
                ></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
                <Leaf className="h-12 w-12 text-neutral-300" />
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
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
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
            <CardFooter className="px-4 py-3 bg-neutral-50 border-t border-neutral-100">
              <div className="flex justify-between items-center w-full">
                <div className="text-xs text-neutral-500 flex items-center">
                  <MapPin className="h-3 w-3 text-neutral-400 mr-1" />
                  {project.location}
                </div>
                <div className="text-xs text-neutral-500">ID: {project.projectId}</div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </Link>
  );
}
