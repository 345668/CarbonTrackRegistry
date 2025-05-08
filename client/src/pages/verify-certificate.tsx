import React from 'react';
import { CertificateVerificationForm } from '@/components/certificates/CertificateVerificationForm';
import { Shield } from 'lucide-react';

export default function VerifyCertificatePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Certificate Verification</h1>
          <p className="text-lg text-neutral-600 mt-2 max-w-2xl mx-auto">
            Verify the authenticity of carbon project and credit certificates issued by the Radical Zero Registry
          </p>
        </div>
        
        <CertificateVerificationForm />
        
        <div className="mt-12 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">About Certificate Verification</h2>
          <div className="space-y-4">
            <p className="text-neutral-700">
              All certificates issued by Radical Zero GmbH Carbon Registry contain a secure QR code and unique identifier that allows anyone to verify their authenticity. 
              Certificates can be verified by:
            </p>
            <ul className="list-disc pl-8 space-y-2 text-neutral-700">
              <li>Scanning the QR code on the certificate</li>
              <li>Entering the certificate's unique identifier on this page</li>
              <li>Following the verification URL printed on the certificate</li>
            </ul>
            <p className="text-neutral-700">
              Verified certificates confirm that the associated carbon projects or credits are officially registered in the Radical Zero Carbon Registry and have undergone the required verification procedures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}