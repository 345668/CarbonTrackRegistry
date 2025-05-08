import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CarbonCredit, CorrespondingAdjustment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form schema for Paris Agreement Compliance update
const parisComplianceSchema = z.object({
  parisAgreementEligible: z.boolean().default(false),
  hostCountry: z.string().min(2, "Please enter a valid country code").max(3),
  correspondingAdjustmentStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  correspondingAdjustmentDetails: z.string().optional(),
  internationalTransfer: z.boolean().default(false),
  mitigationOutcome: z.string().optional(),
  authorizationReference: z.string().optional(),
  authorizationDate: z.date().optional(),
});

type ParisComplianceFormValues = z.infer<typeof parisComplianceSchema>;

// Form schema for Corresponding Adjustment creation
const correspondingAdjustmentSchema = z.object({
  creditId: z.number(),
  creditSerialNumber: z.string(),
  hostCountry: z.string().min(2, "Please enter a valid country code").max(3),
  recipientCountry: z.string().min(2, "Please enter a valid country code").max(3),
  adjustmentType: z.enum(["Article 6.2", "Article 6.4"]),
  adjustmentQuantity: z.number().positive("Quantity must be greater than zero"),
  adjustmentStatus: z.enum(["pending", "approved", "verified", "rejected"]).default("pending"),
  adjustmentDate: z.date().optional(),
  authorizedBy: z.string().optional(),
  verifiedBy: z.string().optional(),
  ndcTarget: z.string().optional(),
  mitigationOutcomeType: z.string().optional(),
  authorizationDocument: z.string().url("Please enter a valid URL").optional(),
  verificationDocument: z.string().url("Please enter a valid URL").optional(),
  notes: z.string().optional(),
});

type AdjustmentFormValues = z.infer<typeof correspondingAdjustmentSchema>;

interface ParisAgreementComplianceProps {
  credit: CarbonCredit;
  queryClient: QueryClient;
}

