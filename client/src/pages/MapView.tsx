import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Project, ProjectCategory } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor } from "@/lib/utils";
import MapComponent from "@/components/map/MapComponent";

export default function MapView() {
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ProjectCategory[]>({
    queryKey: ["/api/categories"],
  });

  const isLoading = isLoadingProjects || isLoadingCategories;

  // Count projects per category
  const projectsByCategory = categories?.map(category => {
    const count = projects?.filter(p => p.category === category.name).length || 0;
    return { ...category, count };
  });

  // Count projects per country
  const countries = projects?.reduce((acc, project) => {
    const country = project.location;
    if (!acc[country]) {
      acc[country] = 0;
    }
    acc[country]++;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Map View</h1>
        <p className="mt-1 text-sm text-neutral-700">Geographic distribution of carbon projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Map Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Project Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full rounded" />
            ) : (
              <div className="h-[400px] overflow-hidden rounded">
                <MapComponent 
                  projects={projects || []} 
                  height="100%" 
                  showPopup={true}
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-24 rounded-full" />
                ))
              ) : (
                projectsByCategory?.map((category) => (
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
                    {category.name} ({category.count})
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar with stats */}
        <Card>
          <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Project Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">By Category</h3>
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="mb-2">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-2 w-3/4" />
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {projectsByCategory?.map((category) => (
                    <div key={category.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm font-medium">{category.count}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(category.count / (projects?.length || 1)) * 100}%`,
                            backgroundColor: category.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-2">By Country</h3>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between py-2 border-b">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))
              ) : (
                <div>
                  {Object.entries(countries).map(([country, count], i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-neutral-100">
                      <span className="text-sm">{country}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects table section */}
      <Card>
        <CardHeader className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium leading-6 text-neutral-900">Project List</CardTitle>
            <div className="mt-2 sm:mt-0 relative max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-neutral-400 text-sm">search</span>
              </span>
              <Input
                type="text"
                placeholder="Search projects..."
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Project ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects?.map((project) => (
                    <tr key={project.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {project.projectId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {project.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryColor(project.category)}>
                          {project.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
