import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function RequestApiAccessModal() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [useCase, setUseCase] = useState('');
  const [integrationType, setIntegrationType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName || !contactEmail || !useCase || !integrationType) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      
      // Reset form
      setOrganizationName('');
      setContactEmail('');
      setUseCase('');
      setIntegrationType('');
      
      toast({
        title: 'Request submitted',
        description: 'Your API access request has been submitted. An administrator will review your request and contact you shortly.',
      });
    }, 1500);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          Request API Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request API Access</DialogTitle>
          <DialogDescription>
            Fill out this form to request access to the Carbon Registry API for your organization.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name *</Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Your company or organization name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="your-email@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="integrationType">Integration Type *</Label>
            <Select 
              value={integrationType} 
              onValueChange={setIntegrationType}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carbon-market">Carbon Market Integration</SelectItem>
                <SelectItem value="reporting">Reporting & Analytics</SelectItem>
                <SelectItem value="verification">Verification Provider</SelectItem>
                <SelectItem value="developer">Developer / Partner</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="useCase">Use Case Description *</Label>
            <Textarea
              id="useCase"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="Please describe how you plan to use the API and what functionality you need."
              rows={4}
              required
            />
          </div>
          
          <div className="text-xs text-neutral-500">
            * Required fields
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}