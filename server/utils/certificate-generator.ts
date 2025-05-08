import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Readable } from 'stream';
import { Project, CarbonCredit } from '@shared/schema';
import { Response } from 'express';

// Define certificate types
type CertificateType = 'project' | 'credit';

// Certificate data interfaces
export interface ProjectCertificateData {
  project: Project;
  verificationId?: string;
  issuedOn: Date;
}

export interface CreditCertificateData {
  credit: CarbonCredit;
  projectName: string;
  issuedOn: Date;
}

export type CertificateData = ProjectCertificateData | CreditCertificateData;

/**
 * Generates a verification URL for QR code
 * @param type Certificate type
 * @param id ID of the project or credit
 * @param verificationId Optional verification ID for projects
 */
function getVerificationUrl(
  type: CertificateType,
  id: string,
  verificationId?: string
): string {
  // Base URL from environment or default to localhost in development
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  // Construct query parameters
  const params = new URLSearchParams();
  params.append('type', type);
  params.append('id', id);
  
  if (type === 'project' && verificationId) {
    params.append('verificationId', verificationId);
  }
  
  return `${baseUrl}/verify-certificate?${params.toString()}`;
}

/**
 * Generates a QR code as data URL
 * @param url URL to encode in QR code
 */
async function generateQRCode(url: string): Promise<string> {
  try {
    // Generate QR code as data URL
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000', // Black dots
        light: '#ffffff', // White background
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Format a date as DD/MM/YYYY
 * @param date Date to format
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Generate a certificate for a project or carbon credit
 * @param type Certificate type (project or credit)
 * @param data Certificate data
 * @param res Express response to pipe PDF to
 */
export async function generateCertificate(
  type: CertificateType,
  data: CertificateData,
  res: Response
): Promise<void> {
  try {
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `${type === 'project' ? 'Project' : 'Carbon Credit'} Certificate`,
        Author: 'Radical Zero Carbon Registry',
        Subject: `Certificate of ${type === 'project' ? 'Registration' : 'Issuance'}`,
        Keywords: 'carbon, climate, certificate, offset',
        CreationDate: new Date(),
      },
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${type}-certificate-${
        type === 'project'
          ? (data as ProjectCertificateData).project.projectId
          : (data as CreditCertificateData).credit.serialNumber
      }.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Create common styles
    const titleFont = 'Helvetica-Bold';
    const bodyFont = 'Helvetica';
    const titleSize = 24;
    const subtitleSize = 18;
    const headingSize = 14;
    const bodySize = 12;
    const smallSize = 10;
    const lineGap = 12;
    
    // Add a decorative border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(1)
      .strokeColor('#5b67f8')
      .stroke();
    
    // Add Radical Zero logo
    // Note: In a real implementation, you would load the logo from a file
    // For now, we'll create a simple text representation
    doc.fontSize(28)
      .font(titleFont)
      .fillColor('#5b67f8')
      .text('RADICAL ZERO', { align: 'center' });
      
    doc.fontSize(16)
      .font(bodyFont)
      .fillColor('#444')
      .text('CARBON REGISTRY', { align: 'center' });
    
    // Add certificate title
    doc.moveDown(2);
    doc.fontSize(titleSize)
      .font(titleFont)
      .fillColor('#000')
      .text('CERTIFICATE', { align: 'center' });
      
    doc.moveDown(0.5);
    doc.fontSize(subtitleSize)
      .font(bodyFont)
      .fillColor('#444')
      .text(
        type === 'project'
          ? 'Project Registration'
          : 'Carbon Credit Issuance',
        { align: 'center' }
      );
    
    doc.moveDown(1.5);
    
    // Certificate content varies by type
    if (type === 'project') {
      const { project, verificationId, issuedOn } = data as ProjectCertificateData;
      
      // Project details
      doc.fontSize(headingSize)
        .font(titleFont)
        .fillColor('#000')
        .text('PROJECT DETAILS', { align: 'left' });
      
      doc.moveDown(0.5);
      doc.fontSize(bodySize)
        .font(bodyFont)
        .fillColor('#333');
        
      const details = [
        { label: 'Project Name:', value: project.name },
        { label: 'Project ID:', value: project.projectId },
        { label: 'Developer:', value: project.developer },
        { label: 'Location:', value: project.location },
        { label: 'Category:', value: project.category },
        { label: 'Methodology:', value: project.methodology },
        { label: 'Registration Date:', value: formatDate(issuedOn) },
      ];
      
      details.forEach(({ label, value }) => {
        doc.text(`${label} ${value}`, { continued: false, lineGap });
      });
      
      // Add verification details if available
      if (verificationId) {
        doc.moveDown(1);
        doc.fontSize(headingSize)
          .font(titleFont)
          .fillColor('#000')
          .text('VERIFICATION DETAILS', { align: 'left' });
        
        doc.moveDown(0.5);
        doc.fontSize(bodySize)
          .font(bodyFont)
          .fillColor('#333')
          .text(`Verification ID: ${verificationId}`, { lineGap });
      }
      
    } else {
      const { credit, projectName, issuedOn } = data as CreditCertificateData;
      
      // Credit details
      doc.fontSize(headingSize)
        .font(titleFont)
        .fillColor('#000')
        .text('CARBON CREDIT DETAILS', { align: 'left' });
      
      doc.moveDown(0.5);
      doc.fontSize(bodySize)
        .font(bodyFont)
        .fillColor('#333');
        
      const details = [
        { label: 'Serial Number:', value: credit.serialNumber },
        { label: 'Project:', value: projectName },
        { label: 'Project ID:', value: credit.projectId },
        { label: 'Quantity:', value: `${credit.quantity} tCO₂e` },
        { label: 'Vintage Year:', value: credit.vintage },
        { label: 'Issuance Date:', value: formatDate(issuedOn) },
        { label: 'Status:', value: credit.status },
        { label: 'Current Owner:', value: credit.owner },
      ];
      
      details.forEach(({ label, value }) => {
        doc.text(`${label} ${value}`, { continued: false, lineGap });
      });
    }
    
    // Add Paris Agreement compliance statement if applicable
    // This would typically be conditional based on credit properties
    if (type === 'credit') {
      const { credit } = data as CreditCertificateData;
      
      if (credit.correspondingAdjustmentStatus === 'completed') {
        doc.moveDown(1);
        doc.fontSize(headingSize)
          .font(titleFont)
          .fillColor('#000')
          .text('PARIS AGREEMENT COMPLIANCE', { align: 'left' });
        
        doc.moveDown(0.5);
        doc.fontSize(bodySize)
          .font(bodyFont)
          .fillColor('#333')
          .text('This carbon credit is compliant with Paris Agreement Article 6 requirements. A corresponding adjustment has been applied in the host country NDC accounting.', { lineGap });
      }
    }
    
    // Generate QR code
    const verificationUrl = getVerificationUrl(
      type,
      type === 'project'
        ? (data as ProjectCertificateData).project.projectId
        : (data as CreditCertificateData).credit.serialNumber,
      type === 'project' ? (data as ProjectCertificateData).verificationId : undefined
    );
    
    const qrCodeDataUrl = await generateQRCode(verificationUrl);
    
    // Add verification section and QR code
    doc.moveDown(2);
    doc.fontSize(headingSize)
      .font(titleFont)
      .fillColor('#000')
      .text('CERTIFICATE VERIFICATION', { align: 'left' });
    
    doc.moveDown(0.5);
    doc.fontSize(bodySize)
      .font(bodyFont)
      .fillColor('#333')
      .text(
        'Scan the QR code or visit the URL below to verify the authenticity of this certificate:',
        { lineGap }
      );
    
    doc.fontSize(smallSize)
      .fillColor('#5b67f8')
      .text(verificationUrl, { lineGap: 5, underline: true });
    
    // Add QR code
    doc.image(qrCodeDataUrl, {
      fit: [150, 150],
      align: 'center',
      valign: 'center',
    });
    
    // Add footer
    const footerY = doc.page.height - 50;
    doc.fontSize(smallSize)
      .fillColor('#666')
      .text(
        'This certificate is issued by Radical Zero Carbon Registry.',
        50,
        footerY,
        { align: 'center' }
      );
    doc.text(
      `Certificate issued on ${formatDate(new Date())}`,
      50,
      footerY + 15,
      { align: 'center' }
    );
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).send('Failed to generate certificate');
  }
}

/**
 * Convert a PDF document to a buffer for storage or processing
 * @param doc PDFKit document
 */
export async function pdfToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    // Create a pass-through stream
    const stream = new (require('stream').PassThrough)();
    
    doc.pipe(stream);
    
    stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err: Error) => reject(err));
    
    doc.end();
  });
}