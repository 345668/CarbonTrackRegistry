import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectVerification, Project, VerificationStage } from "@/types";
import { getVerificationStageColor, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import VerificationList from "@/components/verification/VerificationList";
import RequestVerificationForm from "@/components/verification/RequestVerificationForm";

export default function Verification() {
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  const { data: verifications, isLoading: isLoadingVerifications } = useQuery<ProjectVerification[]>({
    queryKey: ["/api/verifications"],
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects", { status: "registered" }],
  });
  
  const { data: stages, isLoading: isLoadingStages } = useQuery<VerificationStage[]>({
    queryKey: ["/api/verification-stages"],
  });
  
  const isLoading = isLoadingVerifications || isLoadingProjects || isLoadingStages;
  
  // Filter verifications based on filters
  const filteredVerifications = verifications?.filter(verification => {
    const matchesStatus = statusFilter === "" || verification.status === statusFilter;
    const matchesStage = stageFilter === "" || verification.currentStage === parseInt(stageFilter);
    
    return matchesStatus && matchesStage;
  });
  
  // Calculate counts
  const pendingCount = verifications?.filter(v => v.status === "pending").length || 0;
  const approvedCount = verifications?.filter(v => v.status === "approved").length || 0;
  const rejectedCount = verifications?.filter(v => v.status === "rejected").length || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Verification</h1>
          <p className="mt-1 text-sm text-neutral-700">Manage the verification process for carbon projects</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center">
                <span className="material-icons text-sm mr-2">add</span>
                Request Verification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Request Project Verification</DialogTitle>
                <DialogDescription>
                  Submit a project for verification to validate its carbon reduction claims
                </DialogDescription>
              </DialogHeader>
              <RequestVerificationForm 
                projects={projects?.filter(p => p.status === "registered") || []} 
                stages={stages || []}
                onComplete={() => setShowRequestForm(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-md p-3 mr-4">
                <span className="material-icons text-yellow-600">pending_actions</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Verifications</p>
                <p className="text-2xl font-semibold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-md p-3 mr-4">
                <span className="material-icons text-green-600">verified</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Approved Verifications</p>
                <p className="text-2xl font-semibold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-md p-3 mr-4">
                <span className="material-icons text-red-600">cancel</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Rejected Verifications</p>
                <p className="text-2xl font-semibold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="text-sm font-medium text-neutral-700 mb-1 block">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="stage" className="text-sm font-medium text-neutral-700 mb-1 block">
              Stage
            </label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger id="stage">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All stages</SelectItem>
                {stages?.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id.toString()}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Verifications List */}
      {isLoading ? (
        <VerificationListLoading />
      ) : (
        <VerificationList 
          verifications={filteredVerifications || []} 
          stages={stages || []} 
        />
      )}
    </div>
  );
}

function VerificationListLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-5 border-b">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-5 border-b">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="p-4">
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
