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
import { ArrowUpRight, Banknote, FileCheck, RefreshCw, Send } from "lucide-react";

interface CarbonCreditsListProps {
  credits: CarbonCredit[];
}

export default function CarbonCreditsList({ credits }: CarbonCreditsListProps) {
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [showRetireDialog, setShowRetireDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
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

  if (credits.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <span className="material-icons text-5xl text-neutral-300 mb-2">account_balance_wallet</span>
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
                    {credit.serialNumber}
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
            <div className="space-y-3">
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
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                <div className="flex items-start">
                  <span className="material-icons text-yellow-500 mr-2">warning</span>
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
                <span className="material-icons mr-2 animate-spin text-sm">refresh</span>
              )}
              Confirm Retirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
