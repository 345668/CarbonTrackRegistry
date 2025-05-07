import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
    const matchesStatus = statusFilter === "all" || verification.status === statusFilter;
    const matchesStage = stageFilter === "all" || verification.currentStage === parseInt(stageFilter);
    
    return matchesStatus && matchesStage;
  });
  
  // Calculate counts
  const pendingCount = verifications?.filter(v => v.status === "pending").length || 0;
  const approvedCount = verifications?.filter(v => v.status === "approved").length || 0;
  const rejectedCount = verifications?.filter(v => v.status === "rejected").length || 0;

  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-8">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Project Verification
            </h1>
            <p className="mt-2 text-sm text-neutral-600 max-w-2xl">
              Track, review and manage the verification process for all registered carbon offset projects
            </p>
          </div>
          <div className="mt-6 sm:mt-0">
            <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-1.5 shadow-sm">
                  <span className="material-icons text-sm">add</span>
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
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <Card className="shadow-sm border border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-500/10 rounded-md p-3 mr-4">
                <span className="material-icons text-amber-600">pending_actions</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Pending Verifications</p>
                <p className="text-2xl font-semibold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-500/10 rounded-md p-3 mr-4">
                <span className="material-icons text-green-600">verified</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Approved Verifications</p>
                <p className="text-2xl font-semibold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-red-500/10 rounded-md p-3 mr-4">
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
      <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200 mb-6">
        <div className="flex items-center mb-3">
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-neutral-900">Filter Verifications</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Filter the verification list based on status and stage</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="text-sm font-medium text-neutral-700 mb-1.5 block">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="stage" className="text-sm font-medium text-neutral-700 mb-1.5 block">
              Verification Stage
            </label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger id="stage" className="w-full">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
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
    <Card className="border border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-64 mb-1" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-5 border-b bg-neutral-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-5 border-b hover:bg-neutral-50">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="p-4">
                  <Skeleton className={`h-4 w-${j === 1 ? 'full' : j === 3 ? '16' : '24'}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
