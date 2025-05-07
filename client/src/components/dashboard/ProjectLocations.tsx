import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MapComponent from "@/components/map/MapComponent";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types";
import { Link } from "wouter";
import { Info } from "lucide-react";

export default function ProjectLocations() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <Card className="col-span-1 md:col-span-6 lg:col-span-8 xl:col-span-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-primary mb-1">Project Locations</CardTitle>
            <CardDescription>Geographic distribution of registered carbon offset projects</CardDescription>
          </div>
          <Link to="/map" className="text-primary flex items-center text-sm hover:underline">
            <Info className="w-4 h-4 mr-1" />
            View Full Map
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[400px] w-full rounded-md" />
        ) : (
          <MapComponent 
            projects={projects || []} 
            height="400px" 
            showPopup={true}
            interactive={true}
          />
        )}
      </CardContent>
    </Card>
  );
}