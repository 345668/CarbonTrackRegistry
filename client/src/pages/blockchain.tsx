import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Activity, Settings, ExternalLink, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Define the blockchain record type based on the server schema
interface BlockchainRecord {
  id: number;
  txHash: string;
  entityType: string;
  entityId: string;
  action: string;
  data: Record<string, any>;
  timestamp: string;
  blockNumber?: number;
  chainId?: number;
  network?: string;
}

// Define the blockchain config type
interface BlockchainConfig {
  id: number;
  enabled: boolean;
  provider?: string;
  apiKey?: string;
  chainId?: number;
  contractAddress?: string;
  privateKey?: string;
  gasPrice?: number;
  gasLimit?: number;
  lastUpdated: string;
}

// Define the corresponding adjustment type
interface CorrespondingAdjustment {
  id: number;
  creditId: number;
  creditSerialNumber: string;
  hostCountry: string;
  recipientCountry?: string;
  adjustmentType: string;
  adjustmentQuantity: number;
  adjustmentStatus: string;
  adjustmentDate?: string;
  authorizedBy?: string;
  verifiedBy?: string;
  ndcTarget?: string;
  mitigationOutcomeType?: string;
  authorizationDocument?: string;
  verificationDocument?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Define the config form schema
const blockchainConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.string().min(1, "Provider is required").optional(),
  apiKey: z.string().optional(),
  chainId: z.coerce.number().int().optional(),
  contractAddress: z.string().optional(),
  privateKey: z.string().optional(),
  gasPrice: z.coerce.number().int().optional(),
  gasLimit: z.coerce.number().int().optional(),
});

