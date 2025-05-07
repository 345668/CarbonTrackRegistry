import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"), // admin, verifier, project_developer, user
  organization: text("organization"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  organization: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Project Category/Type
export const projectCategories = pgTable("project_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#00C781"), // Default color for category badges
});

export const insertProjectCategorySchema = createInsertSchema(projectCategories).pick({
  name: true,
  description: true,
  color: true,
});

export type InsertProjectCategory = z.infer<typeof insertProjectCategorySchema>;
export type ProjectCategory = typeof projectCategories.$inferSelect;

// Methodology
export const methodologies = pgTable("methodologies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(), // Reference to project category
  documentUrl: text("document_url"),
});

export const insertMethodologySchema = createInsertSchema(methodologies).pick({
  name: true,
  description: true,
  category: true,
  documentUrl: true,
});

export type InsertMethodology = z.infer<typeof insertMethodologySchema>;
export type Methodology = typeof methodologies.$inferSelect;

// Carbon Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(), // E.g., KEN-2023-0045
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Reference to project category
  methodology: text("methodology").notNull(), // Reference to methodology
  developer: text("developer").notNull(), // Reference to user who created the project
  location: text("location").notNull(),
  coordinates: json("coordinates"), // GeoJSON format
  longitude: text("longitude"), // For map visualization
  latitude: text("latitude"), // For map visualization
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, registered, verified, rejected
  estimatedReduction: integer("estimated_reduction").notNull(), // In tCO2e
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  projectId: true,
  name: true,
  description: true,
  category: true,
  methodology: true,
  developer: true,
  location: true,
  coordinates: true,
  longitude: true,
  latitude: true,
  startDate: true,
  endDate: true,
  status: true,
  estimatedReduction: true,
  imageUrl: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Verification Stages
export const verificationStages = pgTable("verification_stages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "Data Validation", "Field Audit", "Final Review"
  description: text("description"),
  order: integer("order").notNull(), // To define the sequence of stages
});

export const insertVerificationStageSchema = createInsertSchema(verificationStages).pick({
  name: true,
  description: true,
  order: true,
});

export type InsertVerificationStage = z.infer<typeof insertVerificationStageSchema>;
export type VerificationStage = typeof verificationStages.$inferSelect;

// Project Verification
export const projectVerifications = pgTable("project_verifications", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(), // Reference to project.projectId
  verifier: text("verifier"), // Reference to user
  currentStage: integer("current_stage").notNull(), // Reference to verification stage
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  submittedDate: timestamp("submitted_date").notNull().defaultNow(),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
});

export const insertProjectVerificationSchema = createInsertSchema(projectVerifications).pick({
  projectId: true,
  verifier: true,
  currentStage: true,
  status: true,
  estimatedCompletionDate: true,
  notes: true,
});

export type InsertProjectVerification = z.infer<typeof insertProjectVerificationSchema>;
export type ProjectVerification = typeof projectVerifications.$inferSelect;

// Carbon Credits
export const carbonCredits = pgTable("carbon_credits", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull().unique(), // e.g., CR-00001-20230101-20240101-001
  projectId: text("project_id").notNull(), // Reference to project.projectId
  vintage: text("vintage").notNull(), // Year the credit was generated
  quantity: integer("quantity").notNull(), // Number of credits in tCO2e
  status: text("status").notNull().default("available"), // available, retired, transferred
  issuanceDate: timestamp("issuance_date").notNull().defaultNow(),
  retirementDate: timestamp("retirement_date"),
  owner: text("owner").notNull(), // Reference to user
});

export const insertCarbonCreditSchema = createInsertSchema(carbonCredits).pick({
  serialNumber: true,
  projectId: true,
  vintage: true,
  quantity: true,
  status: true,
  owner: true,
});

export type InsertCarbonCredit = z.infer<typeof insertCarbonCreditSchema>;
export type CarbonCredit = typeof carbonCredits.$inferSelect;

// Activity Log
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(), // e.g., "project_created", "verification_updated", "credit_issued"
  description: text("description").notNull(),
  entityType: text("entity_type").notNull(), // project, verification, credit
  entityId: text("entity_id").notNull(), // Reference to the related entity
  userId: integer("user_id").notNull(), // Reference to user who performed the action
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  action: true,
  description: true,
  entityType: true,
  entityId: true,
  userId: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Dashboard Statistics
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  totalProjects: integer("total_projects").notNull().default(0),
  verifiedProjects: integer("verified_projects").notNull().default(0),
  pendingVerification: integer("pending_verification").notNull().default(0),
  totalCredits: integer("total_credits").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertStatisticsSchema = createInsertSchema(statistics).pick({
  totalProjects: true,
  verifiedProjects: true,
  pendingVerification: true,
  totalCredits: true,
});

export type InsertStatistics = z.infer<typeof insertStatisticsSchema>;
export type Statistics = typeof statistics.$inferSelect;
