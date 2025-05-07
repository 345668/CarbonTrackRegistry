import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectCard from "@/components/projects/ProjectCard";
import { Project, ProjectCategory } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<ProjectCategory[]>({
    queryKey: ["/api/categories"],
  });
  
  const isLoading = isLoadingProjects || isLoadingCategories;
  
  // Filter projects based on search term and filters
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = 
      search === "" || 
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase()) ||
      project.projectId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2">
              <span className="material-icons text-sm">arrow_back</span>
              Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Carbon Projects
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Register, manage and monitor carbon offset projects across different categories and regions
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/projects/new">
              <Button className="inline-flex items-center gap-1.5 shadow-sm">
                <span className="material-icons text-sm">add</span>
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-5 rounded-lg shadow mb-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center">
          <span className="material-icons text-primary text-sm mr-1.5">filter_list</span>
          Filter Projects
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1.5 block">
              Search
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-neutral-400 text-sm">search</span>
              </span>
              <Input
                id="search"
                type="text"
                placeholder="Project name, ID or description..."
                className="pl-10 border-gray-200 focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1.5 block">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status" className="border-gray-200 focus:border-primary">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value="registered">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Registered
                  </div>
                </SelectItem>
                <SelectItem value="verified">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Verified
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    Rejected
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="category" className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-1.5 block">
              Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category" className="border-gray-200 focus:border-primary">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }}></span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Projects list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : filteredProjects?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <span className="material-icons text-3xl text-primary">eco</span>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Carbon Projects Found</h3>
          <p className="text-neutral-600 max-w-md mx-auto mb-6">
            {search || statusFilter !== "" || categoryFilter !== "" ? 
              "No projects match your current filters. Try adjusting your search criteria or clearing filters." :
              "Get started by adding your first carbon offset project to begin monitoring and managing your climate impact."
            }
          </p>
          <div className="flex justify-center space-x-3">
            {(search || statusFilter !== "" || categoryFilter !== "") && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setCategoryFilter("");
                }}
                className="gap-1.5"
              >
                <span className="material-icons text-sm">filter_alt_off</span>
                Clear Filters
              </Button>
            )}
            <Link href="/projects/new">
              <Button className="shadow-sm gap-1.5">
                <span className="material-icons text-sm">add</span>
                Create New Project
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
