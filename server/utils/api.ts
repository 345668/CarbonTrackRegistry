/**
 * API utilities for standardized responses and data formats
 * Used for the public API for external systems
 */

import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | Record<string, any>;
  timestamp: string;
  version: string;
}

// API version
export const API_VERSION = 'v1';

/**
 * Create a standardized API success response
 */
export function apiSuccess<T>(res: Response, data: T, status: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    version: API_VERSION
  };
  
  res.status(status).json(response);
}

/**
 * Create a standardized API error response
 */
export function apiError(
  res: Response, 
  error: string | Record<string, any>, 
  status: number = 400
): void {
  const response: ApiResponse<null> = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    version: API_VERSION
  };
  
  res.status(status).json(response);
}

/**
 * Standard data transformations for API responses
 */

// Format project data for public API
export function formatProjectData(project: any) {
  return {
    projectId: project.projectId,
    title: project.title,
    description: project.description,
    developer: project.developer,
    location: {
      country: project.country,
      region: project.region,
      coordinates: project.coordinates
    },
    category: project.category,
    methodology: project.methodology,
    status: project.status,
    registryStatus: project.registryStatus,
    startDate: project.startDate,
    endDate: project.endDate,
    verificationStatus: project.verificationStatus,
    estimatedReduction: project.estimatedReduction,
    sdgs: project.sdgs,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

// Format carbon credit data for public API
export function formatCreditData(credit: any) {
  return {
    serialNumber: credit.serialNumber,
    projectId: credit.projectId,
    vintage: credit.vintage,
    quantity: credit.quantity,
    status: credit.status,
    issuanceDate: credit.issuanceDate,
    owner: credit.owner,
    parisAgreementEligible: credit.parisAgreementEligible,
    correspondingAdjustmentStatus: credit.correspondingAdjustmentStatus,
    createdAt: credit.createdAt,
    updatedAt: credit.updatedAt
  };
}

// Format verification data for public API
export function formatVerificationData(verification: any) {
  return {
    id: verification.id,
    projectId: verification.projectId,
    status: verification.status,
    verifier: verification.verifier,
    startDate: verification.startDate,
    completionDate: verification.completionDate,
    currentStage: verification.currentStage,
    createdAt: verification.createdAt,
    updatedAt: verification.updatedAt
  };
}

// Format blockchain record for public API
export function formatBlockchainRecord(record: any) {
  return {
    txHash: record.txHash,
    entityType: record.entityType,
    entityId: record.entityId,
    action: record.action,
    blockNumber: record.blockNumber,
    network: record.network,
    timestamp: record.timestamp
  };
}

// Format corresponding adjustment for public API
export function formatAdjustmentData(adjustment: any) {
  return {
    id: adjustment.id,
    creditSerialNumber: adjustment.creditSerialNumber,
    hostCountry: adjustment.hostCountry,
    recipientCountry: adjustment.recipientCountry,
    adjustmentType: adjustment.adjustmentType,
    adjustmentQuantity: adjustment.adjustmentQuantity,
    adjustmentStatus: adjustment.adjustmentStatus,
    adjustmentDate: adjustment.adjustmentDate,
    ndcTarget: adjustment.ndcTarget,
    mitigationOutcomeType: adjustment.mitigationOutcomeType,
    createdAt: adjustment.createdAt
  };
}