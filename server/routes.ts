import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateProjectCertificate, generateCreditCertificate } from "./utils/certificate-generator";
import { 
  insertUserSchema,
  insertProjectCategorySchema,
  insertMethodologySchema,
  insertProjectSchema,
  insertVerificationStageSchema,
  insertProjectVerificationSchema,
  insertVerificationDocumentSchema,
  insertVerificationCommentSchema,
  insertCarbonCreditSchema,
  insertActivityLogSchema,
  insertStatisticsSchema,
  insertCorrespondingAdjustmentSchema,
  type InsertCarbonCredit
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up authentication routes and middleware
  setupAuth(app);

  // Users API
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Project Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.listProjectCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertProjectCategorySchema.parse(req.body);
      const category = await storage.createProjectCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Methodologies API
  app.get("/api/methodologies", async (req, res) => {
    try {
      const methodologies = await storage.listMethodologies();
      res.json(methodologies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch methodologies" });
    }
  });

  app.post("/api/methodologies", async (req, res) => {
    try {
      const methodologyData = insertMethodologySchema.parse(req.body);
      const methodology = await storage.createMethodology(methodologyData);
      res.status(201).json(methodology);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create methodology" });
    }
  });

  // Projects API
  app.get("/api/projects", async (req, res) => {
    try {
      const { status, developer } = req.query;
      
      let projects;
      if (status) {
        projects = await storage.listProjectsByStatus(status as string);
      } else if (developer) {
        projects = await storage.listProjectsByDeveloper(developer as string);
      } else {
        projects = await storage.listProjects();
      }
      
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProjectByProjectId(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "project_created",
        description: `Project ${projectData.name} created`,
        entityType: "project",
        entityId: project.projectId,
        userId: 1 // Assuming admin user
      });
      
      // Update statistics
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({
          totalProjects: stats.totalProjects + 1
        });
      }
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const projectId = req.params.id;
      const project = await storage.getProjectByProjectId(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const updateData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(project.id, updateData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "project_updated",
        description: `Project ${project.name} updated`,
        entityType: "project",
        entityId: projectId,
        userId: 1 // Assuming admin user
      });
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Verification Stages API
  app.get("/api/verification-stages", async (req, res) => {
    try {
      const stages = await storage.listVerificationStages();
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification stages" });
    }
  });

  app.post("/api/verification-stages", async (req, res) => {
    try {
      const stageData = insertVerificationStageSchema.parse(req.body);
      const stage = await storage.createVerificationStage(stageData);
      res.status(201).json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create verification stage" });
    }
  });

  app.put("/api/verification-stages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stage = await storage.getVerificationStage(id);
      
      if (!stage) {
        return res.status(404).json({ error: "Verification stage not found" });
      }
      
      const updateData = insertVerificationStageSchema.partial().parse(req.body);
      const updatedStage = await storage.updateVerificationStage(id, updateData);
      
      res.json(updatedStage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update verification stage" });
    }
  });

  // Project Verifications API
  app.get("/api/verifications", async (req, res) => {
    try {
      const { status } = req.query;
      
      let verifications;
      if (status) {
        verifications = await storage.listProjectVerificationsByStatus(status as string);
      } else {
        verifications = await storage.listProjectVerifications();
      }
      
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });

  app.get("/api/verifications/:projectId", async (req, res) => {
    try {
      const verification = await storage.getProjectVerificationByProjectId(req.params.projectId);
      
      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }
      
      res.json(verification);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification" });
    }
  });

  app.post("/api/verifications", async (req, res) => {
    try {
      const verificationData = insertProjectVerificationSchema.parse(req.body);
      const verification = await storage.createProjectVerification(verificationData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "verification_requested",
        description: `Verification requested for project ${verificationData.projectId}`,
        entityType: "verification",
        entityId: verificationData.projectId,
        userId: 1 // Assuming admin user
      });
      
      // Update statistics
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({
          pendingVerification: stats.pendingVerification + 1
        });
      }
      
      res.status(201).json(verification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create verification" });
    }
  });

  app.put("/api/verifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const verification = await storage.getProjectVerification(id);
      
      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }
      
      const updateData = insertProjectVerificationSchema.partial().parse(req.body);
      const updatedVerification = await storage.updateProjectVerification(id, updateData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "verification_updated",
        description: `Verification updated for project ${verification.projectId}`,
        entityType: "verification",
        entityId: verification.projectId,
        userId: 1 // Assuming admin user
      });
      
      // If verification is approved, update project status and statistics
      if (updateData.status === "approved" && verification.status !== "approved") {
        const project = await storage.getProjectByProjectId(verification.projectId);
        if (project) {
          await storage.updateProject(project.id, { status: "verified" });
          
          // Update statistics
          const stats = await storage.getStatistics();
          if (stats) {
            await storage.updateStatistics({
              verifiedProjects: stats.verifiedProjects + 1,
              pendingVerification: stats.pendingVerification - 1
            });
          }
        }
      }
      
      res.json(updatedVerification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update verification" });
    }
  });

  app.post("/api/verifications/:id/complete-stage/:stageId", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stageId = parseInt(req.params.stageId);
      
      const verification = await storage.getProjectVerification(id);
      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }
      
      const stage = await storage.getVerificationStage(stageId);
      if (!stage) {
        return res.status(404).json({ error: "Verification stage not found" });
      }
      
      const updatedVerification = await storage.completeVerificationStage(id, stageId);
      
      // Create activity log
      await storage.createActivityLog({
        action: "verification_stage_completed",
        description: `Stage ${stage.name} completed for project ${verification.projectId}`,
        entityType: "verification",
        entityId: verification.projectId,
        userId: 1 // Assuming admin user
      });
      
      res.json(updatedVerification);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete verification stage" });
    }
  });

  // Verification Documents API
  app.get("/api/verification-documents", async (req, res) => {
    try {
      const { verificationId, stageId } = req.query;
      
      let documents;
      if (verificationId && stageId) {
        documents = await storage.listVerificationDocumentsByStage(
          parseInt(verificationId as string), 
          parseInt(stageId as string)
        );
      } else if (verificationId) {
        documents = await storage.listVerificationDocumentsByVerification(parseInt(verificationId as string));
      } else {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification documents" });
    }
  });

  app.post("/api/verification-documents", async (req, res) => {
    try {
      const documentData = insertVerificationDocumentSchema.parse(req.body);
      const document = await storage.createVerificationDocument(documentData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "verification_document_uploaded",
        description: `Document ${documentData.documentName} uploaded for verification #${documentData.verificationId}`,
        entityType: "verification",
        entityId: document.id.toString(),
        userId: documentData.uploadedBy
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create verification document" });
    }
  });

  app.put("/api/verification-documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getVerificationDocument(id);
      
      if (!document) {
        return res.status(404).json({ error: "Verification document not found" });
      }
      
      const updateData = insertVerificationDocumentSchema.partial().parse(req.body);
      const updatedDocument = await storage.updateVerificationDocument(id, updateData);
      
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update verification document" });
    }
  });

  // Verification Comments API
  app.get("/api/verification-comments", async (req, res) => {
    try {
      const { verificationId, stageId } = req.query;
      
      let comments;
      if (verificationId && stageId) {
        comments = await storage.listVerificationCommentsByStage(
          parseInt(verificationId as string), 
          parseInt(stageId as string)
        );
      } else if (verificationId) {
        comments = await storage.listVerificationCommentsByVerification(parseInt(verificationId as string));
      } else {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification comments" });
    }
  });

  app.post("/api/verification-comments", async (req, res) => {
    try {
      const commentData = insertVerificationCommentSchema.parse(req.body);
      const comment = await storage.createVerificationComment(commentData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "verification_comment_added",
        description: `Comment added to verification #${commentData.verificationId}`,
        entityType: "verification",
        entityId: comment.id.toString(),
        userId: commentData.commentedBy
      });
      
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create verification comment" });
    }
  });

  // Carbon Credits API
  app.get("/api/credits", async (req, res) => {
    try {
      const { projectId, owner } = req.query;
      
      let credits;
      if (projectId) {
        credits = await storage.listCarbonCreditsByProjectId(projectId as string);
      } else if (owner) {
        credits = await storage.listCarbonCreditsByOwner(owner as string);
      } else {
        credits = await storage.listCarbonCredits();
      }
      
      res.json(credits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carbon credits" });
    }
  });

  app.get("/api/credits/:serialNumber", async (req, res) => {
    try {
      const credit = await storage.getCarbonCreditBySerialNumber(req.params.serialNumber);
      
      if (!credit) {
        return res.status(404).json({ error: "Carbon credit not found" });
      }
      
      res.json(credit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch carbon credit" });
    }
  });

  app.post("/api/credits", async (req, res) => {
    try {
      const creditData = insertCarbonCreditSchema.parse(req.body);
      const credit = await storage.createCarbonCredit(creditData);
      
      // Create activity log
      await storage.createActivityLog({
        action: "credit_issued",
        description: `${creditData.quantity} credits issued for project ${creditData.projectId}`,
        entityType: "credit",
        entityId: credit.serialNumber,
        userId: 1 // Assuming admin user
      });
      
      // Update statistics
      const stats = await storage.getStatistics();
      if (stats) {
        await storage.updateStatistics({
          totalCredits: stats.totalCredits + creditData.quantity
        });
      }
      
      res.status(201).json(credit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create carbon credit" });
    }
  });

  app.put("/api/credits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const credit = await storage.getCarbonCredit(id);
      
      if (!credit) {
        return res.status(404).json({ error: "Carbon credit not found" });
      }
      
      const updateData = insertCarbonCreditSchema.partial().parse(req.body);
      const updatedCredit = await storage.updateCarbonCredit(id, updateData);
      
      // Create activity log
      const action = updateData.status === "retired" ? "credit_retired" : 
                    updateData.status === "transferred" ? "credit_transferred" : "credit_updated";
      
      let description = `Credit ${credit.serialNumber} updated`;
      
      if (updateData.status === "retired") {
        description = `${credit.quantity} credits retired for project ${credit.projectId}`;
        if (updateData.retirementPurpose) {
          description += ` for ${updateData.retirementPurpose}`;
        }
        if (updateData.retirementBeneficiary) {
          description += ` on behalf of ${updateData.retirementBeneficiary}`;
        }
      } else if (updateData.status === "transferred") {
        description = `${credit.quantity} credits transferred from ${credit.owner} to ${updateData.transferRecipient}`;
        if (updateData.transferPurpose) {
          description += ` for ${updateData.transferPurpose}`;
        }
      }
      
      await storage.createActivityLog({
        action,
        description,
        entityType: "credit",
        entityId: credit.serialNumber,
        userId: req.user?.id || 1 // Use authenticated user if available, fallback to admin
      });
      
      res.json(updatedCredit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update carbon credit" });
    }
  });
  
  // Specific endpoint for transferring credits
  app.post("/api/credits/:id/transfer", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const credit = await storage.getCarbonCredit(id);
      
      if (!credit) {
        return res.status(404).json({ error: "Carbon credit not found" });
      }
      
      if (credit.status !== "available") {
        return res.status(400).json({ 
          error: "Only available credits can be transferred. This credit has already been retired or transferred." 
        });
      }
      
      // Validate transfer data
      const transferSchema = z.object({
        recipient: z.string().min(1, "Recipient is required"),
        purpose: z.string().optional(),
      });
      
      const { recipient, purpose } = transferSchema.parse(req.body);
      
      // Check if recipient exists
      const recipientUser = await storage.getUserByUsername(recipient);
      if (!recipientUser) {
        return res.status(404).json({ error: "Recipient user not found" });
      }
      
      // Update the credit
      const updatedCredit = await storage.updateCarbonCredit(id, {
        status: "transferred",
        transferRecipient: recipient,
        transferPurpose: purpose,
      });
      
      // Log the transfer
      await storage.createActivityLog({
        action: "credit_transferred",
        description: `${credit.quantity} credits transferred from ${credit.owner} to ${recipient}${purpose ? ` for ${purpose}` : ''}`,
        entityType: "credit",
        entityId: credit.serialNumber,
        userId: req.user?.id || 1
      });
      
      res.json(updatedCredit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to transfer carbon credit" });
    }
  });
  
  // Specific endpoint for retiring credits
  app.post("/api/credits/:id/retire", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const credit = await storage.getCarbonCredit(id);
      
      if (!credit) {
        return res.status(404).json({ error: "Carbon credit not found" });
      }
      
      if (credit.status !== "available") {
        return res.status(400).json({ 
          error: "Only available credits can be retired. This credit has already been retired or transferred." 
        });
      }
      
      // Validate retirement data
      const retirementSchema = z.object({
        purpose: z.string().optional(),
        beneficiary: z.string().optional(),
      });
      
      const { purpose, beneficiary } = retirementSchema.parse(req.body);
      
      // Update the credit
      const updatedCredit = await storage.updateCarbonCredit(id, {
        status: "retired",
        retirementPurpose: purpose,
        retirementBeneficiary: beneficiary,
      });
      
      // Log the retirement
      let description = `${credit.quantity} credits retired for project ${credit.projectId}`;
      if (purpose) {
        description += ` for ${purpose}`;
      }
      if (beneficiary) {
        description += ` on behalf of ${beneficiary}`;
      }
      
      await storage.createActivityLog({
        action: "credit_retired",
        description,
        entityType: "credit",
        entityId: credit.serialNumber,
        userId: req.user?.id || 1
      });
      
      res.json(updatedCredit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to retire carbon credit" });
    }
  });

  // Activity Logs API
  app.get("/api/activity", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await storage.listActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  // Statistics API
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
  
  // Certificate Generation API
  app.get("/api/projects/:projectId/certificate", async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const project = await storage.getProjectByProjectId(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check if project is verified
      if (project.status !== "verified") {
        return res.status(400).json({ error: "Only verified projects can generate certificates" });
      }
      
      // Get verification
      const verification = await storage.getProjectVerificationByProjectId(projectId);
      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }
      
      // Generate the certificate
      const pdfBuffer = await generateProjectCertificate(project, verification.id);
      
      // Create activity log
      await storage.createActivityLog({
        action: "certificate_generated",
        description: `Verification certificate generated for project ${projectId}`,
        entityType: "project",
        entityId: projectId,
        userId: req.user?.id || 1
      });
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=project-certificate-${projectId}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating project certificate:", error);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });
  
  app.get("/api/credits/:serialNumber/certificate", async (req, res) => {
    try {
      const serialNumber = req.params.serialNumber;
      const credit = await storage.getCarbonCreditBySerialNumber(serialNumber);
      
      if (!credit) {
        return res.status(404).json({ error: "Carbon credit not found" });
      }
      
      // Generate the certificate
      const pdfBuffer = await generateCreditCertificate(credit);
      
      // Create activity log
      await storage.createActivityLog({
        action: "certificate_generated",
        description: `Certificate generated for carbon credit ${serialNumber}`,
        entityType: "credit",
        entityId: serialNumber,
        userId: req.user?.id || 1
      });
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=credit-certificate-${serialNumber}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating credit certificate:", error);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  });
  
  // Verify certificates API endpoint
  app.get("/api/verify-certificate", async (req, res) => {
    try {
      const { type, id, verificationId } = req.query;
      
      if (!type || !id) {
        return res.status(400).json({ error: "Missing certificate parameters" });
      }
      
      if (type === 'project') {
        if (!verificationId) {
          return res.status(400).json({ error: "Missing verification ID" });
        }
        
        const project = await storage.getProjectByProjectId(id as string);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        
        const verification = await storage.getProjectVerification(parseInt(verificationId as string));
        if (!verification || verification.projectId !== id) {
          return res.status(404).json({ error: "Verification not found" });
        }
        
        return res.json({
          verified: true,
          type: 'project',
          project,
          verification
        });
      } else if (type === 'credit') {
        const credit = await storage.getCarbonCreditBySerialNumber(id as string);
        if (!credit) {
          return res.status(404).json({ error: "Carbon credit not found" });
        }
        
        return res.json({
          verified: true,
          type: 'credit',
          credit
        });
      } else {
        return res.status(400).json({ error: "Invalid certificate type" });
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ error: "Failed to verify certificate" });
    }
  });

  // Corresponding Adjustments API (Paris Agreement Article 6)
  app.get("/api/adjustments", async (req, res) => {
    try {
      const { status, country, isHost } = req.query;
      
      if (status) {
        const adjustments = await storage.listCorrespondingAdjustmentsByStatus(status as string);
        return res.json(adjustments);
      }
      
      if (country) {
        const adjustments = await storage.listCorrespondingAdjustmentsByCountry(
          country as string,
          isHost === 'true'
        );
        return res.json(adjustments);
      }
      
      const adjustments = await storage.listCorrespondingAdjustments();
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch corresponding adjustments" });
    }
  });
  
  app.get("/api/adjustments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adjustment = await storage.getCorrespondingAdjustment(id);
      
      if (!adjustment) {
        return res.status(404).json({ error: "Corresponding adjustment not found" });
      }
      
      res.json(adjustment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch corresponding adjustment" });
    }
  });
  
  app.get("/api/credits/:id/adjustments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adjustments = await storage.getCorrespondingAdjustmentsByCreditId(id);
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch corresponding adjustments for credit" });
    }
  });
  
  app.post("/api/adjustments", async (req, res) => {
    try {
      // Handle date conversion
      const { adjustmentDate, ...otherData } = req.body;
      
      // Create insertion data with proper date format
      const insertData: any = { ...otherData };
      if (adjustmentDate) {
        insertData.adjustmentDate = new Date(adjustmentDate);
      }
      
      // Validate the data
      const adjustmentData = insertCorrespondingAdjustmentSchema.parse(insertData);
      const adjustment = await storage.createCorrespondingAdjustment(adjustmentData);
      
      // Log the activity
      await storage.createActivityLog({
        action: "adjustment_created",
        description: `Corresponding adjustment created for credit ${adjustment.creditSerialNumber} between ${adjustment.hostCountry} and ${adjustment.recipientCountry || "unknown"}`,
        entityType: "adjustment",
        entityId: adjustment.id.toString(),
        userId: req.user?.id || 1
      });
      
      res.status(201).json(adjustment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create corresponding adjustment" });
    }
  });
  
  app.patch("/api/adjustments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const adjustment = await storage.getCorrespondingAdjustment(id);
      
      if (!adjustment) {
        return res.status(404).json({ error: "Corresponding adjustment not found" });
      }
      
      // Handle date conversion
      const { adjustmentDate, ...otherData } = req.body;
      
      // Create update data with proper date format
      const patchData: any = { ...otherData };
      if (adjustmentDate) {
        patchData.adjustmentDate = new Date(adjustmentDate);
      }
      
      // Validate the data
      const updateSchema = insertCorrespondingAdjustmentSchema.partial();
      const updateData = updateSchema.parse(patchData);
      
      const updatedAdjustment = await storage.updateCorrespondingAdjustment(id, updateData);
      
      // Log the update
      await storage.createActivityLog({
        action: "adjustment_updated",
        description: `Corresponding adjustment updated for credit ${adjustment.creditSerialNumber}`,
        entityType: "adjustment",
        entityId: adjustment.id.toString(),
        userId: req.user?.id || 1
      });
      
      res.json(updatedAdjustment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update corresponding adjustment" });
    }
  });
  
  // Update credit's Paris Agreement compliance fields
  app.patch("/api/credits/:id/paris-compliance", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const credit = await storage.getCarbonCredit(id);
      
      if (!credit) {
        return res.status(404).json({ error: "Carbon credit not found" });
      }
      
      // Parse and transform data for the database
      const { authorizationDate, ...otherData } = req.body;
      
      // Create update data object
      const updateData: Partial<InsertCarbonCredit> = {
        ...otherData
      };
      
      // Handle date conversion separately
      if (authorizationDate) {
        updateData.authorizationDate = new Date(authorizationDate);
      }
      
      // Update the credit
      const updatedCredit = await storage.updateCarbonCredit(id, updateData);
      
      // Log the update
      await storage.createActivityLog({
        action: "paris_compliance_updated",
        description: `Paris Agreement compliance data updated for credit ${credit.serialNumber}`,
        entityType: "credit",
        entityId: credit.serialNumber,
        userId: req.user?.id || 1
      });
      
      res.json(updatedCredit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update Paris Agreement compliance data" });
    }
  });

  return httpServer;
}
