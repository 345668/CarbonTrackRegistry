import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, Key, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import RequestApiAccessModal from './RequestApiAccessModal';

export default function ApiKeyManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDeveloper = user?.role === 'developer';
  const hasAccess = isAdmin || isDeveloper;
  
  // Simulated API key
  const [apiKey, setApiKey] = useState(hasAccess ? 'api_key_32c8e7b1a4f9d6e2' : '');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: 'API key copied',
      description: 'The API key has been copied to your clipboard.',
    });
  };
  
  const regenerateApiKey = () => {
    setIsGenerating(true);
    
    // Simulate API request to generate new key
    setTimeout(() => {
      const newKey = 'api_key_' + Math.random().toString(36).substring(2, 15);
      setApiKey(newKey);
      setIsGenerating(false);
      
      toast({
        title: 'API key regenerated',
        description: 'Your new API key has been generated. Make sure to update your applications.',
      });
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Management
        </CardTitle>
        <CardDescription>
          {hasAccess 
            ? 'Your API key is required for all requests to the public API endpoints.' 
            : 'Request access to the API to get your API key.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasAccess ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Your API Key</div>
              <div className="flex">
                <Input
                  value={apiKey}
                  readOnly
                  type="password"
                  className="font-mono rounded-r-none"
                />
                <Button
                  variant="outline"
                  className="rounded-l-none"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Keep this key confidential. Include it in the 'x-api-key' header in your API requests.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Security Notes</div>
              <ul className="text-sm text-neutral-600 space-y-1 list-disc pl-4">
                <li>Never expose your API key in client-side code</li>
                <li>Store your API key in secure environment variables</li>
                <li>Regenerate your key if you suspect it has been compromised</li>
                <li>Rate limits are applied per API key</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-amber-50 border border-amber-100 rounded-md">
              <Shield className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                You need additional permissions to access the API. Please request access using the button below.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">API Access Benefits</div>
              <ul className="text-sm text-neutral-600 space-y-1 list-disc pl-4">
                <li>Integrate carbon credit data with your own systems</li>
                <li>Access project information programmatically</li>
                <li>Build custom reporting and analytics</li>
                <li>Automate verification workflows</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {hasAccess ? (
          <>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={regenerateApiKey}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Key
                </>
              )}
            </Button>
            
            <Button 
              className="w-full sm:w-auto"
              variant="default"
              onClick={() => window.open('/api/v1/public/docs', '_blank')}
            >
              View API Reference
            </Button>
          </>
        ) : (
          <RequestApiAccessModal />
        )}
      </CardFooter>
    </Card>
  );
}