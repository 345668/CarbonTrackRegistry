import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  ArrowLeft, 
  Database, 
  Code, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  ShieldAlert 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import ApiKeyManagement from '@/components/api/ApiKeyManagement';

// Example API response structure
const apiResponseExample = {
  success: true,
  data: {
    projects: [
      {
        projectId: "PRJ-2023-0001",
        title: "Rainforest Conservation Project",
        description: "Conservation of 50,000 hectares of rainforest in the Amazon basin",
        developer: "Green Earth Initiative",
        location: {
          country: "Brazil",
          region: "Amazon",
          coordinates: "-3.4653,-62.2159"
        },
        category: "Forest Conservation",
        methodology: "VCS VM0015",
        status: "Verified",
        registryStatus: "Registered",
        estimatedReduction: 150000,
        sdgs: ["Climate Action", "Life on Land", "Partnerships for the Goals"]
      }
    ],
    pagination: {
      total: 1,
      page: 1,
      limit: 20,
      pages: 1
    }
  },
  timestamp: "2023-05-08T14:30:00Z",
  version: "v1"
};

// Code examples for different languages
const codeExamples = {
  curl: `curl -X GET "https://registry.radicalzero.com/api/v1/public/projects" \\
  -H "x-api-key: YOUR_API_KEY"`,
  
  javascript: `const fetchProjects = async () => {
  try {
    const response = await fetch('https://registry.radicalzero.com/api/v1/public/projects', {
      headers: {
        'x-api-key': 'YOUR_API_KEY'
      }
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
};

fetchProjects();`,
  
  python: `import requests

api_key = "YOUR_API_KEY"
url = "https://registry.radicalzero.com/api/v1/public/projects"

headers = {
    "x-api-key": api_key
}

response = requests.get(url, headers=headers)
data = response.json()
print(data)`
};

// Endpoint information
const endpoints = [
  {
    path: '/api/v1/public/projects',
    method: 'GET',
    description: 'List all projects with pagination and filtering options',
    parameters: {
      page: 'Page number (default: 1)',
      limit: 'Items per page (default: 20, max: 100)',
      status: 'Filter by project status (optional)'
    }
  },
  {
    path: '/api/v1/public/projects/:projectId',
    method: 'GET',
    description: 'Get details for a specific project by ID'
  },
  {
    path: '/api/v1/public/credits',
    method: 'GET',
    description: 'List all carbon credits with pagination and filtering options',
    parameters: {
      page: 'Page number (default: 1)',
      limit: 'Items per page (default: 20, max: 100)',
      status: 'Filter by credit status (optional)',
      projectId: 'Filter by project ID (optional)'
    }
  },
  {
    path: '/api/v1/public/credits/:serialNumber',
    method: 'GET',
    description: 'Get details for a specific carbon credit by serial number'
  },
  {
    path: '/api/v1/public/verifications',
    method: 'GET',
    description: 'List all verifications with pagination and filtering options',
    parameters: {
      page: 'Page number (default: 1)',
      limit: 'Items per page (default: 20, max: 100)',
      status: 'Filter by verification status (optional)',
      projectId: 'Filter by project ID (optional)'
    }
  },
  {
    path: '/api/v1/public/blockchain/records',
    method: 'GET',
    description: 'List all blockchain records with pagination and filtering options',
    parameters: {
      page: 'Page number (default: 1)',
      limit: 'Items per page (default: 20, max: 100)',
      entityType: 'Filter by entity type (optional)',
      action: 'Filter by action (optional)'
    }
  },
  {
    path: '/api/v1/public/adjustments',
    method: 'GET',
    description: 'List all corresponding adjustments with pagination and filtering options',
    parameters: {
      page: 'Page number (default: 1)',
      limit: 'Items per page (default: 20, max: 100)',
      status: 'Filter by adjustment status (optional)',
      country: 'Filter by country (optional)'
    }
  },
  {
    path: '/api/v1/public/verify/certificate/:hash',
    method: 'GET',
    description: 'Verify a certificate by its blockchain hash'
  }
];

