import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { 
  users, 
  type User, 
  type InsertUser,
  projectCategories,
  type ProjectCategory,
  type InsertProjectCategory,
  methodologies,
  type Methodology,
  type InsertMethodology,
  projects,
  type Project,
  type InsertProject,
  verificationStages,
  type VerificationStage,
  type InsertVerificationStage,
  projectVerifications,
  type ProjectVerification,
  type InsertProjectVerification,
  carbonCredits,
  type CarbonCredit,
  type InsertCarbonCredit,
  activityLogs,
  type ActivityLog,
  type InsertActivityLog,
  statistics,
  type Statistics,
  type InsertStatistics
} from "@shared/schema";

import { eq, desc, like, sql, and, or } from "drizzle-orm";

export interface IStorage {
  // Authentication operations
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // Project Category operations
  getProjectCategory(id: number): Promise<ProjectCategory | undefined>;
  getProjectCategoryByName(name: string): Promise<ProjectCategory | undefined>;
  createProjectCategory(category: InsertProjectCategory): Promise<ProjectCategory>;
  listProjectCategories(): Promise<ProjectCategory[]>;
  
  // Methodology operations
  getMethodology(id: number): Promise<Methodology | undefined>;
  getMethodologyByName(name: string): Promise<Methodology | undefined>;
  createMethodology(methodology: InsertMethodology): Promise<Methodology>;
  listMethodologies(): Promise<Methodology[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectByProjectId(projectId: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  listProjects(): Promise<Project[]>;
  listProjectsByStatus(status: string): Promise<Project[]>;
  listProjectsByDeveloper(developer: string): Promise<Project[]>;
  
  // Verification Stage operations
  getVerificationStage(id: number): Promise<VerificationStage | undefined>;
  createVerificationStage(stage: InsertVerificationStage): Promise<VerificationStage>;
  listVerificationStages(): Promise<VerificationStage[]>;
  
  // Project Verification operations
  getProjectVerification(id: number): Promise<ProjectVerification | undefined>;
  getProjectVerificationByProjectId(projectId: string): Promise<ProjectVerification | undefined>;
  createProjectVerification(verification: InsertProjectVerification): Promise<ProjectVerification>;
  updateProjectVerification(id: number, verification: Partial<InsertProjectVerification>): Promise<ProjectVerification | undefined>;
  listProjectVerifications(): Promise<ProjectVerification[]>;
  listProjectVerificationsByStatus(status: string): Promise<ProjectVerification[]>;
  
  // Carbon Credit operations
  getCarbonCredit(id: number): Promise<CarbonCredit | undefined>;
  getCarbonCreditBySerialNumber(serialNumber: string): Promise<CarbonCredit | undefined>;
  createCarbonCredit(credit: InsertCarbonCredit): Promise<CarbonCredit>;
  updateCarbonCredit(id: number, credit: Partial<InsertCarbonCredit>): Promise<CarbonCredit | undefined>;
  listCarbonCredits(): Promise<CarbonCredit[]>;
  listCarbonCreditsByProjectId(projectId: string): Promise<CarbonCredit[]>;
  listCarbonCreditsByOwner(owner: string): Promise<CarbonCredit[]>;
  
  // Activity Log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  listActivityLogs(limit?: number): Promise<ActivityLog[]>;
  
  // Statistics operations
  getStatistics(): Promise<Statistics | undefined>;
  updateStatistics(stats: Partial<InsertStatistics>): Promise<Statistics | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getProjectCategory(id: number): Promise<ProjectCategory | undefined> {
    const [category] = await db.select().from(projectCategories).where(eq(projectCategories.id, id));
    return category || undefined;
  }
  
  async getProjectCategoryByName(name: string): Promise<ProjectCategory | undefined> {
    const [category] = await db.select().from(projectCategories).where(eq(projectCategories.name, name));
    return category || undefined;
  }
  
  async createProjectCategory(category: InsertProjectCategory): Promise<ProjectCategory> {
    const [newCategory] = await db
      .insert(projectCategories)
      .values(category)
      .returning();
    return newCategory;
  }
  
  async listProjectCategories(): Promise<ProjectCategory[]> {
    return await db.select().from(projectCategories);
  }
  
  async getMethodology(id: number): Promise<Methodology | undefined> {
    const [methodology] = await db.select().from(methodologies).where(eq(methodologies.id, id));
    return methodology || undefined;
  }
  
  async getMethodologyByName(name: string): Promise<Methodology | undefined> {
    const [methodology] = await db.select().from(methodologies).where(eq(methodologies.name, name));
    return methodology || undefined;
  }
  
  async createMethodology(methodology: InsertMethodology): Promise<Methodology> {
    const [newMethodology] = await db
      .insert(methodologies)
      .values(methodology)
      .returning();
    return newMethodology;
  }
  
  async listMethodologies(): Promise<Methodology[]> {
    return await db.select().from(methodologies);
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }
  
  async getProjectByProjectId(projectId: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.projectId, projectId));
    return project || undefined;
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }
  
