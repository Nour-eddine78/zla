import { 
  type User, 
  type InsertUser, 
  type Machine, 
  type InsertMachine,
  type Operation,
  type InsertOperation,
  type SafetyIncident,
  type InsertSafetyIncident,
  type Document,
  type InsertDocument,
  type Activity,
  type InsertActivity
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // Machines
  getMachines(): Promise<Machine[]>;
  getMachine(id: number): Promise<Machine | undefined>;
  getMachinesByMethod(method: string): Promise<Machine[]>;
  createMachine(machine: InsertMachine): Promise<Machine>;
  updateMachine(id: number, machine: Partial<Machine>): Promise<Machine | undefined>;
  
  // Operations
  getOperations(): Promise<Operation[]>;
  getOperation(id: number): Promise<Operation | undefined>;
  getOperationByOperationId(operationId: string): Promise<Operation | undefined>;
  createOperation(operation: InsertOperation): Promise<Operation>;
  updateOperation(id: number, operation: Partial<Operation>): Promise<Operation | undefined>;
  getOperationsByMethod(method: string): Promise<Operation[]>;
  
  // Safety Incidents
  getSafetyIncidents(): Promise<SafetyIncident[]>;
  getSafetyIncident(id: number): Promise<SafetyIncident | undefined>;
  createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident>;
  updateSafetyIncident(id: number, incident: Partial<SafetyIncident>): Promise<SafetyIncident | undefined>;
  
  // Documents
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private machines: Map<number, Machine>;
  private operations: Map<number, Operation>;
  private safetyIncidents: Map<number, SafetyIncident>;
  private documents: Map<number, Document>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private machineIdCounter: number;
  private operationIdCounter: number;
  private safetyIncidentIdCounter: number;
  private documentIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.machines = new Map();
    this.operations = new Map();
    this.safetyIncidents = new Map();
    this.documents = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.machineIdCounter = 1;
    this.operationIdCounter = 1;
    this.safetyIncidentIdCounter = 1;
    this.documentIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize with default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // Plain text for demo
      name: "Administrator",
      role: "admin"
    });
    
    // Initialize with a supervisor user
    this.createUser({
      username: "supervisor",
      password: "admin123", // Plain text for demo
      name: "Ahmed Bouhmidi",
      role: "supervisor"
    });
    
    // Initialize with some machine data
    this.initDefaultMachines();
    
    // Initialize with some documents
    this.initDefaultDocuments();
  }
  
  private initDefaultMachines() {
    // Bulldozer for Poussage
    this.createMachine({
      name: "Bulldozer D11-1",
      type: "d11",
      decapingMethod: "poussage",
      specifications: JSON.stringify({
        power: "850 HP",
        weight: "104.5 tonnes",
        blade: "4.6 m³"
      }),
      currentState: "running",
      isActive: true
    });
    
    // Excavator for Casement
    this.createMachine({
      name: "Excavatrice PH1",
      type: "ph1",
      decapingMethod: "casement",
      specifications: JSON.stringify({
        capacity: "15 m³",
        weight: "120 tonnes",
        reach: "18 m"
      }),
      currentState: "running",
      isActive: true
    });
    
    // Truck for Transport
    this.createMachine({
      name: "Transwine 777F",
      type: "transwine",
      decapingMethod: "transport",
      specifications: JSON.stringify({
        capacity: "90 tonnes",
        power: "1,000 HP",
        maxSpeed: "68 km/h"
      }),
      currentState: "stopped",
      isActive: true
    });
  }
  
  private initDefaultDocuments() {
    this.createDocument({
      title: "Manuel des Procédures",
      description: "Protocoles standards pour opérations de décapage",
      fileType: "pdf",
      fileSize: 5.2,
      lastUpdated: new Date("2025-01-12"),
      downloadUrl: "/documents/manuel-procedures.pdf",
      category: "procedures"
    });
    
    this.createDocument({
      title: "Guide HSE",
      description: "Normes de sécurité et environnement",
      fileType: "pdf",
      fileSize: 3.8,
      lastUpdated: new Date("2025-02-05"),
      downloadUrl: "/documents/guide-hse.pdf",
      category: "safety"
    });
    
    this.createDocument({
      title: "Catalogue Machines",
      description: "Fiches techniques et maintenance",
      fileType: "pdf",
      fileSize: 7.1,
      lastUpdated: new Date("2025-01-20"),
      downloadUrl: "/documents/catalogue-machines.pdf",
      category: "equipment"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, lastLogin: null };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      lastLogin: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Machine methods
  async getMachines(): Promise<Machine[]> {
    return Array.from(this.machines.values());
  }
  
  async getMachine(id: number): Promise<Machine | undefined> {
    return this.machines.get(id);
  }
  
  async getMachinesByMethod(method: string): Promise<Machine[]> {
    return Array.from(this.machines.values()).filter(
      (machine) => machine.decapingMethod === method
    );
  }
  
  async createMachine(machine: InsertMachine): Promise<Machine> {
    const id = this.machineIdCounter++;
    const newMachine: Machine = { ...machine, id };
    this.machines.set(id, newMachine);
    return newMachine;
  }
  
  async updateMachine(id: number, machineData: Partial<Machine>): Promise<Machine | undefined> {
    const machine = this.machines.get(id);
    if (!machine) return undefined;
    
    const updatedMachine = {
      ...machine,
      ...machineData
    };
    
    this.machines.set(id, updatedMachine);
    return updatedMachine;
  }
  
  // Operation methods
  async getOperations(): Promise<Operation[]> {
    return Array.from(this.operations.values());
  }
  
  async getOperation(id: number): Promise<Operation | undefined> {
    return this.operations.get(id);
  }
  
  async getOperationByOperationId(operationId: string): Promise<Operation | undefined> {
    return Array.from(this.operations.values()).find(
      (operation) => operation.operationId === operationId
    );
  }
  
  async createOperation(operation: InsertOperation): Promise<Operation> {
    const id = this.operationIdCounter++;
    const newOperation: Operation = { 
      ...operation, 
      id,
      createdAt: new Date()
    };
    this.operations.set(id, newOperation);
    
    // Create activity entry
    this.createActivity({
      type: "operation_created",
      description: `Operation ${operation.operationId} created for ${operation.decapingMethod}`,
      userId: operation.userId,
      relatedEntityId: id,
      relatedEntityType: "operation"
    });
    
    return newOperation;
  }
  
  async updateOperation(id: number, operationData: Partial<Operation>): Promise<Operation | undefined> {
    const operation = this.operations.get(id);
    if (!operation) return undefined;
    
    const updatedOperation = {
      ...operation,
      ...operationData
    };
    
    this.operations.set(id, updatedOperation);
    return updatedOperation;
  }
  
  async getOperationsByMethod(method: string): Promise<Operation[]> {
    return Array.from(this.operations.values()).filter(
      (operation) => operation.decapingMethod === method
    );
  }
  
  // Safety incident methods
  async getSafetyIncidents(): Promise<SafetyIncident[]> {
    return Array.from(this.safetyIncidents.values());
  }
  
  async getSafetyIncident(id: number): Promise<SafetyIncident | undefined> {
    return this.safetyIncidents.get(id);
  }
  
  async createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident> {
    const id = this.safetyIncidentIdCounter++;
    const newIncident: SafetyIncident = { 
      ...incident, 
      id,
      createdAt: new Date()
    };
    this.safetyIncidents.set(id, newIncident);
    
    // Create activity entry
    this.createActivity({
      type: "safety_incident_reported",
      description: `Safety incident reported: ${incident.incidentType}`,
      userId: incident.reportedBy,
      relatedEntityId: id,
      relatedEntityType: "safety_incident"
    });
    
    return newIncident;
  }
  
  async updateSafetyIncident(id: number, incidentData: Partial<SafetyIncident>): Promise<SafetyIncident | undefined> {
    const incident = this.safetyIncidents.get(id);
    if (!incident) return undefined;
    
    const updatedIncident = {
      ...incident,
      ...incidentData
    };
    
    this.safetyIncidents.set(id, updatedIncident);
    return updatedIncident;
  }
  
  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const newDocument: Document = { ...document, id };
    this.documents.set(id, newDocument);
    return newDocument;
  }
  
  // Activity methods
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (limit) {
      return activities.slice(0, limit);
    }
    
    return activities;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const newActivity: Activity = { 
      ...activity, 
      id,
      timestamp: new Date()
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

export const storage = new MemStorage();
