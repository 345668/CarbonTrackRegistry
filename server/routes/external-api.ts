/**
 * External API routes for integration with other carbon markets
 * Provides standardized endpoints for interoperability
 */

import { Express, Request, Response } from 'express';
import { storage } from '../storage';
import { 
  apiSuccess, 
  apiError, 
  formatProjectData, 
  formatCreditData, 
  formatVerificationData,
  formatBlockchainRecord,
  formatAdjustmentData
} from '../utils/api';
import { z } from 'zod';

// API Key validation middleware
const validateApiKey = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-api-key'];
  
  // For demo purposes, we're using a simple check
  // In production, this should verify against stored API keys
  if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
    return apiError(res, 'Invalid or missing API key', 401);
  }
  
  next();
};

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).parse;

export function registerExternalApiRoutes(app: Express): void {
  const apiBaseRoute = '/api/v1/public';
  
  // Apply API key validation to all external API routes
  app.use(apiBaseRoute, validateApiKey);
  
  // API documentation route
  app.get(`${apiBaseRoute}/docs`, (req, res) => {
    const apiDocs = {
      name: 'Radical Zero Carbon Registry API',
      version: 'v1',
      description: 'Public API for integration with other carbon markets',
      baseUrl: apiBaseRoute,
      endpoints: [
        {
          path: '/projects',
          method: 'GET',
          description: 'List all projects with pagination',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 20, max: 100)',
            status: 'Filter by project status (optional)'
          }
        },
        {
          path: '/projects/:projectId',
          method: 'GET',
          description: 'Get details for a specific project by ID'
        },
        {
          path: '/credits',
          method: 'GET',
          description: 'List all carbon credits with pagination',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 20, max: 100)',
            status: 'Filter by credit status (optional)',
            projectId: 'Filter by project ID (optional)'
          }
        },
        {
          path: '/credits/:serialNumber',
          method: 'GET',
          description: 'Get details for a specific carbon credit by serial number'
        },
        {
          path: '/verifications',
          method: 'GET',
          description: 'List all verifications with pagination',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 20, max: 100)',
            status: 'Filter by verification status (optional)',
            projectId: 'Filter by project ID (optional)'
          }
        },
        {
          path: '/blockchain/records',
          method: 'GET',
          description: 'List all blockchain records with pagination',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 20, max: 100)',
            entityType: 'Filter by entity type (optional)',
            action: 'Filter by action (optional)'
          }
        },
        {
          path: '/adjustments',
          method: 'GET',
          description: 'List all corresponding adjustments with pagination',
          parameters: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 20, max: 100)',
            status: 'Filter by adjustment status (optional)',
            country: 'Filter by country (optional)'
          }
        },
        {
          path: '/verify/certificate/:hash',
          method: 'GET',
          description: 'Verify a certificate by its hash'
        }
      ]
    };
    
    apiSuccess(res, apiDocs);
  });
  
  // Project endpoints
  app.get(`${apiBaseRoute}/projects`, async (req, res) => {
    try {
      // Parse pagination parameters
      const { page, limit } = paginationSchema(req.query);
      const offset = (page - 1) * limit;
      
      // Get projects based on filters
      let projects;
      const { status } = req.query;
      
      if (status) {
        projects = await storage.listProjectsByStatus(status as string);
      } else {
        projects = await storage.listProjects();
      }
      
      // Apply pagination and format
      const paginatedProjects = projects
        .slice(offset, offset + limit)
        .map(formatProjectData);
      
      apiSuccess(res, {
        projects: paginatedProjects,
        pagination: {
          total: projects.length,
          page,
          limit,
          pages: Math.ceil(projects.length / limit)
        }
      });
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to fetch projects', 500);
    }
  });
  
  app.get(`${apiBaseRoute}/projects/:projectId`, async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await storage.getProjectByProjectId(projectId);
      
      if (!project) {
        return apiError(res, 'Project not found', 404);
      }
      
      apiSuccess(res, formatProjectData(project));
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to fetch project', 500);
    }
  });
  
  // Carbon credit endpoints
  app.get(`${apiBaseRoute}/credits`, async (req, res) => {
    try {
      // Parse pagination parameters
      const { page, limit } = paginationSchema(req.query);
      const offset = (page - 1) * limit;
      
      // Get credits based on filters
      let credits;
      const { status, projectId } = req.query;
      
      if (projectId) {
        credits = await storage.listCarbonCreditsByProjectId(projectId as string);
      } else if (status) {
        // Assuming we have a method to filter by status
        credits = await storage.listCarbonCredits();
        credits = credits.filter(credit => credit.status === status);
      } else {
        credits = await storage.listCarbonCredits();
      }
      
      // Apply pagination and format
      const paginatedCredits = credits
        .slice(offset, offset + limit)
        .map(formatCreditData);
      
      apiSuccess(res, {
        credits: paginatedCredits,
        pagination: {
          total: credits.length,
          page,
          limit,
          pages: Math.ceil(credits.length / limit)
        }
      });
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to fetch credits', 500);
    }
  });
  
  app.get(`${apiBaseRoute}/credits/:serialNumber`, async (req, res) => {
    try {
      const { serialNumber } = req.params;
      const credit = await storage.getCarbonCreditBySerialNumber(serialNumber);
      
      if (!credit) {
        return apiError(res, 'Carbon credit not found', 404);
      }
      
      apiSuccess(res, formatCreditData(credit));
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to fetch credit', 500);
    }
  });
  
  // Verification endpoints
  app.get(`${apiBaseRoute}/verifications`, async (req, res) => {
    try {
      // Parse pagination parameters
      const { page, limit } = paginationSchema(req.query);
      const offset = (page - 1) * limit;
      
      // Get verifications based on filters
      let verifications;
      const { status, projectId } = req.query;
      
      if (status) {
        verifications = await storage.listProjectVerificationsByStatus(status as string);
      } else if (projectId) {
        const verification = await storage.getProjectVerificationByProjectId(projectId as string);
        verifications = verification ? [verification] : [];
      } else {
        verifications = await storage.listProjectVerifications();
      }
      
      // Apply pagination and format
      const paginatedVerifications = verifications
        .slice(offset, offset + limit)
        .map(formatVerificationData);
      
      apiSuccess(res, {
        verifications: paginatedVerifications,
        pagination: {
          total: verifications.length,
          page,
          limit,
          pages: Math.ceil(verifications.length / limit)
        }
      });
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to fetch verifications', 500);
    }
  });
  
  // Blockchain record endpoints
  app.get(`${apiBaseRoute}/blockchain/records`, async (req, res) => {
    try {
      // Parse pagination parameters
      const { page, limit } = paginationSchema(req.query);
      const offset = (page - 1) * limit;
      
      // Get records based on filters
      let records = await storage.listBlockchainRecords();
      const { entityType, action } = req.query;
      
      // Apply filters
      if (entityType) {
        records = records.filter(record => record.entityType === entityType);
      }
      
      if (action) {
        records = records.filter(record => record.action === action);
      }
      
      // Apply pagination and format
      const paginatedRecords = records
        .slice(offset, offset + limit)
        .map(formatBlockchainRecord);
      
      apiSuccess(res, {
        records: paginatedRecords,
        pagination: {
          total: records.length,
          page,
          limit,
          pages: Math.ceil(records.length / limit)
        }
      });
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to fetch blockchain records', 500);
    }
  });
  
  // Corresponding adjustment endpoints
  app.get(`${apiBaseRoute}/adjustments`, async (req, res) => {
    try {
      // Parse pagination parameters
      const { page, limit } = paginationSchema(req.query);
      const offset = (page - 1) * limit;
      
      // Get adjustments based on filters
      let adjustments;
      const { status, country } = req.query;
      
      if (status) {
        adjustments = await storage.listCorrespondingAdjustmentsByStatus(status as string);
      } else if (country) {
        // Assuming we want to filter by either host or recipient country
        adjustments = await storage.listCorrespondingAdjustmentsByCountry(
          country as string,
          true // isHost
        );
        
        // Also get by recipient country and merge
        const recipientAdjustments = await storage.listCorrespondingAdjustmentsByCountry(
          country as string,
          false // not isHost
        );
        
        // Combine and deduplicate
        adjustments = [...adjustments, ...recipientAdjustments];
        adjustments = adjustments.filter((adj, index, self) => 
          index === self.findIndex(a => a.id === adj.id)
        );
      } else {
        adjustments = await storage.listCorrespondingAdjustments();
      }
      
      // Apply pagination and format
      const paginatedAdjustments = adjustments
        .slice(offset, offset + limit)
        .map(formatAdjustmentData);
      
      apiSuccess(res, {
        adjustments: paginatedAdjustments,
        pagination: {
          total: adjustments.length,
          page,
          limit,
          pages: Math.ceil(adjustments.length / limit)
        }
      });
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to fetch adjustments', 500);
    }
  });
  
  // Certificate verification endpoint
  app.get(`${apiBaseRoute}/verify/certificate/:hash`, async (req, res) => {
    try {
      const { hash } = req.params;
      
      // We'll assume there's a method to verify a certificate by hash
      // This is a placeholder for the actual implementation
      // Verification would check if the hash exists in the blockchain records
      const record = await storage.getBlockchainRecordByTxHash(hash);
      
      if (!record) {
        return apiError(res, 'Certificate not found or invalid', 404);
      }
      
      // You could add additional verification logic here
      
      apiSuccess(res, {
        verified: true,
        certificate: {
          txHash: record.txHash,
          entityType: record.entityType,
          entityId: record.entityId,
          action: record.action,
          timestamp: record.timestamp,
          blockNumber: record.blockNumber,
          network: record.network
        }
      });
    } catch (error) {
      apiError(res, error instanceof Error ? error.message : 'Failed to verify certificate', 500);
    }
  });
}