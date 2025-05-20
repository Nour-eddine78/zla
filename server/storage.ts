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
  type InsertActivity,
  type ConnectionLog,
  type InsertConnectionLog
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
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
  
  // Activities - User actions tracking
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByUser(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Connection logs - User connections tracking
  getConnectionLogs(limit?: number): Promise<ConnectionLog[]>;
  getConnectionLogsByUser(userId: number, limit?: number): Promise<ConnectionLog[]>;
  createConnectionLog(log: InsertConnectionLog): Promise<ConnectionLog>;
  updateConnectionLogOnLogout(userId: number): Promise<ConnectionLog | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private machines: Map<number, Machine>;
  private operations: Map<number, Operation>;
  private safetyIncidents: Map<number, SafetyIncident>;
  private documents: Map<number, Document>;
  private activities: Map<number, Activity>;
  private connectionLogs: Map<number, ConnectionLog>;
  
  private userIdCounter: number;
  private machineIdCounter: number;
  private operationIdCounter: number;
  private safetyIncidentIdCounter: number;
  private documentIdCounter: number;
  private activityIdCounter: number;
  private connectionLogIdCounter: number;

  constructor() {
    this.users = new Map();
    this.machines = new Map();
    this.operations = new Map();
    this.safetyIncidents = new Map();
    this.documents = new Map();
    this.activities = new Map();
    this.connectionLogs = new Map();
    
    this.userIdCounter = 1;
    this.machineIdCounter = 1;
    this.operationIdCounter = 1;
    this.safetyIncidentIdCounter = 1;
    this.documentIdCounter = 1;
    this.activityIdCounter = 1;
    this.connectionLogIdCounter = 1;
    
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
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
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
    const user: User = { 
      ...insertUser, 
      id, 
      lastLogin: null,
      role: insertUser.role || 'supervisor' // Ensure role is set with default
    };
    this.users.set(id, user);
    
    // Create activity for user creation
    this.createActivity({
      type: "user_created",
      description: `Nouvel utilisateur créé: ${insertUser.username} (${insertUser.role})`,
      userId: 1, // Admin ID typically
      relatedEntityId: id,
      relatedEntityType: "user"
    });
    
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      // Ensure these fields can't be updated inappropriately
      id: user.id,
    };
    
    this.users.set(id, updatedUser);
    
    // Create activity for user update
    this.createActivity({
      type: "user_updated",
      description: `Utilisateur ${user.username} mis à jour`,
      userId: 1, // Admin ID typically
      relatedEntityId: id,
      relatedEntityType: "user"
    });
    
    return updatedUser;
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
  
  async deleteUser(id: number): Promise<boolean> {
    // Cannot delete if it's the last admin
    const user = this.users.get(id);
    if (!user) return false;
    
    if (user.role === 'admin') {
      const admins = Array.from(this.users.values()).filter(u => u.role === 'admin');
      if (admins.length <= 1) {
        return false; // Can't delete the last admin
      }
    }
    
    const deleted = this.users.delete(id);
    
    if (deleted) {
      // Create activity for user deletion
      this.createActivity({
        type: "user_deleted",
        description: `Utilisateur ${user.username} supprimé`,
        userId: 1, // Admin ID typically
        relatedEntityId: id,
        relatedEntityType: "user"
      });
    }
    
    return deleted;
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
      .sort((a, b) => {
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        return bTime - aTime;
      });
    
    if (limit) {
      return activities.slice(0, limit);
    }
    
    return activities;
  }
  
  async getActivitiesByUser(userId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        return bTime - aTime;
      });
    
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
      timestamp: new Date(),
      relatedEntityId: activity.relatedEntityId || null,
      relatedEntityType: activity.relatedEntityType || null,
      ipAddress: activity.ipAddress || null,
      actionStatus: activity.actionStatus || 'success'
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Connection logs methods
  async getConnectionLogs(limit?: number): Promise<ConnectionLog[]> {
    const logs = Array.from(this.connectionLogs.values())
      .sort((a, b) => {
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        return bTime - aTime;
      });
    
    if (limit) {
      return logs.slice(0, limit);
    }
    
    return logs;
  }
  
  async getConnectionLogsByUser(userId: number, limit?: number): Promise<ConnectionLog[]> {
    const logs = Array.from(this.connectionLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => {
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        return bTime - aTime;
      });
    
    if (limit) {
      return logs.slice(0, limit);
    }
    
    return logs;
  }
  
  async createConnectionLog(log: InsertConnectionLog): Promise<ConnectionLog> {
    const id = this.connectionLogIdCounter++;
    const newLog: ConnectionLog = { 
      ...log, 
      id,
      timestamp: new Date(),
      logoutTime: null,
      sessionDuration: null
    };
    this.connectionLogs.set(id, newLog);
    
    // Update user last login
    if (log.userId) {
      this.updateUserLastLogin(log.userId);
    }
    
    return newLog;
  }
  
  async updateConnectionLogOnLogout(userId: number): Promise<ConnectionLog | undefined> {
    // Find the most recent log for this user that doesn't have a logout time
    const userLogs = Array.from(this.connectionLogs.values())
      .filter(log => log.userId === userId && !log.logoutTime)
      .sort((a, b) => {
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        return bTime - aTime;
      });
    
    if (userLogs.length === 0) return undefined;
    
    const lastLog = userLogs[0];
    const now = new Date();
    const sessionDuration = lastLog.timestamp 
      ? Math.floor((now.getTime() - lastLog.timestamp.getTime()) / 1000) 
      : 0;
    
    const updatedLog = {
      ...lastLog,
      logoutTime: now,
      sessionDuration
    };
    
    this.connectionLogs.set(lastLog.id, updatedLog);
    return updatedLog;
  }
}

export const storage = new MemStorage();
