import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, QrCode, RefreshCw, Scan } from 'lucide-react';
import { CarbonCredit, Project } from '@/types';

// Form schema for verification
const verificationSchema = z.object({
  type: z.enum(['project', 'credit']),
  id: z.string().min(1, 'ID is required'),
  verificationId: z.string().optional(),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface VerificationResult {
  verified: boolean;
  type: 'project' | 'credit';
  project?: Project;
  credit?: CarbonCredit;
  verification?: any;
}

/**
 * Certificate Verification Form Component
 */
export function CertificateVerificationForm() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Initialize form
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      type: 'project',
      id: '',
      verificationId: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: VerificationFormValues) => {
    setIsVerifying(true);
    
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      params.append('type', data.type);
      params.append('id', data.id);
      
      if (data.type === 'project' && data.verificationId) {
        params.append('verificationId', data.verificationId);
      }
      
      // Make API request to verify certificate
      const response = await fetch(`/api/verify-certificate?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Certificate verification failed');
      }
      
      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        verified: false,
        type: data.type as 'project' | 'credit',
      });
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Determine if verification ID is required
  const showVerificationId = form.watch('type') === 'project';
  
  // Reset result when form changes
  const resetResult = () => {
    setResult(null);
  };
  
  const handleTypeChange = () => {
    resetResult();
    form.setValue('verificationId', '');
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Verify Certificate</CardTitle>
          <CardDescription>
            Verify the authenticity of a project or carbon credit certificate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Verification</TabsTrigger>
              <TabsTrigger value="qr">Scan QR Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} onChange={resetResult} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Certificate Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleTypeChange();
                            }}
                            defaultValue={field.value}
                            className="flex flex-row space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="project" />
                              </FormControl>
                              <FormLabel className="font-normal">Project Certificate</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="credit" />
                              </FormControl>
                              <FormLabel className="font-normal">Carbon Credit Certificate</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch('type') === 'project' ? 'Project ID' : 'Credit Serial Number'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={form.watch('type') === 'project' ? 'Enter project ID' : 'Enter credit serial number'} 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the ID exactly as it appears on the certificate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {showVerificationId && (
                    <FormField
                      control={form.control}
                      name="verificationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter verification ID" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Required for project certificates (check the QR code or certificate ID)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Certificate
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="qr">
              <div className="space-y-4">
                <div className="bg-neutral-50 p-8 rounded-md text-center">
                  <QrCode className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Scan Certificate QR Code</h3>
                  <p className="text-sm text-neutral-500 mb-4">
                    Use your camera to scan the QR code on the certificate
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                    <Scan className="mr-2 h-4 w-4" />
                    Scan QR Code
                  </Button>
                  <p className="text-xs text-neutral-400 mt-4">
                    Camera access is required for QR code scanning
                  </p>
                </div>
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">QR code scanner not available</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    The QR code scanner feature is currently in development. Please use the manual verification method instead.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
          
          {result && (
            <div className="mt-6">
              <Alert variant={result.verified ? "default" : "destructive"} className={result.verified ? "bg-green-50 border-green-200" : ""}>
                {result.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {result.verified ? "Certificate Verified" : "Verification Failed"}
                </AlertTitle>
                <AlertDescription>
                  {result.verified 
                    ? `This is an authentic ${result.type} certificate.` 
                    : "We could not verify this certificate. Please check the provided information."}
                </AlertDescription>
              </Alert>
              
              {result.verified && (
                <div className="mt-4 p-4 bg-white border rounded-md">
                  <h3 className="font-medium text-lg mb-2">Certificate Details</h3>
                  {result.type === 'project' && result.project && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-neutral-500">Project Name</Label>
                          <p className="font-medium">{result.project.name}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Project ID</Label>
                          <p className="font-medium">{result.project.projectId}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Developer</Label>
                          <p className="font-medium">{result.project.developer}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Location</Label>
                          <p className="font-medium">{result.project.location}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Status</Label>
                          <p className="font-medium">{result.project.status}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {result.type === 'credit' && result.credit && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-neutral-500">Serial Number</Label>
                          <p className="font-medium">{result.credit.serialNumber}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Project ID</Label>
                          <p className="font-medium">{result.credit.projectId}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Quantity</Label>
                          <p className="font-medium">{result.credit.quantity} tCO₂e</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Vintage</Label>
                          <p className="font-medium">{result.credit.vintage}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Status</Label>
                          <p className="font-medium">{result.credit.status}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-neutral-500">Current Owner</Label>
                          <p className="font-medium">{result.credit.owner}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}