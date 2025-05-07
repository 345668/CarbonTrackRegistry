import { db } from "./db";
import { 
  users, 
  projectCategories, 
  methodologies, 
  projects, 
  verificationStages, 
  projectVerifications, 
  carbonCredits,
  activityLogs,
  statistics
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  try {
    // Empty the database first to avoid duplication
    await db.delete(activityLogs);
    await db.delete(carbonCredits);
    await db.delete(projectVerifications);
    await db.delete(projects);
    await db.delete(verificationStages);
    await db.delete(methodologies);
    await db.delete(projectCategories);
    await db.delete(users);
    await db.delete(statistics);

    console.log("Database cleared. Adding seed data...");

    // Seed Users
    const adminUser = await db.insert(users).values({
      username: "admin",
      password: "password123", // In a real app, this would be hashed
      email: "admin@carboncredits.org",
      fullName: "Admin User",
      role: "admin",
      organization: "Carbon Registry"
    }).returning();

    const verifier = await db.insert(users).values({
      username: "verifier",
      password: "password123", // In a real app, this would be hashed
      email: "verifier@carbonverify.org",
      fullName: "Verification Officer",
      role: "verifier",
      organization: "Carbon Verification Agency"
    }).returning();

    const developer = await db.insert(users).values({
      username: "developer",
      password: "password123", // In a real app, this would be hashed
      email: "developer@eco.org",
      fullName: "Project Developer",
      role: "project_developer",
      organization: "Eco Solutions"
    }).returning();

    console.log("Users added.");

    // Seed Project Categories
    await db.insert(projectCategories).values([
      {
        name: "Forestry",
        description: "Forest conservation, reforestation, and sustainable forest management",
        color: "green"
      },
      {
        name: "Renewable Energy",
        description: "Solar, wind, hydroelectric, and other clean energy projects",
        color: "blue"
      },
      {
        name: "Agriculture",
        description: "Sustainable farming practices and soil carbon sequestration",
        color: "amber"
      },
      {
        name: "Waste Management",
        description: "Methane capture, waste-to-energy, and recycling initiatives",
        color: "orange"
      }
    ]);

    console.log("Project categories added.");

    // Seed Methodologies
    await db.insert(methodologies).values([
      {
        name: "AR-ACM0003",
        description: "Afforestation and reforestation of lands except wetlands",
        category: "Forestry",
        documentUrl: "https://cdm.unfccc.int/methodologies/DB/C9QS5G3CS8FW04MYYXDFOQDPXWM4OE"
      },
      {
        name: "VM0006",
        description: "Carbon Accounting for Mosaic and Landscape-scale REDD Projects",
        category: "Forestry",
        documentUrl: "https://verra.org/methodology/vm0006-carbon-accounting-for-mosaic-and-landscape-scale-redd-projects-v2-2/"
      },
      {
        name: "ACM0002",
        description: "Grid-connected electricity generation from renewable sources",
        category: "Renewable Energy",
        documentUrl: "https://cdm.unfccc.int/methodologies/DB/XP2LKUSA61DKUQC0PIWPGWDN8ED5PG"
      },
      {
        name: "AMS-I.D",
        description: "Grid connected renewable electricity generation",
        category: "Renewable Energy",
        documentUrl: "https://cdm.unfccc.int/methodologies/DB/W3TINZ7KKWCK7L8WTXFQQOFQQH4SBK"
      },
      {
        name: "VM0017",
        description: "Adoption of Sustainable Agricultural Land Management",
        category: "Agriculture",
        documentUrl: "https://verra.org/methodology/vm0017-adoption-of-sustainable-agricultural-land-management-v1-0/"
      },
      {
        name: "AMS-III.F",
        description: "Avoidance of methane emissions through composting",
        category: "Waste Management",
        documentUrl: "https://cdm.unfccc.int/methodologies/DB/4AWES69H3J9E4A8S69F5DCQPO6U1XW"
      }
    ]);

    console.log("Methodologies added.");

    // Seed Verification Stages
    await db.insert(verificationStages).values([
      {
        name: "Data Validation",
        description: "Initial validation of project documentation and data",
        order: 1
      },
      {
        name: "Methodology Assessment",
        description: "Evaluation of the applied methodology and calculations",
        order: 2
      },
      {
        name: "Site Inspection",
        description: "Physical inspection of the project site and activities",
        order: 3
      },
      {
        name: "Stakeholder Consultation",
        description: "Gathering feedback from local stakeholders",
        order: 4
      },
      {
        name: "Final Review",
        description: "Final review and decision on project verification",
        order: 5
      }
    ]);

    console.log("Verification stages added.");

    // Seed Projects
    const project1 = await db.insert(projects).values({
      name: "Amazon Rainforest Conservation Initiative",
      description: "Conservation of 50,000 hectares of Amazon rainforest to prevent deforestation and protect biodiversity.",
      projectId: "BRA-2023-0001",
      category: "Forestry",
      methodology: "VM0006",
      developer: developer[0].username,
      location: "Para, Brazil",
      coordinates: JSON.stringify({ type: "Point", coordinates: [-52.5, -3.5] }),
      startDate: "2023-02-15",
      endDate: "2053-02-14",
      status: "verified",
      estimatedReduction: 1500000,
      imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"
    }).returning();

    const project2 = await db.insert(projects).values({
      name: "Kenya Reforestation Program",
      description: "Reforestation of degraded lands in Kenya with native tree species to restore ecosystem services and sequester carbon.",
      projectId: "KEN-2023-0045",
      category: "Forestry",
      methodology: "AR-ACM0003",
      developer: developer[0].username,
      location: "Nairobi, Kenya",
      coordinates: JSON.stringify({ type: "Point", coordinates: [36.8, -1.3] }),
      startDate: "2023-05-10",
      endDate: "2053-05-09",
      status: "verified",
      estimatedReduction: 850000,
      imageUrl: "https://images.unsplash.com/photo-1533647326420-d4097513dc42"
    }).returning();

    const project3 = await db.insert(projects).values({
      name: "Rural Solar Power Project",
      description: "Installation of solar panels in rural villages of India to provide clean energy and reduce dependency on fossil fuels.",
      projectId: "IND-2023-0078",
      category: "Renewable Energy",
      methodology: "AMS-I.D",
      developer: developer[0].username,
      location: "Tamil Nadu, India",
      coordinates: JSON.stringify({ type: "Point", coordinates: [78.4, 11.1] }),
      startDate: "2023-07-22",
      endDate: "2043-07-21",
      status: "registered",
      estimatedReduction: 350000,
      imageUrl: "https://images.unsplash.com/photo-1548168398-9ae7e0a9f629"
    }).returning();

    console.log("Projects added.");

    // Seed Statistics
    await db.insert(statistics).values({
      totalProjects: 3,
      verifiedProjects: 2,
      pendingVerification: 1,
      totalCredits: 75000
    });

    console.log("Statistics added.");

    // Add Verifications
    await db.insert(projectVerifications).values({
      projectId: project1[0].projectId,
      verifier: verifier[0].username,
      currentStage: 5,
      status: "approved",
      notes: "All verification requirements have been met. Project approved."
    });

    await db.insert(projectVerifications).values({
      projectId: project2[0].projectId,
      verifier: verifier[0].username,
      currentStage: 5,
      status: "approved",
      notes: "All verification requirements have been met. Project approved."
    });

    await db.insert(projectVerifications).values({
      projectId: project3[0].projectId,
      verifier: verifier[0].username,
      currentStage: 3,
      status: "pending",
      notes: "Site inspection scheduled."
    });

    console.log("Project verifications added.");

    // Seed Carbon Credits
    const generateSerialNumber = (projectId: string, batch: number, vintage: string) => {
      return `${projectId}-${vintage}-${batch.toString().padStart(6, '0')}`;
    };

    // Credits for Project 1
    await db.insert(carbonCredits).values({
      serialNumber: generateSerialNumber(project1[0].projectId, 1, "2023"),
      projectId: project1[0].projectId,
      vintage: "2023",
      quantity: 50000,
      status: "available",
      owner: developer[0].username
    });

    await db.insert(carbonCredits).values({
      serialNumber: generateSerialNumber(project1[0].projectId, 2, "2023"),
      projectId: project1[0].projectId,
      vintage: "2023",
      quantity: 25000,
      status: "retired",
      owner: developer[0].username
    });

    console.log("Carbon credits added.");

    // Seed Activity Logs
    await db.insert(activityLogs).values({
      action: "project_registered",
      description: `Project ${project1[0].name} registered`,
      entityType: "project",
      entityId: project1[0].projectId,
      userId: developer[0].id
    });

    await db.insert(activityLogs).values({
      action: "verification_approved",
      description: `Verification approved for project ${project1[0].name}`,
      entityType: "verification",
      entityId: project1[0].projectId,
      userId: verifier[0].id
    });

    await db.insert(activityLogs).values({
      action: "credit_issued",
      description: `75,000 credits issued for project ${project1[0].name}`,
      entityType: "credit",
      entityId: project1[0].projectId,
      userId: adminUser[0].id
    });

    console.log("Activity logs added.");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();