import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Methodology, ProjectCategory } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getCategoryColor } from "@/lib/utils";
import MethodologyCard from "@/components/methodologies/MethodologyCard";

export default function Methodologies() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMethodology, setNewMethodology] = useState({
    name: "",
    description: "",
    category: "",
    documentUrl: "",
  });
  
  const { toast } = useToast();
  
  const { data: methodologies, isLoading: isLoadingMethodologies } = useQuery<Methodology[]>({
    queryKey: ["/api/methodologies"],
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ProjectCategory[]>({
    queryKey: ["/api/categories"],
  });
  
  const isLoading = isLoadingMethodologies || isLoadingCategories;
  
  const addMethodology = useMutation({
    mutationFn: async (data: typeof newMethodology) => {
      return await apiRequest("POST", "/api/methodologies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/methodologies"] });
      toast({
        title: "Methodology added",
        description: "The methodology has been added successfully.",
      });
      setNewMethodology({
        name: "",
        description: "",
        category: "",
        documentUrl: "",
      });
      setShowAddDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add methodology: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Filter methodologies based on search term and category filter
  const filteredMethodologies = methodologies?.filter(methodology => {
    const matchesSearch = 
      search === "" || 
      methodology.name.toLowerCase().includes(search.toLowerCase()) ||
      (methodology.description && methodology.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || methodology.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleAddMethodology = () => {
    if (!newMethodology.name || !newMethodology.category) {
      toast({
        title: "Validation Error",
        description: "Name and category are required fields.",
        variant: "destructive",
      });
      return;
    }
    
    addMethodology.mutate(newMethodology);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Carbon Methodologies</h1>
          <p className="mt-1 text-sm text-neutral-700">Reference standards for carbon project development and verification</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center">
                <span className="material-icons text-sm mr-2">add</span>
                Add Methodology
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Methodology</DialogTitle>
                <DialogDescription>
                  Add a new carbon accounting methodology to the registry
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Methodology Name
                  </label>
                  <Input
                    id="name"
                    value={newMethodology.name}
                    onChange={(e) => setNewMethodology({ ...newMethodology, name: e.target.value })}
                    placeholder="e.g., Agroforestry Carbon Sequestration"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={newMethodology.category}
                    onValueChange={(value) => setNewMethodology({ ...newMethodology, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={newMethodology.description}
                    onChange={(e) => setNewMethodology({ ...newMethodology, description: e.target.value })}
                    placeholder="Description of the methodology approach, applicability, and benefits"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="documentUrl" className="text-sm font-medium">
                    Document URL
                  </label>
                  <Input
                    id="documentUrl"
                    value={newMethodology.documentUrl}
                    onChange={(e) => setNewMethodology({ ...newMethodology, documentUrl: e.target.value })}
                    placeholder="https://example.com/methodology-document.pdf"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMethodology} disabled={addMethodology.isPending}>
                  {addMethodology.isPending && (
                    <span className="material-icons mr-2 animate-spin text-sm">refresh</span>
                  )}
                  Add Methodology
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="search" className="text-sm font-medium text-neutral-700 mb-1 block">
              Search
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-neutral-400 text-sm">search</span>
              </span>
              <Input
                id="search"
                type="text"
                placeholder="Search methodologies..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="text-sm font-medium text-neutral-700 mb-1 block">
              Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Methodologies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMethodologies && filteredMethodologies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethodologies.map((methodology) => (
            <MethodologyCard key={methodology.id} methodology={methodology} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center">
          <span className="material-icons text-5xl text-neutral-300 mb-2">book</span>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No methodologies found</h3>
          <p className="text-neutral-500 mb-4">Try adjusting your search or filters, or add a new methodology</p>
          <Button onClick={() => setShowAddDialog(true)}>Add Methodology</Button>
        </div>
      )}
    </div>
  );
}
