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
import { CarbonCredit } from "@/types";
import { formatDate, formatNumber, getStatusColor } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CarbonCreditsListProps {
  credits: CarbonCredit[];
}

export default function CarbonCreditsList({ credits }: CarbonCreditsListProps) {
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [showRetireDialog, setShowRetireDialog] = useState(false);
  const { toast } = useToast();
  
  const retireCreditMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PUT", `/api/credits/${id}`, {
        status: "retired",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      toast({
        title: "Credits retired",
        description: "The carbon credits have been successfully retired.",
      });
      setShowRetireDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to retire credits: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleRetireCredits = () => {
    if (selectedCredit) {
      retireCreditMutation.mutate(selectedCredit.id);
    }
  };
  
  const handleRetireClick = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setShowRetireDialog(true);
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRetireClick(credit)}
                      >
                        Retire
                      </Button>
                    )}
                    {credit.status === "retired" && (
                      <span className="text-xs">
                        Retired on {formatDate(credit.retirementDate || "", "MMM d, yyyy")}
                      </span>
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
