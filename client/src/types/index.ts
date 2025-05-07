export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  organization?: string;
}

export interface ProjectCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
}

export interface Methodology {
  id: number;
  name: string;
  description?: string;
  category: string;
  documentUrl?: string;
}

export interface Project {
  id: number;
  projectId: string;
  name: string;
  description: string;
  category: string;
  methodology: string;
  developer: string;
  location: string;
  coordinates?: { type: string; coordinates: number[] };
  longitude?: string;
  latitude?: string;
  startDate: string;
  endDate: string;
  status: "draft" | "registered" | "verified" | "rejected";
  estimatedReduction: number;
  imageUrl?: string;
  createdAt: string;
}

export interface VerificationStage {
  id: number;
  name: string;
  description?: string;
  order: number;
}

export interface ProjectVerification {
  id: number;
  projectId: string;
  verifier?: string;
  currentStage: number;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  estimatedCompletionDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface CarbonCredit {
  id: number;
  serialNumber: string;
  projectId: string;
  vintage: string;
  quantity: number;
  status: "available" | "retired" | "transferred";
  issuanceDate: string;
  retirementDate?: string;
  owner: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  entityType: string;
  entityId: string;
  userId: number;
  timestamp: string;
}

export interface Statistics {
  id: number;
  totalProjects: number;
  verifiedProjects: number;
  pendingVerification: number;
  totalCredits: number;
  lastUpdated: string;
}

export interface StatCard {
  title: string;
  value: number | string;
  percentChange?: number;
  icon: string;
  color: string;
  prefix?: string;
  suffix?: string;
}

export interface NavigationItem {
  title: string;
  icon: string;
  href: string;
}
