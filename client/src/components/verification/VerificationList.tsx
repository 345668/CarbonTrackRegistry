import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProjectVerification, VerificationStage } from "@/types";
import { formatDate, getVerificationStageColor } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import VerificationSteps from "./VerificationSteps";

interface VerificationListProps {
  verifications: ProjectVerification[];
  stages: VerificationStage[];
}

export default function VerificationList({ verifications, stages }: VerificationListProps) {
  const [selectedVerification, setSelectedVerification] = useState<ProjectVerification | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  
  const updateVerification = useMutation({
    mutationFn: async (data: { id: number, stageId: number }) => {
      return await apiRequest("PUT", `/api/verifications/${data.id}`, {
        currentStage: data.stageId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
      toast({
        title: "Verification updated",
        description: "The verification process has been advanced to the next stage.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update verification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const approveVerification = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PUT", `/api/verifications/${id}`, {
        status: "approved"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Verification approved",
        description: "The project has been successfully verified.",
      });
      setShowDetailsDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to approve verification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const rejectVerification = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PUT", `/api/verifications/${id}`, {
        status: "rejected"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
      toast({
        title: "Verification rejected",
        description: "The verification has been rejected.",
      });
      setShowDetailsDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reject verification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleUpdateVerificationStage = (stageId: number) => {
    if (selectedVerification) {
      updateVerification.mutate({ id: selectedVerification.id, stageId });
    }
  };
  
  const handleViewDetails = (verification: ProjectVerification) => {
    setSelectedVerification(verification);
    setShowDetailsDialog(true);
  };
  
  const handleApprove = () => {
    if (selectedVerification) {
      approveVerification.mutate(selectedVerification.id);
    }
  };
  
  const handleReject = () => {
    if (selectedVerification) {
      rejectVerification.mutate(selectedVerification.id);
    }
  };

  if (verifications.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <span className="material-icons text-5xl text-neutral-300 mb-2">verified</span>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No Verifications Found</h3>
        <p className="text-neutral-500 mb-4">There are no verifications matching your criteria</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Project ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Current Stage
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {verifications.map((verification) => {
                const stage = stages.find(s => s.id === verification.currentStage);
                return (
                  <tr key={verification.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {verification.projectId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {formatDate(verification.submittedDate, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getVerificationStageColor(stage?.name || "")}>
                        {stage?.name || "Unknown"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={
                        verification.status === "approved" ? "bg-green-100 text-green-800" :
                        verification.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }>
                        {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(verification)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      {/* Verification Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Project ID: {selectedVerification?.projectId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedVerification && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Submitted Date</h3>
                    <p className="mt-1 text-sm">
                      {formatDate(selectedVerification.submittedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Status</h3>
                    <Badge className={
                      selectedVerification.status === "approved" ? "bg-green-100 text-green-800" :
                      selectedVerification.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }>
                      {selectedVerification.status.charAt(0).toUpperCase() + selectedVerification.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Verifier</h3>
                    <p className="mt-1 text-sm">{selectedVerification.verifier || "Not assigned"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Estimated Completion</h3>
                    <p className="mt-1 text-sm">
                      {selectedVerification.estimatedCompletionDate 
                        ? formatDate(selectedVerification.estimatedCompletionDate, "MMMM d, yyyy")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                
                {selectedVerification.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Notes</h3>
                    <p className="mt-1 text-sm bg-neutral-50 p-3 rounded-md">
                      {selectedVerification.notes}
                    </p>
                  </div>
                )}
                
                <VerificationSteps 
                  verification={selectedVerification} 
                  onUpdate={handleUpdateVerificationStage}
                  readOnly={selectedVerification.status !== "pending"}
                />
                
                {selectedVerification.status === "pending" && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button 
                      variant="destructive" 
                      onClick={handleReject}
                      disabled={rejectVerification.isPending}
                    >
                      {rejectVerification.isPending && (
                        <span className="material-icons mr-2 animate-spin text-sm">refresh</span>
                      )}
                      Reject Verification
                    </Button>
                    
                    <Button 
                      onClick={handleApprove}
                      disabled={approveVerification.isPending}
                    >
                      {approveVerification.isPending && (
                        <span className="material-icons mr-2 animate-spin text-sm">refresh</span>
                      )}
                      Approve Verification
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
