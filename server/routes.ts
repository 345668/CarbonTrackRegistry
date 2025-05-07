import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertProjectCategorySchema,
  insertMethodologySchema,
  insertProjectSchema,
  insertVerificationStageSchema,
  insertProjectVerificationSchema,
  insertCarbonCreditSchema,
  insertActivityLogSchema,
  insertStatisticsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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
      const action = updateData.status === "retired" ? "credit_retired" : "credit_updated";
      const description = updateData.status === "retired" 
        ? `${credit.quantity} credits retired for project ${credit.projectId}`
        : `Credit ${credit.serialNumber} updated`;
      
      await storage.createActivityLog({
        action,
        description,
        entityType: "credit",
        entityId: credit.serialNumber,
        userId: 1 // Assuming admin user
      });
      
      res.json(updatedCredit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update carbon credit" });
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

  return httpServer;
}
