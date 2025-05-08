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
  requiredDocuments: text("required_documents").array(), // Array of required document types for this stage
  requiredFields: text("required_fields").array(), // Array of required fields to be completed
  icon: text("icon"), // Icon identifier for display
});

export const insertVerificationStageSchema = createInsertSchema(verificationStages).pick({
  name: true,
  description: true,
  order: true,
  requiredDocuments: true,
  requiredFields: true,
  icon: true,
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
  verificationReport: text("verification_report"), // Link to the final verification report document
  verificationStandard: text("verification_standard"), // The standard used for verification (e.g., VCS, Gold Standard)
  thirdPartyVerifier: text("third_party_verifier"), // Name of third-party verification entity if applicable
  contactEmail: text("contact_email"), // Contact email for verification queries
  completedStages: integer("completed_stages").array(), // Array of completed stage IDs
});

export const insertProjectVerificationSchema = createInsertSchema(projectVerifications).pick({
  projectId: true,
  verifier: true,
  currentStage: true,
  status: true,
  estimatedCompletionDate: true,
  notes: true,
  verificationReport: true,
  verificationStandard: true,
  thirdPartyVerifier: true,
  contactEmail: true,
  completedStages: true,
});

export type InsertProjectVerification = z.infer<typeof insertProjectVerificationSchema>;
export type ProjectVerification = typeof projectVerifications.$inferSelect;

// Verification Documents
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  verificationId: integer("verification_id").notNull(), // Reference to project_verifications.id
  stageId: integer("stage_id").notNull(), // Reference to verification_stages.id
  documentType: text("document_type").notNull(), // Type of document (e.g., "methodology_assessment", "site_inspection_report")
  documentName: text("document_name").notNull(),
  documentUrl: text("document_url").notNull(),
  uploadedBy: integer("uploaded_by").notNull(), // Reference to users.id
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  notes: text("notes"),
});

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).pick({
  verificationId: true,
  stageId: true,
  documentType: true,
  documentName: true,
  documentUrl: true,
  uploadedBy: true,
  status: true,
  notes: true,
});

export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type VerificationDocument = typeof verificationDocuments.$inferSelect;

// Verification Comments
export const verificationComments = pgTable("verification_comments", {
  id: serial("id").primaryKey(),
  verificationId: integer("verification_id").notNull(), // Reference to project_verifications.id
  stageId: integer("stage_id").notNull(), // Reference to verification_stages.id
  comment: text("comment").notNull(),
  commentedBy: integer("commented_by").notNull(), // Reference to users.id
  commentedAt: timestamp("commented_at").notNull().defaultNow(),
  isInternal: boolean("is_internal").notNull().default(false), // Flag for internal-only comments
});

export const insertVerificationCommentSchema = createInsertSchema(verificationComments).pick({
  verificationId: true,
  stageId: true,
  comment: true,
  commentedBy: true,
  isInternal: true,
});

export type InsertVerificationComment = z.infer<typeof insertVerificationCommentSchema>;
export type VerificationComment = typeof verificationComments.$inferSelect;

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
  transferDate: timestamp("transfer_date"), // Date when the credit was transferred
  transferRecipient: text("transfer_recipient"), // Username of the recipient if transferred
  transferPurpose: text("transfer_purpose"), // Purpose of the transfer
  owner: text("owner").notNull(), // Reference to user
  retirementPurpose: text("retirement_purpose"), // Purpose of retirement (e.g., "Corporate offsetting", "Compliance")
  retirementBeneficiary: text("retirement_beneficiary"), // Entity on whose behalf the credits were retired
  
  // Paris Agreement Compliance Fields
  parisAgreementEligible: boolean("paris_agreement_eligible").default(false), // Whether credit is eligible for Paris Agreement Article 6
  hostCountry: text("host_country"), // Country where project is located (ISO code)
  correspondingAdjustmentStatus: text("corresponding_adjustment_status").default("pending"), // pending, approved, rejected
  correspondingAdjustmentDetails: text("corresponding_adjustment_details"), // Details on the corresponding adjustment
  internationalTransfer: boolean("international_transfer").default(false), // Whether this credit was transferred internationally
  mitigationOutcome: text("mitigation_outcome"), // Type of mitigation outcome (e.g., ITMO under Art. 6.2, A6.4ER under Art. 6.4)
  authorizationReference: text("authorization_reference"), // Reference to the authorization document for international transfer
  authorizationDate: timestamp("authorization_date"), // Date when the credit was authorized for international transfer
});

export const insertCarbonCreditSchema = createInsertSchema(carbonCredits).pick({
  serialNumber: true,
  projectId: true,
  vintage: true,
  quantity: true,
  status: true,
  owner: true,
  transferRecipient: true,
  transferPurpose: true,
  transferDate: true,
  retirementPurpose: true,
  retirementBeneficiary: true,
  retirementDate: true,
  // Paris Agreement fields
  parisAgreementEligible: true,
  hostCountry: true,
  correspondingAdjustmentStatus: true,
  correspondingAdjustmentDetails: true,
  internationalTransfer: true,
  mitigationOutcome: true,
  authorizationReference: true,
  authorizationDate: true,
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

// Corresponding Adjustments (for Paris Agreement Article 6)
export const correspondingAdjustments = pgTable("corresponding_adjustments", {
  id: serial("id").primaryKey(),
  creditId: integer("credit_id").notNull(), // Reference to carbon_credits.id
  creditSerialNumber: text("credit_serial_number").notNull(), // Duplicated for easier queries
  hostCountry: text("host_country").notNull(), // Country where project is located (ISO code)
  recipientCountry: text("recipient_country"), // Country receiving the carbon credit (ISO code)
  adjustmentType: text("adjustment_type").notNull(), // e.g., "Article 6.2", "Article 6.4"
  adjustmentQuantity: integer("adjustment_quantity").notNull(), // Quantity of credits adjusted
  adjustmentStatus: text("adjustment_status").notNull().default("pending"), // pending, approved, verified, rejected
  adjustmentDate: timestamp("adjustment_date"), // Date when adjustment was completed
  authorizedBy: text("authorized_by"), // Entity authorizing the adjustment
  verifiedBy: text("verified_by"), // Entity verifying the adjustment
  ndcTarget: text("ndc_target"), // Related NDC target for the host country
  mitigationOutcomeType: text("mitigation_outcome_type"), // Type of mitigation outcome
  authorizationDocument: text("authorization_document"), // URL to authorization document
  verificationDocument: text("verification_document"), // URL to verification document
  notes: text("notes"), // Additional notes or details
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertCorrespondingAdjustmentSchema = createInsertSchema(correspondingAdjustments).pick({
  creditId: true,
  creditSerialNumber: true,
  hostCountry: true,
  recipientCountry: true,
  adjustmentType: true,
  adjustmentQuantity: true,
  adjustmentStatus: true,
  adjustmentDate: true,
  authorizedBy: true,
  verifiedBy: true,
  ndcTarget: true,
  mitigationOutcomeType: true,
  authorizationDocument: true,
  verificationDocument: true,
  notes: true,
});

export type InsertCorrespondingAdjustment = z.infer<typeof insertCorrespondingAdjustmentSchema>;
export type CorrespondingAdjustment = typeof correspondingAdjustments.$inferSelect;
