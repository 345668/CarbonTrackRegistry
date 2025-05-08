import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { 
  FileCheck, 
  Building2, 
  CalendarDays, 
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Filter,
  MessageCircle,
  AlertCircle
} from "lucide-react";

interface VerificationListProps {
  verifications: ProjectVerification[];
  stages: VerificationStage[];
}

export default function VerificationList({ verifications, stages }: VerificationListProps) {
  const { toast } = useToast();
  
  // All state declarations at the top
  const [selectedVerification, setSelectedVerification] = useState<ProjectVerification | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [thirdPartyInfo, setThirdPartyInfo] = useState({
    name: "",
    email: "",
    standard: "",
    showDialog: false,
    selectedVerificationId: 0
  });
  
  // Mutations
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
  
  const assignThirdPartyVerifier = useMutation({
    mutationFn: async (data: { id: number, verifier: string, email: string, standard: string }) => {
      return await apiRequest("PUT", `/api/verifications/${data.id}`, {
        thirdPartyVerifier: data.verifier,
        contactEmail: data.email,
        verificationStandard: data.standard
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
      toast({
        title: "Third-party verifier assigned",
        description: "The verification has been assigned to a third-party verifier.",
      });
      setThirdPartyInfo({
        ...thirdPartyInfo,
        showDialog: false,
        name: "",
        email: "",
        standard: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to assign third-party verifier: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Event handlers
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
  
  const handleAssignThirdParty = (id: number) => {
    setThirdPartyInfo({
      ...thirdPartyInfo,
      showDialog: true,
      selectedVerificationId: id
    });
  };
  
  const handleThirdPartySubmit = () => {
    if (!thirdPartyInfo.name) {
      toast({
        title: "Error",
        description: "Please enter a verifier name",
        variant: "destructive",
      });
      return;
    }
    
    assignThirdPartyVerifier.mutate({
      id: thirdPartyInfo.selectedVerificationId,
      verifier: thirdPartyInfo.name,
      email: thirdPartyInfo.email,
      standard: thirdPartyInfo.standard
    });
  };

  // Early return for empty state
  if (verifications.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <FileCheck className="h-16 w-16 text-neutral-300 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No Verifications Found</h3>
        <p className="text-neutral-500 mb-4">There are no verifications matching your criteria</p>
      </div>
    );
  }

  // Main component render
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            Manage project verification processes and third-party verifiers
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8 bg-white"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
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
                  Third-Party Verifier
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {verification.thirdPartyVerifier ? (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1.5 text-blue-600" />
                          <span className="text-blue-700">{verification.thirdPartyVerifier}</span>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 -ml-2"
                          onClick={() => handleAssignThirdParty(verification.id)}
                        >
                          <Building2 className="h-4 w-4 mr-1.5" />
                          Assign Verifier
                        </Button>
                      )}
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
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(verification)}
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        {verification.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedVerification(verification);
                                rejectVerification.mutate(verification.id);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 text-green-700 hover:bg-green-50"
                              onClick={() => {
                                setSelectedVerification(verification);
                                approveVerification.mutate(verification.id);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      {/* Third-Party Verifier Assignment Dialog */}
      <Dialog open={thirdPartyInfo.showDialog} onOpenChange={(open) => setThirdPartyInfo({...thirdPartyInfo, showDialog: open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Third-Party Verifier</DialogTitle>
            <DialogDescription>
              Assign an independent third-party verifier to ensure transparency and compliance with standards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="verifier-name">Verifier Organization Name</Label>
              <Input
                id="verifier-name"
                value={thirdPartyInfo.name}
                onChange={(e) => setThirdPartyInfo({...thirdPartyInfo, name: e.target.value})}
                placeholder="e.g., Climate Verification Services GmbH"
              />
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="verifier-email">Contact Email</Label>
              <Input
                id="verifier-email"
                value={thirdPartyInfo.email}
                onChange={(e) => setThirdPartyInfo({...thirdPartyInfo, email: e.target.value})}
                placeholder="contact@verifier.com"
              />
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="verification-standard">Verification Standard</Label>
              <select
                id="verification-standard"
                value={thirdPartyInfo.standard}
                onChange={(e) => setThirdPartyInfo({...thirdPartyInfo, standard: e.target.value})}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a standard...</option>
                <option value="Gold Standard">Gold Standard</option>
                <option value="Verified Carbon Standard (VCS)">Verified Carbon Standard (VCS)</option>
                <option value="CDM">Clean Development Mechanism (CDM)</option>
                <option value="ISO 14064">ISO 14064</option>
                <option value="American Carbon Registry (ACR)">American Carbon Registry (ACR)</option>
                <option value="Climate Action Reserve (CAR)">Climate Action Reserve (CAR)</option>
                <option value="Green-e Climate Standard">Green-e Climate Standard</option>
                <option value="Plan Vivo">Plan Vivo</option>
                <option value="UK Woodland Carbon Code">UK Woodland Carbon Code</option>
                <option value="Carbon Offsetting and Reduction Scheme for International Aviation (CORSIA)">CORSIA</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setThirdPartyInfo({...thirdPartyInfo, showDialog: false})}
            >
              Cancel
            </Button>
            <Button
              onClick={handleThirdPartySubmit}
              disabled={assignThirdPartyVerifier.isPending}
            >
              {assignThirdPartyVerifier.isPending ? "Assigning..." : "Assign Verifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Verification Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>
              Project ID: {selectedVerification?.projectId}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedVerification && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1.5 text-neutral-500" />
                      Submitted Date
                    </h3>
                    <p className="mt-1 text-sm">
                      {formatDate(selectedVerification.submittedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 flex items-center">
                      <ClipboardCheck className="h-4 w-4 mr-1.5 text-neutral-500" />
                      Status
                    </h3>
                    <Badge className={
                      selectedVerification.status === "approved" ? "bg-green-100 text-green-800" :
                      selectedVerification.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }>
                      {selectedVerification.status.charAt(0).toUpperCase() + selectedVerification.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 flex items-center">
                      <CalendarDays className="h-4 w-4 mr-1.5 text-neutral-500" />
                      Estimated Completion
                    </h3>
                    <p className="mt-1 text-sm">
                      {selectedVerification.estimatedCompletionDate 
                        ? formatDate(selectedVerification.estimatedCompletionDate, "MMMM d, yyyy")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVerification.thirdPartyVerifier && (
                    <div className="col-span-1">
                      <h3 className="text-sm font-medium text-neutral-700 flex items-center">
                        <Building2 className="h-4 w-4 mr-1.5 text-neutral-500" />
                        Third-Party Verifier
                      </h3>
                      <div className="mt-1 flex items-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {selectedVerification.thirdPartyVerifier}
                        </Badge>
                        {selectedVerification.contactEmail && (
                          <span className="ml-2 text-xs text-neutral-500">
                            Contact: {selectedVerification.contactEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedVerification.verificationStandard && (
                    <div className="col-span-1">
                      <h3 className="text-sm font-medium text-neutral-700 flex items-center">
                        <FileCheck className="h-4 w-4 mr-1.5 text-neutral-500" />
                        Verification Standard
                      </h3>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {selectedVerification.verificationStandard}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                
                {selectedVerification.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1.5 text-neutral-500" />
                      Notes
                    </h3>
                    <p className="mt-1 text-sm bg-neutral-50 p-3 rounded-md">
                      {selectedVerification.notes}
                    </p>
                  </div>
                )}
                
                {!selectedVerification.thirdPartyVerifier && selectedVerification.status === "pending" && (
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">No Third-Party Verifier Assigned</h4>
                        <p className="text-xs text-amber-700 mt-1">
                          For transparent and credible verification, assign a third-party verifier to this project.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                          onClick={() => {
                            setShowDetailsDialog(false);
                            handleAssignThirdParty(selectedVerification.id);
                          }}
                        >
                          <Building2 className="h-4 w-4 mr-1.5" />
                          Assign Verifier
                        </Button>
                      </div>
                    </div>
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
                      {rejectVerification.isPending ? (
                        <span className="flex items-center">
                          <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Verification
                        </span>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleApprove}
                      disabled={approveVerification.isPending}
                    >
                      {approveVerification.isPending ? (
                        <span className="flex items-center">
                          <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve Verification
                        </span>
                      )}
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
