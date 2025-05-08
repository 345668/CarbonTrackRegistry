import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Download, QrCode, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateDownloadButtonProps {
  type: 'project' | 'credit';
  id: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  label?: string;
}

/**
 * Button component for downloading certificates
 */
export function CertificateDownloadButton({
  type,
  id,
  variant = 'outline',
  size = 'sm',
  className = '',
  label
}: CertificateDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  /**
   * Generate URL for certificate download
   */
  const getCertificateUrl = () => {
    if (type === 'project') {
      return `/api/projects/${id}/certificate`;
    } else {
      return `/api/credits/${id}/certificate`;
    }
  };

  /**
   * Handle certificate download
   */
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const url = getCertificateUrl();
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-certificate-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Certificate downloaded',
        description: `Your ${type} certificate has been successfully downloaded.`,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: `Failed to download certificate. Please try again.`,
        variant: 'destructive',
      });
      console.error('Error downloading certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Award className="h-4 w-4 mr-2" />
      )}
      {label || 'Download Certificate'}
    </Button>
  );
}