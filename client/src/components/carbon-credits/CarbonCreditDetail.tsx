import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarbonCredit } from "@/types";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatNumber, getStatusColor } from "@/lib/utils";
import { format } from "date-fns";
import ParisAgreementCompliance from "./ParisAgreementCompliance";

interface CarbonCreditDetailProps {
  serialNumber: string;
  onClose?: () => void;
}

export default function CarbonCreditDetail({ serialNumber, onClose }: CarbonCreditDetailProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch credit details
  const { data: credit, isLoading, error } = useQuery<CarbonCredit>({
    queryKey: ["/api/credits", serialNumber],
    queryFn: async () => {
      const res = await fetch(`/api/credits/${serialNumber}`);
      if (!res.ok) {
        throw new Error("Failed to fetch credit details");
      }
      return res.json();
    }
  });
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading Credit Details...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !credit) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load credit details</p>
          {error && <p className="text-sm text-neutral-500">{(error as Error).message}</p>}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          Carbon Credit: {credit.serialNumber}
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <Label className="text-xs text-neutral-500">Project ID</Label>
              <p className="font-medium">{credit.projectId}</p>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Vintage</Label>
              <p className="font-medium">{credit.vintage}</p>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Quantity</Label>
              <p className="font-medium">{formatNumber(credit.quantity)} tCO₂e</p>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Status</Label>
              <div>
                <Badge className={getStatusColor(credit.status)}>
                  {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-neutral-500">Issuance Date</Label>
              <p className="font-medium">{credit.issuanceDate ? format(new Date(credit.issuanceDate), "MMM d, yyyy") : "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-neutral-500">Current Owner</Label>
              <p className="font-medium">{credit.owner}</p>
            </div>
            
            {credit.status === "retired" && (
              <>
                <div>
                  <Label className="text-xs text-neutral-500">Retirement Date</Label>
                  <p className="font-medium">{credit.retirementDate ? format(new Date(credit.retirementDate), "MMM d, yyyy") : "-"}</p>
                </div>
                {credit.retirementPurpose && (
                  <div>
                    <Label className="text-xs text-neutral-500">Retirement Purpose</Label>
                    <p className="font-medium">{credit.retirementPurpose}</p>
                  </div>
                )}
                {credit.retirementBeneficiary && (
                  <div>
                    <Label className="text-xs text-neutral-500">Beneficiary</Label>
                    <p className="font-medium">{credit.retirementBeneficiary}</p>
                  </div>
                )}
              </>
            )}
            
            {credit.status === "transferred" && (
              <>
                <div>
                  <Label className="text-xs text-neutral-500">Transfer Date</Label>
                  <p className="font-medium">{credit.transferDate ? format(new Date(credit.transferDate), "MMM d, yyyy") : "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-neutral-500">Recipient</Label>
                  <p className="font-medium">{credit.transferRecipient}</p>
                </div>
                {credit.transferPurpose && (
                  <div>
                    <Label className="text-xs text-neutral-500">Transfer Purpose</Label>
                    <p className="font-medium">{credit.transferPurpose}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <Tabs 
          defaultValue="details" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Credit Details</TabsTrigger>
            <TabsTrigger value="paris">Paris Agreement</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Credit Lifecycle</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Issued</Badge>
                  <span className="text-sm text-muted-foreground">
                    {credit.issuanceDate ? format(new Date(credit.issuanceDate), "MMM d, yyyy") : "-"}
                  </span>
                </div>
                
                {credit.status === "transferred" && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">Transferred</Badge>
                    <span className="text-sm text-muted-foreground">
                      {credit.transferDate ? format(new Date(credit.transferDate), "MMM d, yyyy") : "-"} - to {credit.transferRecipient}
                    </span>
                  </div>
                )}
                
                {credit.status === "retired" && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Retired</Badge>
                    <span className="text-sm text-muted-foreground">
                      {credit.retirementDate ? format(new Date(credit.retirementDate), "MMM d, yyyy") : "-"} - for {credit.retirementPurpose}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Additional project information could be added here */}
            </div>
          </TabsContent>
          <TabsContent value="paris" className="mt-4">
            <ParisAgreementCompliance credit={credit} queryClient={queryClient} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}