export default function ApiDocsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [codeLanguage, setCodeLanguage] = useState('curl');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">API Documentation</h1>
          <p className="text-neutral-600 mt-1">
            Integration with other carbon markets and external systems
          </p>
        </div>
        <div>
          <a href="/">
            <Button variant="outline" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </a>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-1.5">
            <Database className="w-4 h-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-1.5">
            <Code className="w-4 h-4" />
            Code Examples
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Response Format
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Public API for External Systems</CardTitle>
              <CardDescription>
                Standardized endpoints for integration with other carbon markets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Introduction</h3>
                <p>
                  The Radical Zero Carbon Registry provides a comprehensive API that allows external systems 
                  to integrate with our platform. This enables interoperability between different carbon markets
                  and facilitates the exchange of data related to carbon offset projects, credits, verification processes,
                  and Paris Agreement compliance.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Authentication</h3>
                <p>
                  All API requests require an API key which should be included in the request headers:
                </p>
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
                  <code>x-api-key: YOUR_API_KEY</code>
                </div>
                <p>
                  To obtain an API key, please contact our support team or use the admin panel if you have administrator access.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Base URL</h3>
                <p>
                  All API endpoints are available at the following base URL:
                </p>
                <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto flex justify-between items-center">
                  <code>https://registry.radicalzero.com/api/v1/public</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard('https://registry.radicalzero.com/api/v1/public')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Standard Data Formats</h3>
                <p>
                  The API follows standardized data formats for interoperability:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>All responses are in JSON format</li>
                  <li>Dates are in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)</li>
                  <li>Carbon credit quantities are always whole numbers</li>
                  <li>Pagination is consistent across all list endpoints</li>
                  <li>Blockchain transaction hashes follow standard hexadecimal format</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Rate Limiting</h3>
                <p>
                  API requests are limited to 100 requests per minute per API key. If you exceed this limit,
                  you will receive a 429 Too Many Requests response. The response header includes rate limit information:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><code>X-RateLimit-Limit</code>: Maximum number of requests allowed per minute</li>
                  <li><code>X-RateLimit-Remaining</code>: Number of requests remaining in the current period</li>
                  <li><code>X-RateLimit-Reset</code>: Time when the rate limit resets (Unix timestamp)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="endpoints">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available endpoints for accessing registry data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="space-y-4 pb-6 border-b border-neutral-200 dark:border-neutral-800 last:border-none">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-primary flex items-center gap-2">
                          <span className="inline-block bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded">
                            {endpoint.method}
                          </span>
                          <code className="font-mono text-sm">{endpoint.path}</code>
                        </h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(`https://registry.radicalzero.com${endpoint.path}`)}
                        className="h-8"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy URL
                      </Button>
                    </div>
                    <p className="text-neutral-600">{endpoint.description}</p>
                    
                    {endpoint.parameters && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Query Parameters:</h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                            <thead className="bg-neutral-100 dark:bg-neutral-900">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Parameter</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                              {Object.entries(endpoint.parameters).map(([param, desc], idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">{param}</td>
                                  <td className="px-4 py-2 text-sm">{desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Examples of how to use the API in different programming languages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="inline-flex items-center rounded-md border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-6">
                  <button
                    onClick={() => setCodeLanguage('curl')}
                    className={`px-4 py-2 text-sm font-medium ${
                      codeLanguage === 'curl' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setCodeLanguage('javascript')}
                    className={`px-4 py-2 text-sm font-medium ${
                      codeLanguage === 'javascript' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setCodeLanguage('python')}
                    className={`px-4 py-2 text-sm font-medium ${
                      codeLanguage === 'python' 
                        ? 'bg-primary text-white' 
                        : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Python
                  </button>
                </div>
                
                <div className="relative">
                  <pre className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    {codeExamples[codeLanguage as keyof typeof codeExamples]}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(codeExamples[codeLanguage as keyof typeof codeExamples])}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-primary">Additional Examples</h3>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Filtering Projects by Status</h4>
                  <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <code>GET /api/v1/public/projects?status=verified</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Pagination Example</h4>
                  <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <code>GET /api/v1/public/credits?page=2&limit=10</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Retrieving a Specific Project</h4>
                  <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <code>GET /api/v1/public/projects/PRJ-2023-0001</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Verifying a Certificate</h4>
                  <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    <code>GET /api/v1/public/verify/certificate/0x2d9bf5b54cc8b4d9c5a13cab127a35c7b9c2d9a8b5e6f7g8h9i0j1k2l3m4n5o6</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Response Format</CardTitle>
              <CardDescription>
                Standard response structure for all API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Success Response Format</h3>
                <div className="relative">
                  <pre className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
                    {JSON.stringify(apiResponseExample, null, 2)}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(JSON.stringify(apiResponseExample, null, 2))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Response Fields</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                      <thead className="bg-neutral-100 dark:bg-neutral-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Field</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">success</td>
                          <td className="px-4 py-2 text-sm">Boolean indicating if the request was successful</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">data</td>
                          <td className="px-4 py-2 text-sm">The response data. For list endpoints, includes pagination information</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">timestamp</td>
                          <td className="px-4 py-2 text-sm">ISO 8601 timestamp of when the response was generated</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">version</td>
                          <td className="px-4 py-2 text-sm">API version</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Error Response Format</h3>
                <div className="relative">
                  <pre className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm overflow-x-auto">
{`{
  "success": false,
  "error": "Project not found",
  "timestamp": "2023-05-08T14:35:00Z",
  "version": "v1"
}`}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(`{
  "success": false,
  "error": "Project not found",
  "timestamp": "2023-05-08T14:35:00Z",
  "version": "v1"
}`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Common Error Codes</h4>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                      <thead className="bg-neutral-100 dark:bg-neutral-900">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">HTTP Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">400 Bad Request</td>
                          <td className="px-4 py-2 text-sm">Invalid request parameters</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">401 Unauthorized</td>
                          <td className="px-4 py-2 text-sm">Invalid or missing API key</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">404 Not Found</td>
                          <td className="px-4 py-2 text-sm">Resource not found</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">429 Too Many Requests</td>
                          <td className="px-4 py-2 text-sm">Rate limit exceeded</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">500 Internal Server Error</td>
                          <td className="px-4 py-2 text-sm">Server error, please try again later</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                <CheckCircle2 className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Need help integrating with our API? Contact our developer support at 
                  <a href="mailto:api-support@radicalzero.com" className="font-medium underline ml-1">
                    api-support@radicalzero.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}