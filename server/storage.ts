import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  customerLoads,
  trucks,
  notepad,
  journeyMilestones,
  type User,
  type InsertUser,
  type CustomerLoad,
  type InsertCustomerLoad,
  type Truck,
  type InsertTruck,
  type Notepad,
  type JourneyMilestone,
  type InsertJourneyMilestone,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCustomerLoads(): Promise<CustomerLoad[]>;
  getCustomerLoad(id: number): Promise<CustomerLoad | undefined>;
  getCustomerLoadByName(customerName: string): Promise<CustomerLoad | undefined>;
  createCustomerLoad(load: InsertCustomerLoad): Promise<CustomerLoad>;
  updateCustomerLoad(id: number, load: Partial<InsertCustomerLoad>): Promise<CustomerLoad | undefined>;
  deleteCustomerLoad(id: number): Promise<boolean>;

  getTrucks(): Promise<Truck[]>;
  getTruck(id: number): Promise<Truck | undefined>;
  createTruck(truck: InsertTruck): Promise<Truck>;
  updateTruck(id: number, truck: Partial<InsertTruck>): Promise<Truck | undefined>;
  deleteTruck(id: number): Promise<boolean>;

  getNotepad(): Promise<Notepad | undefined>;
  updateNotepad(content: string): Promise<Notepad>;

  getJourneyMilestones(customerLoadId: number): Promise<JourneyMilestone[]>;
  createJourneyMilestone(milestone: InsertJourneyMilestone): Promise<JourneyMilestone>;
  updateJourneyMilestone(id: number, milestone: Partial<InsertJourneyMilestone>): Promise<JourneyMilestone | undefined>;
  deleteJourneyMilestone(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomerLoads(): Promise<CustomerLoad[]> {
    return await db.select().from(customerLoads);
  }

  async getCustomerLoad(id: number): Promise<CustomerLoad | undefined> {
    const [load] = await db.select().from(customerLoads).where(eq(customerLoads.id, id));
    return load;
  }

  async getCustomerLoadByName(customerName: string): Promise<CustomerLoad | undefined> {
    const [load] = await db.select().from(customerLoads).where(eq(customerLoads.customerName, customerName));
    return load;
  }

  async createCustomerLoad(insertLoad: InsertCustomerLoad): Promise<CustomerLoad> {
    const [load] = await db
      .insert(customerLoads)
      .values({
        ...insertLoad,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return load;
  }

  async updateCustomerLoad(id: number, updateData: Partial<InsertCustomerLoad>): Promise<CustomerLoad | undefined> {
    const [load] = await db
      .update(customerLoads)
      .set(updateData)
      .where(eq(customerLoads.id, id))
      .returning();
    return load;
  }

  async deleteCustomerLoad(id: number): Promise<boolean> {
    const result = await db.delete(customerLoads).where(eq(customerLoads.id, id)).returning();
    return result.length > 0;
  }

  async getTrucks(): Promise<Truck[]> {
    return await db.select().from(trucks);
  }

  async getTruck(id: number): Promise<Truck | undefined> {
    const [truck] = await db.select().from(trucks).where(eq(trucks.id, id));
    return truck;
  }

  async createTruck(insertTruck: InsertTruck): Promise<Truck> {
    const [truck] = await db.insert(trucks).values(insertTruck).returning();
    return truck;
  }

  async updateTruck(id: number, updateData: Partial<InsertTruck>): Promise<Truck | undefined> {
    const [truck] = await db
      .update(trucks)
      .set(updateData)
      .where(eq(trucks.id, id))
      .returning();
    return truck;
  }

  async deleteTruck(id: number): Promise<boolean> {
    const result = await db.delete(trucks).where(eq(trucks.id, id)).returning();
    return result.length > 0;
  }

  async getNotepad(): Promise<Notepad | undefined> {
    const results = await db.select().from(notepad);
    return results[0];
  }

  async updateNotepad(content: string): Promise<Notepad> {
    const updatedAt = new Date().toISOString();
    const existing = await this.getNotepad();

    if (existing) {
      const [updated] = await db
        .update(notepad)
        .set({ content, updatedAt })
        .where(eq(notepad.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(notepad)
        .values({ content, updatedAt })
        .returning();
      return created;
    }
  }

  async getJourneyMilestones(customerLoadId: number): Promise<JourneyMilestone[]> {
    return await db
      .select()
      .from(journeyMilestones)
      .where(eq(journeyMilestones.customerLoadId, customerLoadId));
  }

  async createJourneyMilestone(insertMilestone: InsertJourneyMilestone): Promise<JourneyMilestone> {
    const [milestone] = await db
      .insert(journeyMilestones)
      .values(insertMilestone)
      .returning();
    return milestone;
  }

  async updateJourneyMilestone(id: number, updateData: Partial<InsertJourneyMilestone>): Promise<JourneyMilestone | undefined> {
    const [milestone] = await db
      .update(journeyMilestones)
      .set(updateData)
      .where(eq(journeyMilestones.id, id))
      .returning();
    return milestone;
  }

  async deleteJourneyMilestone(id: number): Promise<boolean> {
    const result = await db.delete(journeyMilestones).where(eq(journeyMilestones.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