  async listProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }
  
  async listProjectsByStatus(status: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.status, status));
  }
  
  async listProjectsByDeveloper(developer: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.developer, developer));
  }
  
  async getVerificationStage(id: number): Promise<VerificationStage | undefined> {
    const [stage] = await db.select().from(verificationStages).where(eq(verificationStages.id, id));
    return stage || undefined;
  }
  
  async createVerificationStage(stage: InsertVerificationStage): Promise<VerificationStage> {
    const [newStage] = await db
      .insert(verificationStages)
      .values(stage)
      .returning();
    return newStage;
  }
  
  async listVerificationStages(): Promise<VerificationStage[]> {
    return await db.select().from(verificationStages).orderBy(verificationStages.order);
  }
  
  async getProjectVerification(id: number): Promise<ProjectVerification | undefined> {
    const [verification] = await db.select().from(projectVerifications).where(eq(projectVerifications.id, id));
    return verification || undefined;
  }
  
  async getProjectVerificationByProjectId(projectId: string): Promise<ProjectVerification | undefined> {
    const [verification] = await db.select().from(projectVerifications).where(eq(projectVerifications.projectId, projectId));
    return verification || undefined;
  }
  
  async createProjectVerification(verification: InsertProjectVerification): Promise<ProjectVerification> {
    const [newVerification] = await db
      .insert(projectVerifications)
      .values(verification)
      .returning();
    return newVerification;
  }
  
  async updateProjectVerification(id: number, verification: Partial<InsertProjectVerification>): Promise<ProjectVerification | undefined> {
    const [updatedVerification] = await db
      .update(projectVerifications)
      .set(verification)
      .where(eq(projectVerifications.id, id))
      .returning();
    return updatedVerification || undefined;
  }
  
  async listProjectVerifications(): Promise<ProjectVerification[]> {
    return await db.select().from(projectVerifications);
  }
  
  async listProjectVerificationsByStatus(status: string): Promise<ProjectVerification[]> {
    return await db.select().from(projectVerifications).where(eq(projectVerifications.status, status));
  }
  
  async getCarbonCredit(id: number): Promise<CarbonCredit | undefined> {
    const [credit] = await db.select().from(carbonCredits).where(eq(carbonCredits.id, id));
    return credit || undefined;
  }
  
  async getCarbonCreditBySerialNumber(serialNumber: string): Promise<CarbonCredit | undefined> {
    const [credit] = await db.select().from(carbonCredits).where(eq(carbonCredits.serialNumber, serialNumber));
    return credit || undefined;
  }
  
  async createCarbonCredit(credit: InsertCarbonCredit): Promise<CarbonCredit> {
    const [newCredit] = await db
      .insert(carbonCredits)
      .values(credit)
      .returning();
    return newCredit;
  }
  
  async updateCarbonCredit(id: number, credit: Partial<InsertCarbonCredit>): Promise<CarbonCredit | undefined> {
    const [updatedCredit] = await db
      .update(carbonCredits)
      .set(credit)
      .where(eq(carbonCredits.id, id))
      .returning();
    return updatedCredit || undefined;
  }
  
  async listCarbonCredits(): Promise<CarbonCredit[]> {
    return await db.select().from(carbonCredits);
  }
  
  async listCarbonCreditsByProjectId(projectId: string): Promise<CarbonCredit[]> {
    return await db.select().from(carbonCredits).where(eq(carbonCredits.projectId, projectId));
  }
  
  async listCarbonCreditsByOwner(owner: string): Promise<CarbonCredit[]> {
    return await db.select().from(carbonCredits).where(eq(carbonCredits.owner, owner));
  }
  
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return newLog;
  }
  
  async listActivityLogs(limit?: number): Promise<ActivityLog[]> {
    const query = db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async getStatistics(): Promise<Statistics | undefined> {
    const [stats] = await db.select().from(statistics);
    return stats || undefined;
  }
  
  async updateStatistics(stats: Partial<InsertStatistics>): Promise<Statistics | undefined> {
    const currentStats = await this.getStatistics();
    
    if (!currentStats) {
      const [newStats] = await db
        .insert(statistics)
        .values(stats)
        .returning();
      return newStats;
    }
    
    const [updatedStats] = await db
      .update(statistics)
      .set(stats)
      .where(eq(statistics.id, currentStats.id))
      .returning();
    return updatedStats || undefined;
  }
}

export const storage = new DatabaseStorage();