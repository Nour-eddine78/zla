import { pgTable, text, serial, integer, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'supervisor']);
export const machineStateEnum = pgEnum('machine_state', ['running', 'stopped']);
export const decapingMethodEnum = pgEnum('decaping_method', ['transport', 'poussage', 'casement']);
export const machineTypeEnum = pgEnum('machine_type', ['d11', '750011', '750012', 'ph1', 'ph2', '200b1', 'libhere', 'transwine', 'procaneq']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default('supervisor'),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
});

// Machines
export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: machineTypeEnum("type").notNull(),
  decapingMethod: decapingMethodEnum("decaping_method").notNull(),
  specifications: text("specifications"),
  currentState: machineStateEnum("current_state").default('running'),
  isActive: boolean("is_active").default(true),
});

export const insertMachineSchema = createInsertSchema(machines).omit({
  id: true,
});

// Operations
export const operations = pgTable("operations", {
  id: serial("id").primaryKey(),
  operationId: text("operation_id").notNull().unique(), // Format OP-YYYYMMDD-XXX
  date: timestamp("date").notNull(),
  decapingMethod: decapingMethodEnum("decaping_method").notNull(),
  machineId: integer("machine_id").notNull(),
  shift: integer("shift").notNull(), // 1, 2, or 3
  panel: text("panel").notNull(),
  section: text("section").notNull(), // Tranche
  level: text("level").notNull(),
  machineState: machineStateEnum("machine_state").notNull(),
  runningHours: real("running_hours").notNull(),
  stopHours: real("stop_hours").notNull(),
  excavatedVolume: real("excavated_volume").notNull(),
  observations: text("observations"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Method-specific fields
  // Transport
  dischargeDistance: real("discharge_distance"),
  truckCount: integer("truck_count"),
  excavatorCount: integer("excavator_count"),
  
  // Poussage
  bulldozerCount: integer("bulldozer_count"),
  equipmentState: text("equipment_state"),
  excavatedMeterage: real("excavated_meterage"),
  
  // Casement
  machineCount: integer("machine_count"),
  interventionType: text("intervention_type"),
});

export const insertOperationSchema = createInsertSchema(operations).omit({
  id: true,
  createdAt: true,
});

// Safety incidents
export const safetyIncidents = pgTable("safety_incidents", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  incidentType: text("incident_type").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  location: text("location").notNull(),
  reportedBy: integer("reported_by").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSafetyIncidentSchema = createInsertSchema(safetyIncidents).omit({
  id: true,
  createdAt: true,
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: real("file_size").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
  downloadUrl: text("download_url").notNull(),
  category: text("category").notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
});

// Activities - Track user actions
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
  ipAddress: text("ip_address"),
  actionStatus: text("action_status").default('success'),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

// Connection logs - Track user connections
export const connectionLogs = pgTable("connection_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  status: text("status").notNull().default('success'),
  logoutTime: timestamp("logout_time"),
  sessionDuration: integer("session_duration"),
});

export const insertConnectionLogSchema = createInsertSchema(connectionLogs).omit({
  id: true,
  timestamp: true,
  logoutTime: true,
  sessionDuration: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = z.infer<typeof insertMachineSchema>;

export type Operation = typeof operations.$inferSelect;
export type InsertOperation = z.infer<typeof insertOperationSchema>;

export type SafetyIncident = typeof safetyIncidents.$inferSelect;
export type InsertSafetyIncident = z.infer<typeof insertSafetyIncidentSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ConnectionLog = typeof connectionLogs.$inferSelect;
export type InsertConnectionLog = z.infer<typeof insertConnectionLogSchema>;
