import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project, VerificationStage } from "@/types";

interface RequestVerificationFormProps {
  projects: Project[];
  stages: VerificationStage[];
  preselectedProject?: string;
  onComplete: () => void;
}

export default function RequestVerificationForm({ 
  projects, 
  stages,
  preselectedProject,
  onComplete 
}: RequestVerificationFormProps) {
  const [formData, setFormData] = useState({
    projectId: preselectedProject || "",
    verifier: "",
    notes: "",
    estimatedCompletionDate: "",
  });
  
  const { toast } = useToast();
  
  const requestVerificationMutation = useMutation({
    mutationFn: async (data: typeof formData & { currentStage: number }) => {
      return await apiRequest("POST", "/api/verifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/verifications/${formData.projectId}`] });
      toast({
        title: "Verification requested",
        description: "Your verification request has been submitted successfully.",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to request verification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.projectId) {
      toast({
        title: "Validation Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }
    
    // Get the first stage
    const initialStage = stages.length > 0 ? stages.sort((a, b) => a.order - b.order)[0] : null;
    
    if (!initialStage) {
      toast({
        title: "Configuration Error",
        description: "No verification stages configured in the system",
        variant: "destructive",
      });
      return;
    }
    
    // Submit the verification request
    requestVerificationMutation.mutate({
      ...formData,
      currentStage: initialStage.id,
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
          onValueChange={(value) => setFormData({ ...formData, projectId: value })}
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
      
      <div className="space-y-2">
        <label htmlFor="verifier" className="text-sm font-medium">
          Verifier (Optional)
        </label>
        <Input
          id="verifier"
          placeholder="Name of the verification entity"
          value={formData.verifier}
          onChange={(e) => setFormData({ ...formData, verifier: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="estimatedCompletionDate" className="text-sm font-medium">
          Estimated Completion Date (Optional)
        </label>
        <Input
          id="estimatedCompletionDate"
          type="date"
          value={formData.estimatedCompletionDate}
          onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (Optional)
        </label>
        <Textarea
          id="notes"
          placeholder="Additional information for the verification process"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>
      
      <div className="pt-4 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={requestVerificationMutation.isPending}>
          {requestVerificationMutation.isPending && (
            <span className="material-icons mr-2 animate-spin text-sm">refresh</span>
          )}
          Submit Request
        </Button>
      </div>
    </form>
  );
}