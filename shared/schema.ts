import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customerLoads = pgTable("customer_loads", {
  id: serial("id").primaryKey(),
  slNo: text("sl_no").notNull(),
  customerName: text("customer_name").notNull(),
  location: text("location"),
  algoAssignedResource: text("algo_assigned_resource"),
  humanReservedResource: text("human_reserved_resource"),
  priority: text("priority").notNull(),
  remark: text("remark"),
  createdAt: text("created_at").notNull(),
  deliveryDate: text("delivery_date"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  deliveryStatus: text("delivery_status").notNull().default("pending"), // pending, in-progress, completed, cancelled
});

export const trucks = pgTable("trucks", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  status: text("status").notNull(), // 'available', 'busy', 'maintenance'
  assignedTo: text("assigned_to"),
});

export const notepad = pgTable("notepad", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertCustomerLoadSchema = createInsertSchema(customerLoads).omit({
  id: true,
  createdAt: true,
});

export const insertTruckSchema = createInsertSchema(trucks).omit({
  id: true,
});

export const insertNotepadSchema = createInsertSchema(notepad).omit({
  id: true,
});

export type CustomerLoad = typeof customerLoads.$inferSelect;
export type InsertCustomerLoad = z.infer<typeof insertCustomerLoadSchema>;
export type Truck = typeof trucks.$inferSelect;
export type InsertTruck = z.infer<typeof insertTruckSchema>;
export type Notepad = typeof notepad.$inferSelect;
export type InsertNotepad = z.infer<typeof insertNotepadSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
