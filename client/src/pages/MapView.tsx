import { useQuery } from "@tanstack/react-query";
import { Project, ProjectCategory } from "@/types";
import MapComponent from "@/components/map/MapComponent";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Layers } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function MapView() {
  const [showLegend, setShowLegend] = useState(true);

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ProjectCategory[]>({
    queryKey: ["/api/categories"],
  });

  const isLoading = isLoadingProjects || isLoadingCategories;

  // Calculate the height for the map (full viewport height minus header)
  const mapHeight = "calc(100vh - 80px)";

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Carbon Project Locations</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => setShowLegend(!showLegend)}
          >
            <Layers className="h-4 w-4" />
            {showLegend ? "Hide Legend" : "Show Legend"}
          </Button>
        </div>
      </header>

      {/* Map Container */}
      <div className="relative flex-1">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <MapComponent 
            projects={projects || []} 
            height={mapHeight} 
            showPopup={true}
            interactive={true}
          />
        )}

        {/* Floating Legend */}
        {showLegend && !isLoading && categories && categories.length > 0 && (
          <Card className="absolute top-4 right-4 p-3 z-10 bg-white/95 shadow-lg backdrop-blur-sm border w-64">
            <div className="text-sm font-medium mb-2">Project Categories</div>
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <Badge 
                  key={category.id} 
                  variant="outline" 
                  className="bg-opacity-20 flex items-center justify-start"
                  style={{ 
                    backgroundColor: `${category.color}20`, 
                    color: category.color,
                    borderColor: category.color
                  }}
                >
                  <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></span>
                  {category.name}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}