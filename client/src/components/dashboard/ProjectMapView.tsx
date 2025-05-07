import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectCategory } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectMapView() {
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ProjectCategory[]>({
    queryKey: ["/api/categories"],
  });

  const isLoading = isLoadingProjects || isLoadingCategories;

  if (isLoading) {
    return <ProjectMapLoading />;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Project Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <div className="text-center p-4">
            <span className="material-icons text-5xl text-gray-400 mb-2">map</span>
            <p className="text-gray-500">Interactive map will be displayed here</p>
            <p className="text-sm text-gray-400 mt-1">(Map visualization requires additional libraries)</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories?.map((category) => (
            <Badge 
              key={category.id} 
              variant="outline" 
              className="bg-opacity-20 flex items-center"
              style={{ 
                backgroundColor: `${category.color}20`, 
                color: category.color,
                borderColor: category.color
              }}
            >
              <span className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: category.color }}></span>
              {category.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectMapLoading() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-64 w-full rounded" />
        <div className="mt-3 flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-24 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