export default function ParisAgreementCompliance({ credit, queryClient }: ParisAgreementComplianceProps) {
  const { toast } = useToast();
  const [isComplianceDialogOpen, setIsComplianceDialogOpen] = useState(false);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);

  // Fetch adjustments for this credit
  const { data: adjustments, isLoading: isLoadingAdjustments } = useQuery<CorrespondingAdjustment[]>({
    queryKey: ['/api/credits', credit.id, 'adjustments'],
    queryFn: () => fetch(`/api/credits/${credit.id}/adjustments`).then(res => res.json()),
  });

  // Paris Agreement Compliance form
  const complianceForm = useForm<ParisComplianceFormValues>({
    resolver: zodResolver(parisComplianceSchema),
    defaultValues: {
      parisAgreementEligible: credit.parisAgreementEligible || false,
      hostCountry: credit.hostCountry || "",
      correspondingAdjustmentStatus: credit.correspondingAdjustmentStatus as "pending" | "approved" | "rejected" || "pending",
      correspondingAdjustmentDetails: credit.correspondingAdjustmentDetails || "",
      internationalTransfer: credit.internationalTransfer || false,
      mitigationOutcome: credit.mitigationOutcome || "",
      authorizationReference: credit.authorizationReference || "",
      authorizationDate: credit.authorizationDate ? new Date(credit.authorizationDate) : undefined,
    }
  });

  // Paris Agreement Compliance mutation
  const updateComplianceMutation = useMutation({
    mutationFn: async (data: ParisComplianceFormValues) => {
      const res = await apiRequest("PATCH", `/api/credits/${credit.id}/paris-compliance`, {
        ...data,
        // Format date for API
        authorizationDate: data.authorizationDate ? format(data.authorizationDate, "yyyy-MM-dd") : undefined
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Compliance settings updated",
        description: "The Paris Agreement compliance settings have been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/credits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/credits', credit.id] });
      setIsComplianceDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update compliance settings",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Corresponding Adjustment form
  const adjustmentForm = useForm<AdjustmentFormValues>({
    resolver: zodResolver(correspondingAdjustmentSchema),
    defaultValues: {
      creditId: credit.id,
      creditSerialNumber: credit.serialNumber,
      hostCountry: credit.hostCountry || "",
      recipientCountry: "",
      adjustmentType: "Article 6.2",
      adjustmentQuantity: credit.quantity,
      adjustmentStatus: "pending",
      adjustmentDate: undefined,
      authorizedBy: "",
      verifiedBy: "",
      ndcTarget: "",
      mitigationOutcomeType: credit.mitigationOutcome || "",
      authorizationDocument: "",
      verificationDocument: "",
      notes: "",
    }
  });

  // Corresponding Adjustment creation mutation
  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: AdjustmentFormValues) => {
      const res = await apiRequest("POST", "/api/adjustments", {
        ...data,
        // Format date for API
        adjustmentDate: data.adjustmentDate ? format(data.adjustmentDate, "yyyy-MM-dd") : undefined
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Corresponding adjustment created",
        description: "The corresponding adjustment has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/credits', credit.id, 'adjustments'] });
      setIsAdjustmentDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create corresponding adjustment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handler for Paris Agreement Compliance form submission
  function onComplianceSubmit(data: ParisComplianceFormValues) {
    updateComplianceMutation.mutate(data);
  }

  // Handler for Corresponding Adjustment form submission
  function onAdjustmentSubmit(data: AdjustmentFormValues) {
    createAdjustmentMutation.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Paris Agreement Compliance</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4 bg-card p-4 rounded-md border">
          <h4 className="font-medium">Compliance Status</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Eligible for Paris Agreement</Label>
              <div className="font-medium">
                {credit.parisAgreementEligible ? "Yes" : "No"}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Host Country</Label>
              <div className="font-medium">
                {credit.hostCountry || "Not specified"}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Adjustment Status</Label>
              <div className="font-medium">
                {credit.correspondingAdjustmentStatus && (
                  <Badge 
                    className={cn(
                      credit.correspondingAdjustmentStatus === "approved" ? "bg-green-500" : 
                      credit.correspondingAdjustmentStatus === "rejected" ? "bg-red-500" : 
                      "bg-yellow-500"
                    )}
                  >
                    {credit.correspondingAdjustmentStatus.toUpperCase()}
                  </Badge>
                ) || "Not started"}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">International Transfer</Label>
              <div className="font-medium">
                {credit.internationalTransfer ? "Yes" : "No"}
              </div>
            </div>
          </div>
          
          {credit.authorizationReference && (
            <div>
              <Label className="text-xs text-muted-foreground">Authorization Reference</Label>
              <div className="font-medium">
                {credit.authorizationReference}
              </div>
            </div>
          )}
          
          {credit.mitigationOutcome && (
            <div>
              <Label className="text-xs text-muted-foreground">Mitigation Outcome</Label>
              <div className="font-medium">
                {credit.mitigationOutcome}
              </div>
            </div>
          )}
          
          {credit.correspondingAdjustmentDetails && (
            <div>
              <Label className="text-xs text-muted-foreground">Adjustment Details</Label>
              <div className="font-medium text-sm">
                {credit.correspondingAdjustmentDetails}
              </div>
            </div>
          )}
          
          <Button onClick={() => setIsComplianceDialogOpen(true)}>
            Update Compliance Status
          </Button>
        </div>
        
        <div className="space-y-4 bg-card p-4 rounded-md border">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Corresponding Adjustments</h4>
            <Button 
              size="sm" 
              onClick={() => setIsAdjustmentDialogOpen(true)}
              disabled={!credit.parisAgreementEligible}
            >
              New Adjustment
            </Button>
          </div>
          
          {!credit.parisAgreementEligible && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not eligible</AlertTitle>
              <AlertDescription>
                This credit is not marked as eligible for Paris Agreement Article 6.
                Update the compliance status to enable corresponding adjustments.
              </AlertDescription>
            </Alert>
          )}
          
          {isLoadingAdjustments ? (
            <div className="text-center py-4">Loading adjustments...</div>
          ) : adjustments && adjustments.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {adjustments.map((adjustment, index) => (
                <AccordionItem value={`item-${index}`} key={adjustment.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <span>
                        {adjustment.hostCountry} → {adjustment.recipientCountry || "N/A"}
                      </span>
                      <Badge 
                        className={cn(
                          adjustment.adjustmentStatus === "approved" ? "bg-green-500" : 
                          adjustment.adjustmentStatus === "verified" ? "bg-blue-500" :
                          adjustment.adjustmentStatus === "rejected" ? "bg-red-500" : 
                          "bg-yellow-500"
                        )}
                      >
                        {adjustment.adjustmentStatus}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 py-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Type</Label>
                          <div className="font-medium">
                            {adjustment.adjustmentType}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Quantity</Label>
                          <div className="font-medium">
                            {adjustment.adjustmentQuantity} tCO₂e
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Adjustment Date</Label>
                          <div className="font-medium">
                            {adjustment.adjustmentDate ? 
                              format(new Date(adjustment.adjustmentDate), "PPP") : 
                              "Not set"}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground">Authorized By</Label>
                          <div className="font-medium">
                            {adjustment.authorizedBy || "Not specified"}
                          </div>
                        </div>
                      </div>
                      
                      {adjustment.ndcTarget && (
                        <div>
                          <Label className="text-xs text-muted-foreground">NDC Target</Label>
                          <div className="font-medium">
                            {adjustment.ndcTarget}
                          </div>
                        </div>
                      )}
                      
                      {adjustment.notes && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Notes</Label>
                          <div className="font-medium text-sm">
                            {adjustment.notes}
                          </div>
                        </div>
                      )}
                      
                      {(adjustment.authorizationDocument || adjustment.verificationDocument) && (
                        <div className="pt-2">
                          <Label className="text-xs text-muted-foreground">Documents</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {adjustment.authorizationDocument && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => window.open(adjustment.authorizationDocument, '_blank')}
                              >
                                Authorization Document
                              </Button>
                            )}
                            
                            {adjustment.verificationDocument && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => window.open(adjustment.verificationDocument, '_blank')}
                              >
                                Verification Document
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No corresponding adjustments found.
            </div>
          )}
        </div>
      </div>
      
      {/* Paris Agreement Compliance Dialog */}
      <Dialog open={isComplianceDialogOpen} onOpenChange={setIsComplianceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Paris Agreement Compliance</DialogTitle>
            <DialogDescription>
              Configure the Paris Agreement Article 6 compliance settings for this carbon credit.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...complianceForm}>
            <form onSubmit={complianceForm.handleSubmit(onComplianceSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={complianceForm.control}
                  name="parisAgreementEligible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                      <div className="space-y-0.5">
                        <FormLabel>Eligible for Paris Agreement</FormLabel>
                        <FormDescription>
                          Is this credit eligible for Paris Agreement Article 6 mechanisms?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={complianceForm.control}
                  name="hostCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Country</FormLabel>
                      <FormControl>
                        <Input placeholder="ISO country code (e.g., USA)" {...field} />
                      </FormControl>
                      <FormDescription>
                        The country where the project is located (ISO code).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={complianceForm.control}
                    name="correspondingAdjustmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adjustment Status</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={complianceForm.control}
                    name="internationalTransfer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
                        <div className="space-y-0.5">
                          <FormLabel>International Transfer</FormLabel>
                          <FormDescription>
                            Has this credit been transferred internationally?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={complianceForm.control}
                  name="mitigationOutcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitigation Outcome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g., ITMO under Art. 6.2, A6.4ER under Art. 6.4" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Type of mitigation outcome under Paris Agreement Article 6.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={complianceForm.control}
                    name="authorizationReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authorization Reference</FormLabel>
                        <FormControl>
                          <Input placeholder="Reference number or ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Reference to the authorization document.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={complianceForm.control}
                    name="authorizationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Authorization Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Date when the credit was authorized for international transfer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={complianceForm.control}
                  name="correspondingAdjustmentDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional details about the corresponding adjustment" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide any additional details about the corresponding adjustment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsComplianceDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateComplianceMutation.isPending}
                >
                  {updateComplianceMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Corresponding Adjustment Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Corresponding Adjustment</DialogTitle>
            <DialogDescription>
              Record a corresponding adjustment for this carbon credit under Paris Agreement Article 6.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...adjustmentForm}>
            <form onSubmit={adjustmentForm.handleSubmit(onAdjustmentSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={adjustmentForm.control}
                    name="hostCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host Country</FormLabel>
                        <FormControl>
                          <Input placeholder="ISO country code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adjustmentForm.control}
                    name="recipientCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Country</FormLabel>
                        <FormControl>
                          <Input placeholder="ISO country code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={adjustmentForm.control}
                    name="adjustmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adjustment Type</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Article 6.2">Article 6.2</SelectItem>
                            <SelectItem value="Article 6.4">Article 6.4</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adjustmentForm.control}
                    name="adjustmentQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (tCO₂e)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Quantity of credits" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={adjustmentForm.control}
                    name="adjustmentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adjustmentForm.control}
                    name="adjustmentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Adjustment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={adjustmentForm.control}
                    name="authorizedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authorized By</FormLabel>
                        <FormControl>
                          <Input placeholder="Entity name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adjustmentForm.control}
                    name="verifiedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verified By</FormLabel>
                        <FormControl>
                          <Input placeholder="Entity name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={adjustmentForm.control}
                  name="ndcTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NDC Target</FormLabel>
                      <FormControl>
                        <Input placeholder="Related NDC target for the host country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={adjustmentForm.control}
                  name="mitigationOutcomeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitigation Outcome Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Type of mitigation outcome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={adjustmentForm.control}
                    name="authorizationDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Authorization Document URL</FormLabel>
                        <FormControl>
                          <Input placeholder="URL to document" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={adjustmentForm.control}
                    name="verificationDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Document URL</FormLabel>
                        <FormControl>
                          <Input placeholder="URL to document" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={adjustmentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about this adjustment" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAdjustmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAdjustmentMutation.isPending}
                >
                  {createAdjustmentMutation.isPending ? "Creating..." : "Create Adjustment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}