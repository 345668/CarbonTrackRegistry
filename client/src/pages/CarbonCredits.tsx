import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CarbonCredit, Project } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNumber, getStatusColor } from "@/lib/utils";
import CarbonCreditsList from "@/components/carbon-credits/CarbonCreditsList";
import IssueCreditForm from "@/components/carbon-credits/IssueCreditForm";

export default function CarbonCredits() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showIssueForm, setShowIssueForm] = useState(false);
  
  const { data: credits, isLoading: isLoadingCredits } = useQuery<CarbonCredit[]>({
    queryKey: ["/api/credits"],
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects", { status: "verified" }],
  });
  
  const isLoading = isLoadingCredits || isLoadingProjects;
  
  // Filter credits based on search term and filters
  const filteredCredits = credits?.filter(credit => {
    const matchesSearch = 
      search === "" || 
      credit.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      credit.projectId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "" || credit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate total credits and retired credits
  const totalCredits = credits?.reduce((sum, credit) => sum + credit.quantity, 0) || 0;
  const availableCredits = credits?.filter(c => c.status === "available").reduce((sum, credit) => sum + credit.quantity, 0) || 0;
  const retiredCredits = credits?.filter(c => c.status === "retired").reduce((sum, credit) => sum + credit.quantity, 0) || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Carbon Credits</h1>
          <p className="mt-1 text-sm text-neutral-700">Track and manage carbon credits across all projects</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={showIssueForm} onOpenChange={setShowIssueForm}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center">
                <span className="material-icons text-sm mr-2">add</span>
                Issue Credits
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Issue New Carbon Credits</DialogTitle>
                <DialogDescription>
                  Create and issue new carbon credits for a verified project
                </DialogDescription>
              </DialogHeader>
              <IssueCreditForm 
                projects={projects?.filter(p => p.status === "verified") || []} 
                onComplete={() => setShowIssueForm(false)} 
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
              <div className="bg-primary-light rounded-md p-3 mr-4">
                <span className="material-icons text-primary">account_balance_wallet</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Credits (tCO₂e)</p>
                <p className="text-2xl font-semibold">{formatNumber(totalCredits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-md p-3 mr-4">
                <span className="material-icons text-green-600">inventory</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Available Credits (tCO₂e)</p>
                <p className="text-2xl font-semibold">{formatNumber(availableCredits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-md p-3 mr-4">
                <span className="material-icons text-gray-600">remove_shopping_cart</span>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Retired Credits (tCO₂e)</p>
                <p className="text-2xl font-semibold">{formatNumber(retiredCredits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="search" className="text-sm font-medium text-neutral-700 mb-1 block">
              Search
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-neutral-400 text-sm">search</span>
              </span>
              <Input
                id="search"
                type="text"
                placeholder="Search by serial number or project ID..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
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
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Credits List */}
      {isLoading ? (
        <CarbonCreditsListLoading />
      ) : (
        <CarbonCreditsList credits={filteredCredits || []} />
      )}
    </div>
  );
}

function CarbonCreditsListLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-6 border-b">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-6 border-b">
              {[1, 2, 3, 4, 5, 6].map((j) => (
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
