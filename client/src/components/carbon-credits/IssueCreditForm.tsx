import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types";

interface IssueCreditFormProps {
  projects: Project[];
  preselectedProject?: string;
  onComplete: () => void;
}

export default function IssueCreditForm({ 
  projects, 
  preselectedProject,
  onComplete 
}: IssueCreditFormProps) {
  const currentYear = new Date().getFullYear().toString();
  const [formData, setFormData] = useState({
    projectId: preselectedProject || "",
    vintage: currentYear,
    quantity: "",
    serialNumber: "",
  });
  
  const { toast } = useToast();
  
  const issueCreditMutation = useMutation({
    mutationFn: async (data: typeof formData & { owner: string }) => {
      return await apiRequest("POST", "/api/credits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Credits issued",
        description: "The carbon credits have been successfully issued.",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to issue credits: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const generateSerialNumber = (projectId: string, vintage: string) => {
    if (!projectId || !vintage) return "";
    
    const endYear = (parseInt(vintage) + 1).toString();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `CR-${projectId}-${vintage}-${endYear}-${randomPart}`;
  };
  
  const handleProjectChange = (value: string) => {
    setFormData({
      ...formData,
      projectId: value,
      serialNumber: generateSerialNumber(value, formData.vintage)
    });
  };
  
  const handleVintageChange = (value: string) => {
    setFormData({
      ...formData,
      vintage: value,
      serialNumber: generateSerialNumber(formData.projectId, value)
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.projectId || !formData.vintage || !formData.quantity || !formData.serialNumber) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    // Check quantity is a positive number
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be a positive number",
        variant: "destructive",
      });
      return;
    }
    
    // Issue the credits
    issueCreditMutation.mutate({
      ...formData,
      quantity: parseInt(formData.quantity),
      owner: "admin", // Default owner
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <label htmlFor="project" className="text-sm font-medium">
          Project
        </label>
        <Select
          value={formData.projectId}
          onValueChange={handleProjectChange}
          disabled={!!preselectedProject}
        >
          <SelectTrigger id="project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.projectId}>
                {project.name} ({project.projectId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="vintage" className="text-sm font-medium">
            Vintage Year
          </label>
          <Select
            value={formData.vintage}
            onValueChange={handleVintageChange}
          >
            <SelectTrigger id="vintage">
              <SelectValue placeholder="Select vintage year" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(5)].map((_, i) => {
                const year = (parseInt(currentYear) - 2 + i).toString();
                return (
                  <SelectItem key={i} value={year}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">
            Quantity (tCO₂e)
          </label>
          <Input
            id="quantity"
            type="number"
            placeholder="0"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="serialNumber" className="text-sm font-medium">
          Serial Number
        </label>
        <Input
          id="serialNumber"
          value={formData.serialNumber}
          onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          placeholder="CR-XXX-YYYY-YYYY-XXX"
        />
        <p className="text-xs text-neutral-500">
          Auto-generated based on project ID and vintage.
        </p>
      </div>
      
      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={issueCreditMutation.isPending}>
          {issueCreditMutation.isPending && (
            <span className="material-icons mr-2 animate-spin text-sm">refresh</span>
          )}
          Issue Credits
        </Button>
      </div>
    </form>
  );
}
