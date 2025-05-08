import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VerificationStage, ProjectVerification, VerificationDocument, VerificationComment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { getVerificationStageColor } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileCheck, 
  FileText, 
  MessageCircle, 
  Upload, 
  CornerRightDown, 
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Building2,
  ArrowRight
} from "lucide-react";

interface VerificationStepsProps {
  verification: ProjectVerification;
  onUpdate?: (stageId: number) => void;
  readOnly?: boolean;
}

export default function VerificationSteps({ 
  verification, 
  onUpdate,
  readOnly = false
}: VerificationStepsProps) {
  const { data: stages, isLoading: isLoadingStages } = useQuery<VerificationStage[]>({
    queryKey: ["/api/verification-stages"],
  });
  
  const { data: documents, isLoading: isLoadingDocuments } = useQuery<VerificationDocument[]>({
    queryKey: ["/api/verification-documents", { verificationId: verification.id }],
    enabled: !!verification.id,
  });
  
  const { data: comments, isLoading: isLoadingComments } = useQuery<VerificationComment[]>({
    queryKey: ["/api/verification-comments", { verificationId: verification.id }],
    enabled: !!verification.id,
  });
  
  const isLoading = isLoadingStages || isLoadingDocuments || isLoadingComments;
  const { toast } = useToast();
  
  const [documentUpload, setDocumentUpload] = useState({
    name: "",
    url: "",
    type: "report",
    stageId: 0,
    notes: ""
  });
  
  const [comment, setComment] = useState({
    text: "",
    stageId: 0,
    isInternal: false
  });

  const uploadDocument = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/verification-documents", {
        verificationId: verification.id,
        stageId: data.stageId,
        documentType: data.type,
        documentName: data.name,
        documentUrl: data.url,
        uploadedBy: 1, // Assuming admin user
        status: "pending",
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification-documents", { verificationId: verification.id }] });
      toast({
        title: "Document uploaded",
        description: "The document has been uploaded successfully.",
      });
      setDocumentUpload({
        name: "",
        url: "",
        type: "report",
        stageId: 0,
        notes: ""
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload document: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addComment = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/verification-comments", {
        verificationId: verification.id,
        stageId: data.stageId,
        comment: data.text,
        commentedBy: 1, // Assuming admin user
        isInternal: data.isInternal
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification-comments", { verificationId: verification.id }] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
      setComment({
        text: "",
        stageId: 0,
        isInternal: false
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const completeStage = useMutation({
    mutationFn: async (stageId: number) => {
      return await apiRequest("POST", `/api/verifications/${verification.id}/complete-stage/${stageId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
      toast({
        title: "Stage completed",
        description: "The verification stage has been marked as completed.",
      });
      if (onUpdate) {
        onUpdate(0); // refresh parent component
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to complete stage: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDocumentUpload = (stageId: number) => {
    if (!documentUpload.name || !documentUpload.url) {
      toast({
        title: "Error",
        description: "Please provide both document name and URL",
        variant: "destructive",
      });
      return;
    }
    
    uploadDocument.mutate({
      ...documentUpload,
      stageId
    });
  };

  const handleAddComment = (stageId: number) => {
    if (!comment.text) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }
    
    addComment.mutate({
      ...comment,
      stageId
    });
  };

  if (isLoading) {
    return <VerificationStepsLoading />;
  }

  if (!stages || stages.length === 0) {
    return <div>No verification stages defined</div>;
  }
  
  // Sort stages by order
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  const currentStageIndex = sortedStages.findIndex(s => s.id === verification.currentStage);
  const completedStages = verification.completedStages || [];
  
  // Get third-party verifier info
  const thirdPartyInfo = verification.thirdPartyVerifier ? (
    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <Building2 className="h-5 w-5 text-blue-500" />
      <div>
        <p className="text-sm font-medium text-blue-700">
          Third-Party Verifier: {verification.thirdPartyVerifier}
        </p>
        {verification.contactEmail && (
          <p className="text-xs text-blue-600">Contact: {verification.contactEmail}</p>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
      <AlertCircle className="h-5 w-5 text-amber-500" />
      <div>
        <p className="text-sm font-medium text-amber-700">
          No third-party verifier assigned
        </p>
        <p className="text-xs text-amber-600">
          A third-party verifier should be assigned for transparent verification
        </p>
      </div>
    </div>
  );
  
  // Get verification standard info
  const standardInfo = verification.verificationStandard ? (
    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
      <p className="text-sm font-medium text-green-700">
        Verification Standard: {verification.verificationStandard}
      </p>
    </div>
  ) : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Verification Process</CardTitle>
            <CardDescription>
              Project ID: {verification.projectId}
            </CardDescription>
          </div>
          <Badge className={
            verification.status === "approved" ? "bg-green-100 text-green-800" :
            verification.status === "rejected" ? "bg-red-100 text-red-800" :
            "bg-yellow-100 text-yellow-800"
          }>
            {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        {thirdPartyInfo}
        
        {standardInfo}
        
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-4">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />
              
              {sortedStages.map((stage, index) => {
                const isComplete = completedStages.includes(stage.id);
                const isCurrent = stage.id === verification.currentStage;
                const isPending = !isComplete && !isCurrent;
                
                // Get required documents for this stage
                const requiredDocs = stage.requiredDocuments || [];
                const stageDocuments = documents?.filter(d => d.stageId === stage.id) || [];
                const stageComments = comments?.filter(c => c.stageId === stage.id) || [];
                
                const hasAllRequiredDocs = requiredDocs.length > 0 && 
                  requiredDocs.every(req => 
                    stageDocuments.some(doc => doc.documentType === req)
                  );
                
                const icon = stage.icon || (index === sortedStages.length - 1 ? "CheckCircle2" : "FileText");
                
                return (
                  <div key={stage.id} className="relative mb-6 last:mb-0 pl-10">
                    <div className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center border-2 
                      ${isComplete 
                        ? 'bg-green-100 border-green-500 text-green-500' 
                        : isCurrent 
                          ? 'bg-blue-100 border-blue-500 text-blue-500' 
                          : 'bg-white border-gray-300 text-gray-300'}`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    <div>
                      <h4 className={`text-md font-medium mb-1 
                        ${isComplete 
                          ? 'text-green-700' 
                          : isCurrent 
                            ? 'text-blue-700' 
                            : 'text-neutral-500'}`}>
                        {stage.name}
                      </h4>
                      
                      {stage.description && (
                        <p className="text-sm text-neutral-500 mb-2">{stage.description}</p>
                      )}
                      
                      <div className="flex items-center mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${isComplete 
                            ? 'bg-green-100 text-green-800' 
                            : isCurrent 
                              ? getVerificationStageColor(stage.name) 
                              : 'bg-gray-100 text-gray-600'}`}>
                          {isComplete 
                            ? 'Completed' 
                            : isCurrent 
                              ? 'In Progress' 
                              : 'Pending'}
                        </span>
                        
                        {stageDocuments.length > 0 && (
                          <Badge variant="outline" className="ml-2">
                            <FileText className="h-3 w-3 mr-1" />
                            {stageDocuments.length} {stageDocuments.length === 1 ? 'Document' : 'Documents'}
                          </Badge>
                        )}
                        
                        {stageComments.length > 0 && (
                          <Badge variant="outline" className="ml-2">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {stageComments.length} {stageComments.length === 1 ? 'Comment' : 'Comments'}
                          </Badge>
                        )}
                      </div>
                      
                      {isCurrent && (
                        <Accordion type="single" collapsible className="w-full">
                          {requiredDocs.length > 0 && (
                            <AccordionItem value="required-docs" className="border-b-0">
                              <AccordionTrigger className="py-2 text-sm">Required Documents</AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2 mb-2">
                                  {requiredDocs.map((doc, i) => {
                                    const isProvided = stageDocuments.some(d => d.documentType === doc);
                                    return (
                                      <li key={i} className="flex items-center text-sm">
                                        {isProvided ? (
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                        ) : (
                                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                        )}
                                        {doc.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                          
                          {!readOnly && (
                            <>
                              <AccordionItem value="upload-doc" className="border-b-0">
                                <AccordionTrigger className="py-2 text-sm">Upload Document</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3">
                                    <div className="grid w-full gap-1.5">
                                      <Label htmlFor="doc-name">Document Name</Label>
                                      <Input
                                        id="doc-name"
                                        value={documentUpload.name}
                                        onChange={(e) => setDocumentUpload({...documentUpload, name: e.target.value})}
                                        placeholder="e.g., Methodology Assessment Report"
                                      />
                                    </div>
                                    
                                    <div className="grid w-full gap-1.5">
                                      <Label htmlFor="doc-url">Document URL</Label>
                                      <Input
                                        id="doc-url"
                                        value={documentUpload.url}
                                        onChange={(e) => setDocumentUpload({...documentUpload, url: e.target.value})}
                                        placeholder="https://example.com/document.pdf"
                                      />
                                    </div>
                                    
                                    <div className="grid w-full gap-1.5">
                                      <Label htmlFor="doc-type">Document Type</Label>
                                      <select
                                        id="doc-type"
                                        value={documentUpload.type}
                                        onChange={(e) => setDocumentUpload({...documentUpload, type: e.target.value})}
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        <option value="methodology_assessment">Methodology Assessment</option>
                                        <option value="site_inspection">Site Inspection</option>
                                        <option value="stakeholder_consultation">Stakeholder Consultation</option>
                                        <option value="data_validation">Data Validation</option>
                                        <option value="final_report">Final Report</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    
                                    <div className="grid w-full gap-1.5">
                                      <Label htmlFor="doc-notes">Notes</Label>
                                      <Textarea
                                        id="doc-notes"
                                        value={documentUpload.notes}
                                        onChange={(e) => setDocumentUpload({...documentUpload, notes: e.target.value})}
                                        placeholder="Any additional notes about this document"
                                      />
                                    </div>
                                    
                                    <Button
                                      onClick={() => handleDocumentUpload(stage.id)}
                                      disabled={uploadDocument.isPending}
                                      className="w-full"
                                    >
                                      {uploadDocument.isPending ? (
                                        <span className="flex items-center">
                                          <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                                          Uploading...
                                        </span>
                                      ) : (
                                        <span className="flex items-center">
                                          <Upload className="h-4 w-4 mr-2" />
                                          Upload Document
                                        </span>
                                      )}
                                    </Button>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="add-comment" className="border-b-0">
                                <AccordionTrigger className="py-2 text-sm">Add Comment</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3">
                                    <div className="grid w-full gap-1.5">
                                      <Label htmlFor="comment-text">Comment</Label>
                                      <Textarea
                                        id="comment-text"
                                        value={comment.text}
                                        onChange={(e) => setComment({...comment, text: e.target.value})}
                                        placeholder="Add your comment about this verification stage"
                                      />
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="internal-comment"
                                        checked={comment.isInternal}
                                        onChange={(e) => setComment({...comment, isInternal: e.target.checked})}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <Label htmlFor="internal-comment" className="text-sm font-normal">Internal comment (only visible to verifiers)</Label>
                                    </div>
                                    
                                    <Button
                                      onClick={() => handleAddComment(stage.id)}
                                      disabled={addComment.isPending}
                                      className="w-full"
                                    >
                                      {addComment.isPending ? (
                                        <span className="flex items-center">
                                          <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                                          Adding Comment...
                                        </span>
                                      ) : (
                                        <span className="flex items-center">
                                          <MessageCircle className="h-4 w-4 mr-2" />
                                          Add Comment
                                        </span>
                                      )}
                                    </Button>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </>
                          )}
                        </Accordion>
                      )}
                      
                      {isCurrent && !readOnly && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="ml-0">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Complete Stage
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Complete Verification Stage</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to mark this stage as complete? This will advance the verification to the next stage.
                                </DialogDescription>
                              </DialogHeader>
                              
                              {requiredDocs.length > 0 && !hasAllRequiredDocs && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                                  <p className="text-sm text-amber-700 font-medium">Missing Required Documents</p>
                                  <p className="text-xs text-amber-600">
                                    Not all required documents have been uploaded for this stage. It is recommended to upload all required documents before completing this stage.
                                  </p>
                                </div>
                              )}
                              
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {}}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => completeStage.mutate(stage.id)}
                                  disabled={completeStage.isPending}
                                >
                                  {completeStage.isPending ? "Processing..." : "Complete Stage"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {index < sortedStages.length - 1 && onUpdate && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onUpdate(sortedStages[index + 1].id)}
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Advance to Next Stage
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Verification Documents</h3>
              
              {!documents || documents.length === 0 ? (
                <div className="text-center p-6 border rounded-md border-dashed">
                  <FileText className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
                  <p className="text-neutral-500">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {documents.map((doc) => {
                    const stage = stages.find(s => s.id === doc.stageId);
                    return (
                      <div key={doc.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start">
                          <FileCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium">{doc.documentName}</h4>
                              <Badge variant="outline" className="ml-2 capitalize">
                                {doc.documentType.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center text-xs text-neutral-500 mb-2">
                              <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <span>Stage: {stage?.name || 'Unknown'}</span>
                            </div>
                            
                            {doc.notes && (
                              <p className="text-sm text-neutral-600 mb-2">{doc.notes}</p>
                            )}
                            
                            <a 
                              href={doc.documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:text-blue-700 inline-flex items-center"
                            >
                              View Document
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comments">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Verification Comments</h3>
              
              {!comments || comments.length === 0 ? (
                <div className="text-center p-6 border rounded-md border-dashed">
                  <MessageCircle className="h-8 w-8 mx-auto text-neutral-300 mb-2" />
                  <p className="text-neutral-500">No comments added yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {comments.map((comment) => {
                    const stage = stages.find(s => s.id === comment.stageId);
                    return (
                      <div key={comment.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="text-sm font-medium">User #{comment.commentedBy}</span>
                              <span className="text-xs text-neutral-500 ml-2">
                                {new Date(comment.commentedAt).toLocaleString()}
                              </span>
                              
                              {comment.isInternal && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Internal
                                </Badge>
                              )}
                            </div>
                            
                            <div className="p-3 bg-neutral-50 rounded-md mb-2">
                              <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                            </div>
                            
                            <div className="flex items-center text-xs text-neutral-500">
                              <span>Stage: {stage?.name || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6">
        {verification.thirdPartyVerifier ? (
          <Badge variant="outline" className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            <span>{verification.thirdPartyVerifier}</span>
          </Badge>
        ) : (
          <span></span>
        )}
        
        {verification.verificationStandard && (
          <Badge variant="outline" className="bg-green-50">
            {verification.verificationStandard}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

function VerificationStepsLoading() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative mb-6 last:mb-0 pl-10">
              <Skeleton className="absolute left-0 top-1 h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
