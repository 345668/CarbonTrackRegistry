import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Project, CarbonCredit } from '@shared/schema';
import { Readable } from 'stream';

/**
 * Generate a project verification certificate
 */
export async function generateProjectCertificate(
  project: Project, 
  verificationId: number
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Project Verification Certificate - ${project.projectId}`,
      Author: 'Radical Zero GmbH Carbon Registry',
      Subject: 'Carbon Project Verification Certificate',
      Keywords: 'carbon, project, verification, certificate',
    },
  });

  // Collect the PDF data chunks
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Create a promise to wait for the PDF to finish building
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  // Set up base font styles
  doc.font('Helvetica');
  
  // Generate verification URL and QR code
  const verificationUrl = `${process.env.APP_URL || 'https://registry.radicalzero.io'}/verify-certificate?type=project&id=${project.projectId}&verificationId=${verificationId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 150
  });

  // Add certificate header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#1a365d')
     .text('PROJECT VERIFICATION CERTIFICATE', { align: 'center' });
  
  // Add logo (using a placeholder here - you would need to add your actual logo file)
  // doc.image('path/to/logo.png', doc.page.width / 2 - 100, 100, { width: 200 });
  
  // Add certificate border
  doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
     .strokeColor('#3b82f6')
     .lineWidth(3)
     .stroke();
  
  // Add QR code
  doc.image(qrCodeDataUrl, doc.page.width - 180, 100, { width: 120 });
  
  // Add certificate details
  doc.moveDown(5)
     .fontSize(12)
     .font('Helvetica')
     .fillColor('#000000')
     .text('This is to certify that the carbon offset project:', { align: 'center' })
     .moveDown(1);
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#1a365d')
     .text(project.name, { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(14)
     .font('Helvetica')
     .fillColor('#000000')
     .text(`Project ID: ${project.projectId}`, { align: 'center' })
     .moveDown(2);
  
  doc.fontSize(12)
     .text('Has successfully completed the verification process and meets the requirements of:', { align: 'center' })
     .moveDown(1);
  
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Radical Zero GmbH Carbon Registry Standards', { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(12)
     .font('Helvetica')
     .text(`Methodology: ${project.methodology || 'N/A'}`, { align: 'center' })
     .moveDown(0.5)
     .text(`Category: ${project.category || 'N/A'}`, { align: 'center' })
     .moveDown(0.5)
     .text(`Location: ${project.location || 'N/A'}`, { align: 'center' })
     .moveDown(2);
  
  // Add certification details
  doc.fontSize(12)
     .text(`Verification Date: ${new Date().toLocaleDateString()}`, { align: 'center' })
     .moveDown(0.5)
     .text(`Certificate ID: VER-${project.projectId}-${verificationId}`, { align: 'center' })
     .moveDown(0.5)
     .text(`Verification Period: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} to ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}`, { align: 'center' })
     .moveDown(2);
  
  // Add signature line
  doc.moveTo(150, doc.y + 50)
     .lineTo(doc.page.width - 150, doc.y + 50)
     .stroke();
  
  doc.moveDown(0.5)
     .text('Authorized Signature', { align: 'center' })
     .moveDown(1);
  
  // Add verification note
  doc.fontSize(10)
     .fillColor('#64748b')
     .text('Verify this certificate by scanning the QR code or visiting:', { align: 'center' })
     .moveDown(0.5)
     .text(verificationUrl, { align: 'center', link: verificationUrl, underline: true })
     .moveDown(2);
  
  // Add footer
  doc.fontSize(8)
     .fillColor('#94a3b8')
     .text('This certificate is electronically generated and does not require a physical signature.', { align: 'center' })
     .moveDown(0.5)
     .text('© ' + new Date().getFullYear() + ' Radical Zero GmbH. All rights reserved.', { align: 'center' });
  
  // Finalize the PDF
  doc.end();

  // Wait for the PDF to finish building and return the buffer
  return pdfPromise;
}

/**
 * Generate a carbon credit certificate
 */
export async function generateCreditCertificate(credit: CarbonCredit): Promise<Buffer> {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Carbon Credit Certificate - ${credit.serialNumber}`,
      Author: 'Radical Zero GmbH Carbon Registry',
      Subject: 'Carbon Credit Certificate',
      Keywords: 'carbon, credit, certificate',
    },
  });

  // Collect the PDF data chunks
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Create a promise to wait for the PDF to finish building
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });

  // Set up base font styles
  doc.font('Helvetica');
  
  // Generate verification URL and QR code
  const verificationUrl = `${process.env.APP_URL || 'https://registry.radicalzero.io'}/verify-certificate?type=credit&id=${credit.serialNumber}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 150
  });

  // Add certificate header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#1a365d')
     .text('CARBON CREDIT CERTIFICATE', { align: 'center' });
  
  // Add certificate border
  doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
     .strokeColor('#10b981')
     .lineWidth(3)
     .stroke();
  
  // Add QR code
  doc.image(qrCodeDataUrl, doc.page.width - 180, 100, { width: 120 });
  
  // Add certificate details
  doc.moveDown(5)
     .fontSize(12)
     .font('Helvetica')
     .fillColor('#000000')
     .text('This certificate represents:', { align: 'center' })
     .moveDown(1);
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#065f46')
     .text(`${credit.quantity} Metric Tonnes CO₂e`, { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(14)
     .font('Helvetica')
     .fillColor('#000000')
     .text(`Serial Number: ${credit.serialNumber}`, { align: 'center' })
     .moveDown(0.5)
     .text(`Project ID: ${credit.projectId}`, { align: 'center' })
     .moveDown(2);
  
  // Add credit details table
  const startY = doc.y;
  const textOptions = { width: 250 };
  
  // Left Column
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Credit Details', doc.x, startY, textOptions);
  
  doc.moveDown(0.5)
     .font('Helvetica-Bold')
     .text('Vintage:', textOptions)
     .moveUp()
     .font('Helvetica')
     .text(credit.vintage || 'N/A', doc.x + 100, doc.y, textOptions);
  
  doc.moveDown(0.5)
     .font('Helvetica-Bold')
     .text('Status:', textOptions)
     .moveUp()
     .font('Helvetica')
     .text(credit.status || 'N/A', doc.x + 100, doc.y, textOptions);
  
  doc.moveDown(0.5)
     .font('Helvetica-Bold')
     .text('Issuance Date:', textOptions)
     .moveUp()
     .font('Helvetica')
     .text(credit.issuanceDate ? new Date(credit.issuanceDate).toLocaleDateString() : 'N/A', doc.x + 100, doc.y, textOptions);
  
  // Right Column
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Current Owner:', doc.x + 250, startY, textOptions)
     .moveDown(0.5)
     .font('Helvetica')
     .text(credit.owner || 'N/A', textOptions);
  
  // Add Paris Agreement information if applicable
  doc.moveDown(2)
     .font('Helvetica-Bold')
     .text('Paris Agreement Compliance', { align: 'left' })
     .moveDown(0.5);
  
  if (credit.parisAgreementEligible) {
    doc.font('Helvetica')
       .text('This credit is eligible for use under Paris Agreement Article 6 mechanisms.', textOptions)
       .moveDown(0.5);
    
    if (credit.hostCountry) {
      doc.text(`Host Country: ${credit.hostCountry}`, textOptions)
         .moveDown(0.5);
    }
    
    if (credit.correspondingAdjustmentStatus) {
      doc.text(`Corresponding Adjustment Status: ${credit.correspondingAdjustmentStatus}`, textOptions)
         .moveDown(0.5);
    }
    
    if (credit.mitigationOutcome) {
      doc.text(`Mitigation Outcome: ${credit.mitigationOutcome}`, textOptions)
         .moveDown(0.5);
    }
  } else {
    doc.font('Helvetica')
       .text('This credit is not eligible for use under Paris Agreement Article 6 mechanisms.', textOptions)
       .moveDown(0.5);
  }
  
  // Add credit information
  if (credit.status === 'retired') {
    doc.moveDown(1)
       .font('Helvetica-Bold')
       .fillColor('#b91c1c')
       .text('RETIRED', { align: 'center' })
       .font('Helvetica')
       .fillColor('#000000')
       .moveDown(0.5)
       .text(`Retirement Date: ${credit.retirementDate ? new Date(credit.retirementDate).toLocaleDateString() : 'N/A'}`, { align: 'center' })
       .moveDown(0.5);
    
    if (credit.retirementPurpose) {
      doc.text(`Purpose: ${credit.retirementPurpose}`, { align: 'center' })
         .moveDown(0.5);
    }
    
    if (credit.retirementBeneficiary) {
      doc.text(`Beneficiary: ${credit.retirementBeneficiary}`, { align: 'center' })
         .moveDown(0.5);
    }
  } else if (credit.status === 'transferred') {
    doc.moveDown(1)
       .font('Helvetica-Bold')
       .fillColor('#1d4ed8')
       .text('TRANSFERRED', { align: 'center' })
       .font('Helvetica')
       .fillColor('#000000')
       .moveDown(0.5)
       .text(`Transfer Date: ${credit.transferDate ? new Date(credit.transferDate).toLocaleDateString() : 'N/A'}`, { align: 'center' })
       .moveDown(0.5);
    
    if (credit.transferRecipient) {
      doc.text(`Recipient: ${credit.transferRecipient}`, { align: 'center' })
         .moveDown(0.5);
    }
  }
  
  // Add signature line
  doc.moveDown(2)
     .moveTo(150, doc.y + 50)
     .lineTo(doc.page.width - 150, doc.y + 50)
     .stroke();
  
  doc.moveDown(0.5)
     .text('Authorized Signature', { align: 'center' })
     .moveDown(1);
  
  // Add verification note
  doc.fontSize(10)
     .fillColor('#64748b')
     .text('Verify this certificate by scanning the QR code or visiting:', { align: 'center' })
     .moveDown(0.5)
     .text(verificationUrl, { align: 'center', link: verificationUrl, underline: true })
     .moveDown(1);
  
  // Add footer
  doc.fontSize(8)
     .fillColor('#94a3b8')
     .text('This certificate is electronically generated and does not require a physical signature.', { align: 'center' })
     .moveDown(0.5)
     .text('© ' + new Date().getFullYear() + ' Radical Zero GmbH. All rights reserved.', { align: 'center' });
  
  // Finalize the PDF
  doc.end();

  // Wait for the PDF to finish building and return the buffer
  return pdfPromise;
}

/**
 * Create a readable stream from a buffer
 */
export function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}