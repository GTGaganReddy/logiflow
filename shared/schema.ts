import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customerLoads = sqliteTable("customer_loads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slNo: text("sl_no").notNull(),
  customerName: text("customer_name").notNull(),
  location: text("location"),
  algoAssignedResource: text("algo_assigned_resource"),
  humanReservedResource: text("human_reserved_resource"),
  priority: text("priority").notNull(),
  remark: text("remark"),
  remarkPriority: text("remark_priority"),
  aiAcceptanceCount: integer("ai_acceptance_count").notNull().default(0),
  incentivePoints: integer("incentive_points").notNull().default(0),
  createdAt: text("created_at").notNull(),
  deliveryStartDate: text("delivery_start_date"),
  deliveryEndDate: text("delivery_end_date"),
  deliveryStartTime: text("delivery_start_time"),
  deliveryEndTime: text("delivery_end_time"),
  deliveryStatus: text("delivery_status").notNull().default("pending"),
  aiSuggestionAccepted: integer("ai_suggestion_accepted", { mode: "boolean" }).default(false),
  aiSuggestionResource: text("ai_suggestion_resource"),
  aiAssistantId: text("ai_assistant_id"),
});

export const journeyMilestones = sqliteTable("journey_milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerLoadId: integer("customer_load_id").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  startingPoint: text("starting_point").notNull(),
  endingPoint: text("ending_point").notNull(),
  startDate: text("start_date").notNull(),
  startTime: text("start_time").notNull(),
  endDate: text("end_date").notNull(),
  endTime: text("end_time").notNull(),
  breakTime: text("break_time"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
});

export const trucks = sqliteTable("trucks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plateNumber: text("plate_number").notNull().unique(),
  status: text("status").notNull(),
  assignedTo: text("assigned_to"),
});

export const notepad = sqliteTable("notepad", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertCustomerLoadSchema = createInsertSchema(customerLoads).omit({
  id: true,
  createdAt: true,
});

export const insertJourneyMilestoneSchema = createInsertSchema(journeyMilestones).omit({
  id: true,
});

export const insertTruckSchema = createInsertSchema(trucks).omit({
  id: true,
});

export const insertNotepadSchema = createInsertSchema(notepad).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type CustomerLoad = typeof customerLoads.$inferSelect;
export type InsertCustomerLoad = z.infer<typeof insertCustomerLoadSchema>;
export type JourneyMilestone = typeof journeyMilestones.$inferSelect;
export type InsertJourneyMilestone = z.infer<typeof insertJourneyMilestoneSchema>;
export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Notepad = typeof notepad.$inferSelect;
export type InsertNotepad = z.infer<typeof insertNotepadSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
