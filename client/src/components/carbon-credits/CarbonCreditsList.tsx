import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { CarbonCredit, User } from "@/types";
import { formatDate, formatNumber, getStatusColor } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowUpRight, Banknote, FileCheck, Info, RefreshCw, Send } from "lucide-react";
import CarbonCreditDetail from "./CarbonCreditDetail";

interface CarbonCreditsListProps {
  credits: CarbonCredit[];
}

export default function CarbonCreditsList({ credits }: CarbonCreditsListProps) {
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [showRetireDialog, setShowRetireDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedSerialNumber, setSelectedSerialNumber] = useState<string | null>(null);
  const [retirementDetails, setRetirementDetails] = useState({
    purpose: "",
    beneficiary: ""
  });
  const [transferDetails, setTransferDetails] = useState({
    recipient: "",
    purpose: ""
  });
  const { toast } = useToast();
  
  // Get users for recipient dropdown
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const retireCreditMutation = useMutation({
    mutationFn: async (data: { id: number, purpose?: string, beneficiary?: string }) => {
      return await apiRequest("POST", `/api/credits/${data.id}/retire`, {
        purpose: data.purpose,
        beneficiary: data.beneficiary
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Credits retired",
        description: "The carbon credits have been successfully retired.",
      });
      setShowRetireDialog(false);
      setRetirementDetails({ purpose: "", beneficiary: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to retire credits: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const transferCreditMutation = useMutation({
    mutationFn: async (data: { id: number, recipient: string, purpose?: string }) => {
      return await apiRequest("POST", `/api/credits/${data.id}/transfer`, {
        recipient: data.recipient,
        purpose: data.purpose
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      toast({
        title: "Credits transferred",
        description: "The carbon credits have been successfully transferred.",
      });
      setShowTransferDialog(false);
      setTransferDetails({ recipient: "", purpose: "" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to transfer credits: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleRetireCredits = () => {
    if (selectedCredit) {
      retireCreditMutation.mutate({
        id: selectedCredit.id,
        purpose: retirementDetails.purpose || undefined,
        beneficiary: retirementDetails.beneficiary || undefined
      });
    }
  };
  
  const handleTransferCredits = () => {
    if (selectedCredit && transferDetails.recipient) {
      transferCreditMutation.mutate({
        id: selectedCredit.id,
        recipient: transferDetails.recipient,
        purpose: transferDetails.purpose || undefined
      });
    } else {
      toast({
        title: "Missing information",
        description: "Please select a recipient for the transfer.",
        variant: "destructive",
      });
    }
  };
  
  const handleRetireClick = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setRetirementDetails({ purpose: "", beneficiary: "" });
    setShowRetireDialog(true);
  };
  
  const handleTransferClick = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setTransferDetails({ recipient: "", purpose: "" });
    setShowTransferDialog(true);
  };
  
  const handleViewDetailClick = (credit: CarbonCredit) => {
    setSelectedSerialNumber(credit.serialNumber);
    setShowDetailDialog(true);
  };

  if (credits.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <Banknote className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No Carbon Credits Found</h3>
        <p className="text-neutral-500 mb-4">There are no carbon credits matching your criteria</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carbon Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Serial Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Project ID
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {credits.map((credit) => (
                <tr key={credit.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                        onClick={() => handleViewDetailClick(credit)}
                      >
                        {credit.serialNumber}
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                    {credit.projectId}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-blue-600"
                        onClick={() => handleViewDetailClick(credit)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      
                      {credit.status === "available" && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTransferClick(credit)}
                            className="flex items-center"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Transfer
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRetireClick(credit)}
                            className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <FileCheck className="h-3.5 w-3.5 mr-1" />
                            Retire
                          </Button>
                        </div>
                      )}
                      {credit.status === "retired" && (
                        <div className="flex flex-col">
                          <span className="text-xs text-green-700 font-semibold flex items-center">
                            <FileCheck className="h-3.5 w-3.5 mr-1 text-green-600" />
                            Retired
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatDate(credit.retirementDate || "", "MMM d, yyyy")}
                          </span>
                          {credit.retirementPurpose && (
                            <span className="text-xs text-neutral-500 mt-1 italic">
                              For: {credit.retirementPurpose}
                            </span>
                          )}
                        </div>
                      )}
                      {credit.status === "transferred" && (
                        <div className="flex flex-col">
                          <span className="text-xs text-blue-700 font-semibold flex items-center">
                            <Send className="h-3.5 w-3.5 mr-1 text-blue-600" />
                            Transferred
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatDate(credit.transferDate || "", "MMM d, yyyy")}
                          </span>
                          {credit.transferRecipient && (
                            <span className="text-xs text-neutral-500 mt-1">
                              To: {credit.transferRecipient}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      {/* Retire Credits Dialog */}
      <Dialog open={showRetireDialog} onOpenChange={setShowRetireDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire Carbon Credits</DialogTitle>
            <DialogDescription>
              Retiring carbon credits permanently removes them from circulation after they've been used to offset emissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-neutral-500">Serial Number</p>
                    <p className="text-sm font-medium">{selectedCredit?.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Project ID</p>
                    <p className="text-sm font-medium">{selectedCredit?.projectId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Quantity</p>
                    <p className="text-sm font-medium">{formatNumber(selectedCredit?.quantity || 0)} tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Vintage</p>
                    <p className="text-sm font-medium">{selectedCredit?.vintage}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="retirement-purpose">Retirement Purpose</Label>
                  <Input
                    id="retirement-purpose"
                    placeholder="e.g., Corporate carbon neutrality, Voluntary offsetting"
                    value={retirementDetails.purpose}
                    onChange={(e) => setRetirementDetails({...retirementDetails, purpose: e.target.value})}
                  />
                </div>
                
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="retirement-beneficiary">Beneficiary (Optional)</Label>
                  <Input
                    id="retirement-beneficiary"
                    placeholder="e.g., Acme Corporation, Personal use"
                    value={retirementDetails.beneficiary}
                    onChange={(e) => setRetirementDetails({...retirementDetails, beneficiary: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                <div className="flex items-start">
                  <FileCheck className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">This action cannot be undone</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Once you retire these credits, they will be permanently marked as used and removed from the available pool.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRetireDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRetireCredits}
              disabled={retireCreditMutation.isPending}
            >
              {retireCreditMutation.isPending && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              Confirm Retirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Transfer Credits Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Carbon Credits</DialogTitle>
            <DialogDescription>
              Transfer carbon credits to another account to facilitate trading or ownership changes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-neutral-500">Serial Number</p>
                    <p className="text-sm font-medium">{selectedCredit?.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Project ID</p>
                    <p className="text-sm font-medium">{selectedCredit?.projectId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Quantity</p>
                    <p className="text-sm font-medium">{formatNumber(selectedCredit?.quantity || 0)} tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Current Owner</p>
                    <p className="text-sm font-medium">{selectedCredit?.owner}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="transfer-recipient">Transfer Recipient</Label>
                  <select
                    id="transfer-recipient"
                    value={transferDetails.recipient}
                    onChange={(e) => setTransferDetails({...transferDetails, recipient: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select recipient...</option>
                    {users?.map(user => (
                      <option key={user.id} value={user.username}>
                        {user.fullName} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="transfer-purpose">Transfer Purpose (Optional)</Label>
                  <Textarea
                    id="transfer-purpose"
                    placeholder="e.g., Sale of carbon credits, Internal corporate transfer"
                    value={transferDetails.purpose}
                    onChange={(e) => setTransferDetails({...transferDetails, purpose: e.target.value})}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <ArrowUpRight className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Transfer Information</p>
                    <p className="text-xs text-blue-700 mt-1">
                      This will transfer ownership of the credits to the recipient. They will have full control over the credits after the transfer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleTransferCredits}
              disabled={transferCreditMutation.isPending || !transferDetails.recipient}
            >
              {transferCreditMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Transfer Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Credit Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSerialNumber && (
            <CarbonCreditDetail 
              serialNumber={selectedSerialNumber} 
              onClose={() => setShowDetailDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
