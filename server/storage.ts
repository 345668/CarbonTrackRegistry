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

// Interface for storage operations
export interface IStorage {
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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projectCategories: Map<number, ProjectCategory>;
  private methodologies: Map<number, Methodology>;
  private projects: Map<number, Project>;
  private verificationStages: Map<number, VerificationStage>;
  private projectVerifications: Map<number, ProjectVerification>;
  private carbonCredits: Map<number, CarbonCredit>;
  private activityLogs: Map<number, ActivityLog>;
  private stats: Statistics | undefined;
  
  private userIdCounter: number;
  private projectCategoryIdCounter: number;
  private methodologyIdCounter: number;
  private projectIdCounter: number;
  private verificationStageIdCounter: number;
  private projectVerificationIdCounter: number;
  private carbonCreditIdCounter: number;
  private activityLogIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.projectCategories = new Map();
    this.methodologies = new Map();
    this.projects = new Map();
    this.verificationStages = new Map();
    this.projectVerifications = new Map();
    this.carbonCredits = new Map();
    this.activityLogs = new Map();
    
    this.userIdCounter = 1;
    this.projectCategoryIdCounter = 1;
    this.methodologyIdCounter = 1;
    this.projectIdCounter = 1;
    this.verificationStageIdCounter = 1;
    this.projectVerificationIdCounter = 1;
    this.carbonCreditIdCounter = 1;
    this.activityLogIdCounter = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }
  
  private initializeDefaultData(): void {
    // Create default categories
    const forestry = this.createProjectCategory({
      name: "Forestry",
      description: "Forest conservation and reforestation projects",
      color: "#00C781" // Green
    });
    
    const renewableEnergy = this.createProjectCategory({
      name: "Renewable Energy",
      description: "Solar, wind, and other renewable energy projects",
      color: "#3395dd" // Blue
    });
    
    const agriculture = this.createProjectCategory({
      name: "Agriculture",
      description: "Sustainable agriculture and soil management",
      color: "#FFAA15" // Yellow
    });
    
    const wasteManagement = this.createProjectCategory({
      name: "Waste Management",
      description: "Waste reduction and methane capture projects",
      color: "#8A4BD2" // Purple
    });
    
    // Create default methodologies
    this.createMethodology({
      name: "Afforestation/Reforestation",
      description: "Methodology for afforestation and reforestation projects",
      category: "Forestry",
      documentUrl: "https://example.com/methodologies/ar"
    });
    
    this.createMethodology({
      name: "REDD+",
      description: "Reducing Emissions from Deforestation and Forest Degradation",
      category: "Forestry",
      documentUrl: "https://example.com/methodologies/redd"
    });
    
    this.createMethodology({
      name: "Solar Energy",
      description: "Methodology for solar energy projects",
      category: "Renewable Energy",
      documentUrl: "https://example.com/methodologies/solar"
    });
    
    this.createMethodology({
      name: "Wind Energy",
      description: "Methodology for wind energy projects",
      category: "Renewable Energy",
      documentUrl: "https://example.com/methodologies/wind"
    });
    
    this.createMethodology({
      name: "Sustainable Agriculture",
      description: "Methodology for sustainable agriculture practices",
      category: "Agriculture",
      documentUrl: "https://example.com/methodologies/agriculture"
    });
    
    this.createMethodology({
      name: "Waste to Energy",
      description: "Methodology for waste to energy projects",
      category: "Waste Management",
      documentUrl: "https://example.com/methodologies/waste"
    });
    
    // Create default verification stages
    this.createVerificationStage({
      name: "Data Validation",
      description: "Initial validation of project data and documentation",
      order: 1
    });
    
    this.createVerificationStage({
      name: "Field Audit",
      description: "On-site verification of project activities",
      order: 2
    });
    
    this.createVerificationStage({
      name: "Final Review",
      description: "Final review and decision on project verification",
      order: 3
    });
    
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "password", // In a real app, this would be hashed
      fullName: "Admin User",
      email: "admin@example.com",
      role: "admin",
      organization: "UNDP"
    });
    
    // Create default statistics
    this.stats = {
      id: 1,
      totalProjects: 87,
      verifiedProjects: 62,
      pendingVerification: 14,
      totalCredits: 1248392,
      lastUpdated: new Date()
    };
    
    // Create example projects
    const amazonProject = this.createProject({
      projectId: "BRA-2023-0001",
      name: "Amazon Rainforest Conservation Project",
      description: "Conservation of 50,000 hectares of rainforest in Brazil to prevent deforestation and protect biodiversity.",
      category: "Forestry",
      methodology: "REDD+",
      developer: "admin",
      location: "Brazil",
      coordinates: { type: "Point", coordinates: [-59.1, -3.1] },
      startDate: "2023-01-01",
      endDate: "2033-01-01",
      status: "verified",
      estimatedReduction: 120000,
      imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b"
    });
    
    this.createProject({
      projectId: "IDN-2023-0002",
      name: "Solar Energy Initiative - Phase 2",
      description: "Installation of 5MW solar power generation capacity in rural communities across Southeast Asia.",
      category: "Renewable Energy",
      methodology: "Solar Energy",
      developer: "admin",
      location: "Indonesia",
      coordinates: { type: "Point", coordinates: [106.8, -6.2] },
      startDate: "2023-02-01",
      endDate: "2033-02-01",
      status: "registered",
      estimatedReduction: 85500,
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276"
    });
    
    this.createProject({
      projectId: "KEN-2023-0003",
      name: "Sustainable Agriculture Project",
      description: "Implementing sustainable farming practices across 2,000 farms in East Africa, reducing emissions and improving soil health.",
      category: "Agriculture",
      methodology: "Sustainable Agriculture",
      developer: "admin",
      location: "Kenya",
      coordinates: { type: "Point", coordinates: [37.9, -0.4] },
      startDate: "2023-03-01",
      endDate: "2033-03-01",
      status: "verified",
      estimatedReduction: 25000,
      imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449"
    });
    
    // Create verification requests
    this.createProjectVerification({
      projectId: "KEN-2023-0045",
      verifier: "admin",
      currentStage: 1, // Data Validation
      status: "pending",
      estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: "Initial verification request"
    });
    
    this.createProjectVerification({
      projectId: "GHA-2023-0018",
      verifier: "admin",
      currentStage: 2, // Field Audit
      status: "pending",
      estimatedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      notes: "Proceeding to field audit"
    });
    
    this.createProjectVerification({
      projectId: "PHL-2023-0031",
      verifier: "admin",
      currentStage: 3, // Final Review
      status: "pending",
      estimatedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      notes: "Completing final review"
    });
    
    // Create carbon credits for Amazon project
    this.createCarbonCredit({
      serialNumber: "CR-BRA-2023-0001-20230101-20240101-001",
      projectId: "BRA-2023-0001",
      vintage: "2023",
      quantity: 120000,
      status: "available",
      owner: "admin"
    });
    
    // Create carbon credits for Kenya project
    this.createCarbonCredit({
      serialNumber: "CR-KEN-2023-0003-20230301-20240301-001",
      projectId: "KEN-2023-0003",
      vintage: "2023",
      quantity: 25000,
      status: "available",
      owner: "admin"
    });
    
    // Create activity logs
    this.createActivityLog({
      action: "project_registered",
      description: "New project registered",
      entityType: "project",
      entityId: "BRA-2023-0001",
      userId: 1
    });
    
    this.createActivityLog({
      action: "project_verified",
      description: "Project verified",
      entityType: "project",
      entityId: "KEN-2023-0003",
      userId: 1
    });
    
    this.createActivityLog({
      action: "credit_issued",
      description: "Carbon credits issued",
      entityType: "credit",
      entityId: "CR-KEN-2023-0003-20230301-20240301-001",
      userId: 1
    });
    
    this.createActivityLog({
      action: "verification_requested",
      description: "Verification requested",
      entityType: "verification",
      entityId: "KEN-2023-0045",
      userId: 1
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Project Category operations
  async getProjectCategory(id: number): Promise<ProjectCategory | undefined> {
    return this.projectCategories.get(id);
  }
  
  async getProjectCategoryByName(name: string): Promise<ProjectCategory | undefined> {
    return Array.from(this.projectCategories.values()).find(
      (category) => category.name === name
    );
  }
  
  async createProjectCategory(category: InsertProjectCategory): Promise<ProjectCategory> {
    const id = this.projectCategoryIdCounter++;
    const projectCategory: ProjectCategory = { ...category, id };
    this.projectCategories.set(id, projectCategory);
    return projectCategory;
  }
  
  async listProjectCategories(): Promise<ProjectCategory[]> {
    return Array.from(this.projectCategories.values());
  }
  
  // Methodology operations
  async getMethodology(id: number): Promise<Methodology | undefined> {
    return this.methodologies.get(id);
  }
  
  async getMethodologyByName(name: string): Promise<Methodology | undefined> {
    return Array.from(this.methodologies.values()).find(
      (methodology) => methodology.name === name
    );
  }
  
  async createMethodology(methodology: InsertMethodology): Promise<Methodology> {
    const id = this.methodologyIdCounter++;
    const newMethodology: Methodology = { ...methodology, id };
    this.methodologies.set(id, newMethodology);
    return newMethodology;
  }
  
  async listMethodologies(): Promise<Methodology[]> {
    return Array.from(this.methodologies.values());
  }
  
  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async getProjectByProjectId(projectId: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(
      (project) => project.projectId === projectId
    );
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const createdAt = new Date();
    const newProject: Project = { ...project, id, createdAt };
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async listProjectsByStatus(status: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.status === status
    );
  }
  
  async listProjectsByDeveloper(developer: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.developer === developer
    );
  }
  
  // Verification Stage operations
  async getVerificationStage(id: number): Promise<VerificationStage | undefined> {
    return this.verificationStages.get(id);
  }
  
  async createVerificationStage(stage: InsertVerificationStage): Promise<VerificationStage> {
    const id = this.verificationStageIdCounter++;
    const newStage: VerificationStage = { ...stage, id };
    this.verificationStages.set(id, newStage);
    return newStage;
  }
  
  async listVerificationStages(): Promise<VerificationStage[]> {
    return Array.from(this.verificationStages.values()).sort((a, b) => a.order - b.order);
  }
  
  // Project Verification operations
  async getProjectVerification(id: number): Promise<ProjectVerification | undefined> {
    return this.projectVerifications.get(id);
  }
  
  async getProjectVerificationByProjectId(projectId: string): Promise<ProjectVerification | undefined> {
    return Array.from(this.projectVerifications.values()).find(
      (verification) => verification.projectId === projectId
    );
  }
  
  async createProjectVerification(verification: InsertProjectVerification): Promise<ProjectVerification> {
    const id = this.projectVerificationIdCounter++;
    const submittedDate = new Date();
    const newVerification: ProjectVerification = { 
      ...verification, 
      id, 
      submittedDate,
      completedDate: undefined
    };
    this.projectVerifications.set(id, newVerification);
    return newVerification;
  }
  
  async updateProjectVerification(id: number, verification: Partial<InsertProjectVerification>): Promise<ProjectVerification | undefined> {
    const existingVerification = this.projectVerifications.get(id);
    if (!existingVerification) return undefined;
    
    const updatedVerification: ProjectVerification = { ...existingVerification, ...verification };
    this.projectVerifications.set(id, updatedVerification);
    return updatedVerification;
  }
  
  async listProjectVerifications(): Promise<ProjectVerification[]> {
    return Array.from(this.projectVerifications.values());
  }
  
  async listProjectVerificationsByStatus(status: string): Promise<ProjectVerification[]> {
    return Array.from(this.projectVerifications.values()).filter(
      (verification) => verification.status === status
    );
  }
  
  // Carbon Credit operations
  async getCarbonCredit(id: number): Promise<CarbonCredit | undefined> {
    return this.carbonCredits.get(id);
  }
  
  async getCarbonCreditBySerialNumber(serialNumber: string): Promise<CarbonCredit | undefined> {
    return Array.from(this.carbonCredits.values()).find(
      (credit) => credit.serialNumber === serialNumber
    );
  }
  
  async createCarbonCredit(credit: InsertCarbonCredit): Promise<CarbonCredit> {
    const id = this.carbonCreditIdCounter++;
    const issuanceDate = new Date();
    const newCredit: CarbonCredit = { 
      ...credit, 
      id, 
      issuanceDate,
      retirementDate: undefined 
    };
    this.carbonCredits.set(id, newCredit);
    return newCredit;
  }
  
  async updateCarbonCredit(id: number, credit: Partial<InsertCarbonCredit>): Promise<CarbonCredit | undefined> {
    const existingCredit = this.carbonCredits.get(id);
    if (!existingCredit) return undefined;
    
    const updatedCredit: CarbonCredit = { ...existingCredit, ...credit };
    if (credit.status === "retired" && !existingCredit.retirementDate) {
      updatedCredit.retirementDate = new Date();
    }
    this.carbonCredits.set(id, updatedCredit);
    return updatedCredit;
  }
  
  async listCarbonCredits(): Promise<CarbonCredit[]> {
    return Array.from(this.carbonCredits.values());
  }
  
  async listCarbonCreditsByProjectId(projectId: string): Promise<CarbonCredit[]> {
    return Array.from(this.carbonCredits.values()).filter(
      (credit) => credit.projectId === projectId
    );
  }
  
  async listCarbonCreditsByOwner(owner: string): Promise<CarbonCredit[]> {
    return Array.from(this.carbonCredits.values()).filter(
      (credit) => credit.owner === owner
    );
  }
  
  // Activity Log operations
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogIdCounter++;
    const timestamp = new Date();
    const newLog: ActivityLog = { ...log, id, timestamp };
    this.activityLogs.set(id, newLog);
    return newLog;
  }
  
  async listActivityLogs(limit?: number): Promise<ActivityLog[]> {
    const logs = Array.from(this.activityLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return limit ? logs.slice(0, limit) : logs;
  }
  
  // Statistics operations
  async getStatistics(): Promise<Statistics | undefined> {
    return this.stats;
  }
  
  async updateStatistics(stats: Partial<InsertStatistics>): Promise<Statistics | undefined> {
    if (!this.stats) return undefined;
    
    this.stats = {
      ...this.stats,
      ...stats,
      lastUpdated: new Date()
    };
    
    return this.stats;
  }
}

export const storage = new MemStorage();