export default function BlockchainPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('transactions');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [txToVerify, setTxToVerify] = useState('');
  const isAdmin = user?.role === 'admin';
  
  // Check for tab parameter in URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['transactions', 'paris-compliance', 'configuration'].includes(tabParam)) {
      // Only set admin tabs if user is admin
      if (tabParam === 'configuration' && !isAdmin) {
        return;
      }
      setActiveTab(tabParam);
    }
  }, [isAdmin]);

  // Query for blockchain records
  const { 
    data: records, 
    isLoading: recordsLoading,
    isError: recordsError
  } = useQuery<BlockchainRecord[]>({
    queryKey: ['/api/blockchain/records'],
    enabled: true,
  });

  // Query for blockchain config (admin only)
  const { 
    data: config, 
    isLoading: configLoading,
    isError: configError
  } = useQuery<BlockchainConfig>({
    queryKey: ['/api/blockchain/config'],
    enabled: isAdmin,
  });
  
  // Query for corresponding adjustments
  const { 
    data: adjustments, 
    isLoading: adjustmentsLoading,
    isError: adjustmentsError
  } = useQuery<CorrespondingAdjustment[]>({
    queryKey: ['/api/adjustments'],
    enabled: true,
  });

  // Form for blockchain config
  const form = useForm<z.infer<typeof blockchainConfigSchema>>({
    resolver: zodResolver(blockchainConfigSchema),
    defaultValues: {
      enabled: config?.enabled || false,
      provider: config?.provider || '',
      apiKey: config?.apiKey || '',
      chainId: config?.chainId || 1,
      contractAddress: config?.contractAddress || '',
      privateKey: config?.privateKey ? '********' : '',
      gasPrice: config?.gasPrice || 0,
      gasLimit: config?.gasLimit || 0,
    },
  });

  // Update form values when config data is loaded
  React.useEffect(() => {
    if (config) {
      form.reset({
        enabled: config.enabled,
        provider: config.provider || '',
        apiKey: config.apiKey || '',
        chainId: config.chainId || 1,
        contractAddress: config.contractAddress || '',
        privateKey: config.privateKey ? '********' : '',
        gasPrice: config.gasPrice || 0,
        gasLimit: config.gasLimit || 0,
      });
    }
  }, [config, form]);

  // Mutation for updating blockchain config
  const updateConfigMutation = useMutation({
    mutationFn: async (data: z.infer<typeof blockchainConfigSchema>) => {
      const res = await apiRequest('PUT', '/api/blockchain/config', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blockchain/config'] });
      toast({
        title: "Configuration updated",
        description: "Blockchain configuration has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for verifying a transaction
  const verifyTransactionMutation = useMutation({
    mutationFn: async (txHash: string) => {
      const res = await apiRequest('GET', `/api/blockchain/records/${txHash}`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transaction verified",
        description: `Transaction ${data.txHash.substring(0, 10)}... is valid and recorded on the blockchain.`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: "The transaction could not be verified: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission for config updates
  const onSubmit = (data: z.infer<typeof blockchainConfigSchema>) => {
    // Don't send the password if it hasn't changed
    if (data.privateKey === '********') {
      delete data.privateKey;
    }
    
    updateConfigMutation.mutate(data);
  };

  // Handle transaction verification
  const handleVerifyTransaction = () => {
    if (!txToVerify.trim()) {
      toast({
        title: "Verification failed",
        description: "Please enter a transaction hash to verify.",
        variant: "destructive",
      });
      return;
    }
    
    verifyTransactionMutation.mutate(txToVerify);
    setShowVerifyDialog(false);
  };

  // Render the transaction status badge
  const renderStatusBadge = (record: BlockchainRecord) => {
    const badgeVariants: Record<string, string> = {
      created: "bg-green-500",
      updated: "bg-blue-500",
      transferred: "bg-yellow-500",
      retired: "bg-red-500",
      adjusted: "bg-purple-500",
    };
    
    return (
      <Badge className={badgeVariants[record.action] || "bg-gray-500"}>
        {record.action}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Blockchain Integration</h1>
          <p className="text-neutral-600 mt-1">
            Immutable record-keeping for carbon credit transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Verify Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Blockchain Transaction</DialogTitle>
                <DialogDescription>
                  Enter a transaction hash to verify its authenticity on the blockchain.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="txHash" className="text-sm font-medium">Transaction Hash</label>
                  <Input 
                    id="txHash" 
                    placeholder="0x..." 
                    value={txToVerify}
                    onChange={(e) => setTxToVerify(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleVerifyTransaction}
                  disabled={verifyTransactionMutation.isPending}
                >
                  {verifyTransactionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="transactions" className="flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="paris-compliance" className="flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            Paris Agreement
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="configuration" className="flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="transactions">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Blockchain Records</CardTitle>
              <CardDescription>
                View all transactions recorded on the blockchain for transparency and immutability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recordsError ? (
                <div className="flex justify-center items-center py-12 text-destructive">
                  Failed to load blockchain records
                </div>
              ) : records && records.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction Hash</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Entity ID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Block #</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-mono text-xs">
                            {record.txHash.substring(0, 10)}...{record.txHash.substring(record.txHash.length - 6)}
                          </TableCell>
                          <TableCell className="capitalize">{record.entityType}</TableCell>
                          <TableCell className="font-mono text-xs">{record.entityId}</TableCell>
                          <TableCell>{renderStatusBadge(record)}</TableCell>
                          <TableCell>{record.blockNumber || 'N/A'}</TableCell>
                          <TableCell>{record.network || 'N/A'}</TableCell>
                          <TableCell>
                            {record.timestamp ? format(new Date(record.timestamp), 'MMM d, yyyy HH:mm') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  No blockchain records found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paris-compliance">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Paris Agreement Article 6 Compliance</CardTitle>
              <CardDescription>
                Track corresponding adjustments for internationally transferred carbon credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adjustmentsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : adjustmentsError ? (
                <div className="flex justify-center items-center py-12 text-destructive">
                  Failed to load corresponding adjustments
                </div>
              ) : adjustments && adjustments.length > 0 ? (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Credit Serial #</TableHead>
                          <TableHead>Host Country</TableHead>
                          <TableHead>Recipient Country</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>NDC Target</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adjustments.map((adjustment) => (
                          <TableRow key={adjustment.id}>
                            <TableCell className="font-mono text-xs">
                              {adjustment.creditSerialNumber}
                            </TableCell>
                            <TableCell>{adjustment.hostCountry}</TableCell>
                            <TableCell>{adjustment.recipientCountry || '-'}</TableCell>
                            <TableCell>{adjustment.adjustmentType}</TableCell>
                            <TableCell>{adjustment.adjustmentQuantity.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  adjustment.adjustmentStatus === "approved"
                                    ? "bg-green-500"
                                    : adjustment.adjustmentStatus === "pending"
                                    ? "bg-yellow-500"
                                    : adjustment.adjustmentStatus === "rejected"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }
                              >
                                {adjustment.adjustmentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {adjustment.ndcTarget || '-'}
                            </TableCell>
                            <TableCell>
                              {adjustment.adjustmentDate
                                ? format(new Date(adjustment.adjustmentDate), 'MMM d, yyyy')
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Paris Agreement Article 6</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Cooperative Approaches</h4>
                            <p className="text-sm text-neutral-600">
                              Article 6.2 of the Paris Agreement allows countries to engage in voluntary 
                              cooperation when implementing their NDCs through the use of internationally 
                              transferred mitigation outcomes (ITMOs).
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Corresponding Adjustments</h4>
                            <p className="text-sm text-neutral-600">
                              To avoid double counting, when carbon credits are transferred internationally, 
                              a corresponding adjustment must be applied to ensure the emission reduction 
                              is only counted once toward the NDC of the receiving country.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Compliance Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                              <h4 className="text-sm font-medium text-neutral-600">Total Adjustments</h4>
                              <p className="text-2xl font-bold text-primary">
                                {adjustments.length}
                              </p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <h4 className="text-sm font-medium text-neutral-600">Total Volume</h4>
                              <p className="text-2xl font-bold text-primary">
                                {adjustments.reduce((sum, adj) => sum + adj.adjustmentQuantity, 0).toLocaleString()} tCO₂e
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4">
                              <h4 className="text-sm font-medium text-neutral-600">Approved</h4>
                              <p className="text-2xl font-bold text-green-500">
                                {adjustments.filter(adj => adj.adjustmentStatus === "approved").length}
                              </p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <h4 className="text-sm font-medium text-neutral-600">Pending</h4>
                              <p className="text-2xl font-bold text-yellow-500">
                                {adjustments.filter(adj => adj.adjustmentStatus === "pending").length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  No corresponding adjustments found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="configuration">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Configuration</CardTitle>
                <CardDescription>
                  Configure the blockchain integration settings for the registry
                </CardDescription>
              </CardHeader>
              <CardContent>
                {configLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : configError ? (
                  <div className="flex justify-center items-center py-12 text-destructive">
                    Failed to load blockchain configuration
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Blockchain Integration
                              </FormLabel>
                              <FormDescription>
                                When enabled, transactions will be recorded on the blockchain.
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
                      
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Blockchain Provider</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a provider" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="mock">Mock Provider (Testing)</SelectItem>
                                  <SelectItem value="ethereum">Ethereum</SelectItem>
                                  <SelectItem value="polygon">Polygon</SelectItem>
                                  <SelectItem value="avalanche">Avalanche</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                The blockchain network provider to use.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="chainId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chain ID</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                              <FormDescription>
                                The blockchain network chain ID.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormDescription>
                                API key for the blockchain provider.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contractAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contract Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Smart contract address for carbon credit registry.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="privateKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Private Key</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormDescription>
                                Private key for signing transactions (stored securely).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gasPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gas Price (Gwei)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                              <FormDescription>
                                Default gas price for transactions.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gasLimit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gas Limit</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                              <FormDescription>
                                Default gas limit for transactions.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateConfigMutation.isPending}
                        >
                          {updateConfigMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Configuration
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}