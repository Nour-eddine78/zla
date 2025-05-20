import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertMachineSchema, 
  insertOperationSchema,
  insertSafetyIncidentSchema,
  insertDocumentSchema,
  insertActivitySchema
} from "@shared/schema";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "ocp_secret_key";

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Authentication required" });
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, compare passwords with bcrypt
      // For demo, we'll use a simple check
      const passwordMatch = user.password === password || 
        await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Update last login
      await storage.updateUserLastLogin(user.id);
      
      // Create token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.status(200).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Machines routes
  app.get("/api/machines", authenticateToken, async (req, res) => {
    try {
      const method = req.query.method as string | undefined;
      
      let machines;
      if (method) {
        machines = await storage.getMachinesByMethod(method);
      } else {
        machines = await storage.getMachines();
      }
      
      return res.status(200).json(machines);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/machines/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid machine ID" });
      }
      
      const machine = await storage.getMachine(id);
      
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      return res.status(200).json(machine);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/machines", authenticateToken, async (req: any, res) => {
    try {
      // Only admin can create machines
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      const validation = insertMachineSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid machine data", errors: validation.error.format() });
      }
      
      const machine = await storage.createMachine(validation.data);
      
      // Create activity log
      await storage.createActivity({
        type: "machine_created",
        description: `Machine ${machine.name} created`,
        userId: req.user.id,
        relatedEntityId: machine.id,
        relatedEntityType: "machine"
      });
      
      return res.status(201).json(machine);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/machines/:id", authenticateToken, async (req: any, res) => {
    try {
      // Only admin can update machines
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid machine ID" });
      }
      
      const machine = await storage.getMachine(id);
      
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      const updatedMachine = await storage.updateMachine(id, req.body);
      
      return res.status(200).json(updatedMachine);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Operations routes
  app.get("/api/operations", authenticateToken, async (req, res) => {
    try {
      const method = req.query.method as string | undefined;
      
      let operations;
      if (method) {
        operations = await storage.getOperationsByMethod(method);
      } else {
        operations = await storage.getOperations();
      }
      
      return res.status(200).json(operations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/operations/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid operation ID" });
      }
      
      const operation = await storage.getOperation(id);
      
      if (!operation) {
        return res.status(404).json({ message: "Operation not found" });
      }
      
      return res.status(200).json(operation);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/operations", authenticateToken, async (req: any, res) => {
    try {
      // Generate operation ID
      const date = new Date();
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      
      // Get the count of operations for today to create a sequential ID
      const operations = await storage.getOperations();
      const todayOperations = operations.filter(op => 
        op.operationId.startsWith(`OP-${dateStr}`)
      );
      
      const operationCount = todayOperations.length + 1;
      const operationId = `OP-${dateStr}-${String(operationCount).padStart(3, '0')}`;
      
      // Add user ID and operation ID to the request body
      const operationData = {
        ...req.body,
        userId: req.user.id,
        operationId
      };
      
      const validation = insertOperationSchema.safeParse(operationData);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid operation data", errors: validation.error.format() });
      }
      
      const operation = await storage.createOperation(validation.data);
      
      return res.status(201).json(operation);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/operations/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid operation ID" });
      }
      
      const operation = await storage.getOperation(id);
      
      if (!operation) {
        return res.status(404).json({ message: "Operation not found" });
      }
      
      // Only user who created the operation or admin can update it
      if (operation.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      const updatedOperation = await storage.updateOperation(id, req.body);
      
      // Create activity log
      await storage.createActivity({
        type: "operation_updated",
        description: `Operation ${operation.operationId} updated`,
        userId: req.user.id,
        relatedEntityId: operation.id,
        relatedEntityType: "operation"
      });
      
      return res.status(200).json(updatedOperation);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Safety incidents routes
  app.get("/api/safety-incidents", authenticateToken, async (req, res) => {
    try {
      const incidents = await storage.getSafetyIncidents();
      return res.status(200).json(incidents);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/safety-incidents/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid incident ID" });
      }
      
      const incident = await storage.getSafetyIncident(id);
      
      if (!incident) {
        return res.status(404).json({ message: "Safety incident not found" });
      }
      
      return res.status(200).json(incident);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/safety-incidents", authenticateToken, async (req: any, res) => {
    try {
      const incidentData = {
        ...req.body,
        reportedBy: req.user.id
      };
      
      const validation = insertSafetyIncidentSchema.safeParse(incidentData);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid incident data", errors: validation.error.format() });
      }
      
      const incident = await storage.createSafetyIncident(validation.data);
      
      return res.status(201).json(incident);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Documents routes
  app.get("/api/documents", authenticateToken, async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      return res.status(200).json(documents);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/documents/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      return res.status(200).json(document);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Activities routes
  app.get("/api/activities", authenticateToken, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      return res.status(200).json(activities);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Dashboard statistics
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const operations = await storage.getOperations();
      const incidents = await storage.getSafetyIncidents();
      const machines = await storage.getMachines();
      
      // Calculate total excavated volume
      const totalVolume = operations.reduce((sum, op) => sum + op.excavatedVolume, 0);
      
      // Calculate machine availability
      const totalMachines = machines.length;
      const runningMachines = machines.filter(m => m.currentState === 'running').length;
      const availability = totalMachines > 0 ? (runningMachines / totalMachines * 100) : 0;
      
      // Calculate average yield
      const totalRunningHours = operations.reduce((sum, op) => sum + op.runningHours, 0);
      const averageYield = totalRunningHours > 0 ? (totalVolume / totalRunningHours) : 0;
      
      // Count safety incidents in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentIncidents = incidents.filter(inc => 
        new Date(inc.date) >= thirtyDaysAgo
      ).length;
      
      return res.status(200).json({
        totalExcavatedVolume: totalVolume,
        machineAvailability: availability,
        averageYield: averageYield,
        safetyIncidents30Days: recentIncidents
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Performance data for charts
  app.get("/api/performance/by-method", authenticateToken, async (req, res) => {
    try {
      const operations = await storage.getOperations();
      
      // Group by method and calculate average yield
      const methodStats = {
        transport: { volume: 0, hours: 0 },
        poussage: { volume: 0, hours: 0 },
        casement: { volume: 0, hours: 0 }
      };
      
      operations.forEach(op => {
        const method = op.decapingMethod;
        if (method in methodStats) {
          methodStats[method as keyof typeof methodStats].volume += op.excavatedVolume;
          methodStats[method as keyof typeof methodStats].hours += op.runningHours;
        }
      });
      
      // Calculate averages
      const result = {
        transport: methodStats.transport.hours > 0 ? methodStats.transport.volume / methodStats.transport.hours : 0,
        poussage: methodStats.poussage.hours > 0 ? methodStats.poussage.volume / methodStats.poussage.hours : 0,
        casement: methodStats.casement.hours > 0 ? methodStats.casement.volume / methodStats.casement.hours : 0
      };
      
      // Create 7-day trend data (mock data for demo)
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      
      const transportTrend = [45.2, 46.8, 45.7, 47.3, 46.5, 45.9, 46.2];
      const poussageTrend = [39.2, 38.5, 37.8, 39.1, 38.6, 39.2, 38.7];
      const casementTrend = [40.8, 41.2, 42.5, 41.7, 40.9, 41.3, 41.5];
      
      return res.status(200).json({
        averages: result,
        trend: {
          labels: days,
          datasets: [
            {
              method: 'transport',
              data: transportTrend
            },
            {
              method: 'poussage',
              data: poussageTrend
            },
            {
              method: 'casement',
              data: casementTrend
            }
          ]
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
