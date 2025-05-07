import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Project, ProjectVerification, CarbonCredit, VerificationStage, ActivityLog } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber, getStatusColor, getCategoryColor, getActivityIcon, formatTimeAgo } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import IssueCreditForm from "@/components/carbon-credits/IssueCreditForm";
import RequestVerificationForm from "@/components/verification/RequestVerificationForm";
import VerificationSteps from "@/components/verification/VerificationSteps";

export default function ProjectDetail() {
  const [match, params] = useRoute("/projects/:id");
  const projectId = params?.id || "";
  const [activeTab, setActiveTab] = useState("overview");
  const [showIssueCreditsDialog, setShowIssueCreditsDialog] = useState(false);
  const [showRequestVerificationDialog, setShowRequestVerificationDialog] = useState(false);
  
  const { toast } = useToast();
  
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  const { data: credits, isLoading: isLoadingCredits } = useQuery<CarbonCredit[]>({
    queryKey: ["/api/credits", { projectId }],
    enabled: !!projectId,
  });
  
  const { data: verification, isLoading: isLoadingVerification } = useQuery<ProjectVerification>({
    queryKey: [`/api/verifications/${projectId}`],
    enabled: !!projectId,
  });
  
  const { data: stages, isLoading: isLoadingStages } = useQuery<VerificationStage[]>({
    queryKey: ["/api/verification-stages"],
  });
  
  const { data: activityLogs, isLoading: isLoadingLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity"],
  });
  
  // Filter activity logs related to this project
  const projectLogs = activityLogs?.filter(log => 
    log.entityId === projectId || 
    (log.entityType === "credit" && credits?.some(c => c.serialNumber === log.entityId))
  );
  
  const updateVerification = useMutation({
    mutationFn: async (data: { id: number, stageId: number }) => {
      return await apiRequest("PUT", `/api/verifications/${data.id}`, {
        currentStage: data.stageId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/verifications/${projectId}`] });
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
  
  const handleUpdateVerificationStage = (stageId: number) => {
    if (verification) {
      updateVerification.mutate({ id: verification.id, stageId });
    }
  };
  
  const isLoading = isLoadingProject || isLoadingCredits || isLoadingVerification || isLoadingStages || isLoadingLogs;
  
  if (!match) {
    return <div>Project not found</div>;
  }
  
  if (isLoading && !project) {
    return <ProjectDetailSkeleton />;
  }
  
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="material-icons text-5xl text-neutral-300 mb-4">eco</span>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Project Not Found</h2>
        <p className="text-neutral-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Link href="/projects">
          <Button>View All Projects</Button>
        </Link>
      </div>
    );
  }
  
  const totalCredits = credits?.reduce((sum, credit) => sum + credit.quantity, 0) || 0;
  const availableCredits = credits?.filter(c => c.status === "available").reduce((sum, credit) => sum + credit.quantity, 0) || 0;
  const retiredCredits = credits?.filter(c => c.status === "retired").reduce((sum, credit) => sum + credit.quantity, 0) || 0;
  
  // Determine what actions are available based on project status
  const canRequestVerification = 
    project.status === "registered" && 
    (!verification || verification.status === "rejected");
    
  const canIssueCredits = project.status === "verified";

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center">
          <Link href="/projects">
            <a className="text-primary hover:text-primary-dark mr-2">
              <span className="material-icons text-sm align-text-top">arrow_back</span>
              <span className="ml-1">Back to Projects</span>
            </a>
          </Link>
        </div>
      </div>
      
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="relative h-48 bg-neutral-100">
          {project.imageUrl ? (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${project.imageUrl})` }}
            ></div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-icons text-5xl text-neutral-300">eco</span>
            </div>
          )}
          <div className="absolute bottom-4 right-4">
            <Badge className={getStatusColor(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <Badge className={`${getCategoryColor(project.category)} mb-2`}>
                {project.category}
              </Badge>
              <h1 className="text-2xl font-semibold text-neutral-900">{project.name}</h1>
              <p className="text-sm text-neutral-700 mt-1">ID: {project.projectId}</p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              {canRequestVerification && (
                <Dialog open={showRequestVerificationDialog} onOpenChange={setShowRequestVerificationDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <span className="material-icons text-sm mr-2">verified</span>
                      Request Verification
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Project Verification</DialogTitle>
                      <DialogDescription>
                        Submit this project for verification to validate its carbon reduction claims
                      </DialogDescription>
                    </DialogHeader>
                    <RequestVerificationForm 
                      projects={[project]} 
                      stages={stages || []}
                      preselectedProject={project.projectId}
                      onComplete={() => setShowRequestVerificationDialog(false)} 
                    />
                  </DialogContent>
                </Dialog>
              )}
              
              {canIssueCredits && (
                <Dialog open={showIssueCreditsDialog} onOpenChange={setShowIssueCreditsDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <span className="material-icons text-sm mr-2">add_circle</span>
                      Issue Credits
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue Carbon Credits</DialogTitle>
                      <DialogDescription>
                        Issue carbon credits for this verified project
                      </DialogDescription>
                    </DialogHeader>
                    <IssueCreditForm 
                      projects={[project]} 
                      preselectedProject={project.projectId}
                      onComplete={() => setShowIssueCreditsDialog(false)} 
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="credits">Carbon Credits</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700">Description</h3>
                  <p className="mt-1 text-sm text-neutral-900">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Start Date</h3>
                    <p className="mt-1 text-sm text-neutral-900">{project.startDate}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">End Date</h3>
                    <p className="mt-1 text-sm text-neutral-900">{project.endDate}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Location</h3>
                    <p className="mt-1 text-sm text-neutral-900">{project.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Methodology</h3>
                    <p className="mt-1 text-sm text-neutral-900">{project.methodology}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Developer</h3>
                    <p className="mt-1 text-sm text-neutral-900">{project.developer}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Estimated Reduction</h3>
                    <p className="mt-1 text-sm text-neutral-900">{formatNumber(project.estimatedReduction)} tCO₂e</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Credit Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-700">Total Credits</h3>
                  <p className="mt-1 text-xl font-semibold text-neutral-900">{formatNumber(totalCredits)} tCO₂e</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700">Available Credits</h3>
                  <p className="mt-1 text-xl font-semibold text-green-600">{formatNumber(availableCredits)} tCO₂e</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-700">Retired Credits</h3>
                  <p className="mt-1 text-xl font-semibold text-neutral-600">{formatNumber(retiredCredits)} tCO₂e</p>
                </div>
                
                <div className="pt-2">
                  <div className="w-full bg-neutral-100 rounded-full h-4">
                    <div 
                      className="h-4 rounded-full bg-green-500"
                      style={{ width: `${totalCredits ? (availableCredits / totalCredits) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500 text-center">
                    {totalCredits 
                      ? `${Math.round((availableCredits / totalCredits) * 100)}% of credits still available`
                      : "No credits issued yet"}
                  </p>
                </div>
              </CardContent>
              {canIssueCredits && (
                <CardFooter className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowIssueCreditsDialog(true)}
                  >
                    <span className="material-icons text-sm mr-2">add_circle</span>
                    Issue Credits
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>
        
        {/* Verification Tab */}
        <TabsContent value="verification">
          {verification ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VerificationSteps 
                  verification={verification} 
                  onUpdate={handleUpdateVerificationStage}
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Verification Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Status</h3>
                    <Badge 
                      className={`mt-1 ${
                        verification.status === "approved" ? "bg-green-100 text-green-800" :
                        verification.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700">Submitted Date</h3>
                    <p className="mt-1 text-sm text-neutral-900">
                      {formatDate(verification.submittedDate, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  {verification.estimatedCompletionDate && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700">Estimated Completion</h3>
                      <p className="mt-1 text-sm text-neutral-900">
                        {formatDate(verification.estimatedCompletionDate, 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {verification.verifier && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700">Verifier</h3>
                      <p className="mt-1 text-sm text-neutral-900">{verification.verifier}</p>
                    </div>
                  )}
                  {verification.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700">Notes</h3>
                      <p className="mt-1 text-sm text-neutral-900">{verification.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <span className="material-icons text-5xl text-neutral-300 mb-2">verified</span>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Verification Requested</h3>
              <p className="text-neutral-500 mb-4">This project hasn't been submitted for verification yet</p>
              {canRequestVerification && (
                <Button onClick={() => setShowRequestVerificationDialog(true)}>
                  Request Verification
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Carbon Credits Tab */}
        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Carbon Credits</CardTitle>
                {canIssueCredits && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-2 sm:mt-0"
                    onClick={() => setShowIssueCreditsDialog(true)}
                  >
                    <span className="material-icons text-sm mr-2">add_circle</span>
                    Issue Credits
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {credits && credits.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Serial Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Vintage
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Quantity (tCO₂e)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Issuance Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {credits.map((credit) => (
                        <tr key={credit.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {credit.serialNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                            {credit.vintage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                            {formatNumber(credit.quantity)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(credit.status)}>
                              {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                            {formatDate(credit.issuanceDate, 'MMM d, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons text-5xl text-neutral-300 mb-2">account_balance_wallet</span>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No Carbon Credits</h3>
                  <p className="text-neutral-500 mb-4">No carbon credits have been issued for this project yet</p>
                  {canIssueCredits && (
                    <Button onClick={() => setShowIssueCreditsDialog(true)}>
                      Issue First Credits
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Project Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              {projectLogs && projectLogs.length > 0 ? (
                <div className="space-y-4">
                  {projectLogs.map((log) => {
                    const { icon, color } = getActivityIcon(log.action);
                    return (
                      <div key={log.id} className="flex">
                        <div className="flex-shrink-0 mr-3">
                          <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center`}>
                            <span className="material-icons text-sm">{icon}</span>
                          </div>
                        </div>
                        <div className="flex-grow pb-4 border-b border-neutral-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-sm text-neutral-700 mt-1">{log.description}</p>
                            </div>
                            <p className="text-xs text-neutral-500">{formatTimeAgo(log.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="material-icons text-5xl text-neutral-300 mb-2">history</span>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No Activity Found</h3>
                  <p className="text-neutral-500">There is no recorded activity for this project yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-6 w-40" />
      </div>
      
      {/* Project Header Skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <Skeleton className="h-48 w-full" />
        <div className="p-6">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-8 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
