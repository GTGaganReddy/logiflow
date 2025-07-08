import { users, customerLoads, trucks, notepad, type User, type InsertUser, type CustomerLoad, type InsertCustomerLoad, type Truck, type InsertTruck, type Notepad, type InsertNotepad } from "@shared/schema";
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

interface DataStore {
  customerLoads: CustomerLoad[];
  trucks: Truck[];
  notepad: Notepad[];
  users: User[];
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer Loads
  getCustomerLoads(): Promise<CustomerLoad[]>;
  getCustomerLoad(id: number): Promise<CustomerLoad | undefined>;
  createCustomerLoad(load: InsertCustomerLoad): Promise<CustomerLoad>;
  updateCustomerLoad(id: number, load: Partial<InsertCustomerLoad>): Promise<CustomerLoad | undefined>;
  deleteCustomerLoad(id: number): Promise<boolean>;
  
  // Trucks
  getTrucks(): Promise<Truck[]>;
  getTruck(id: number): Promise<Truck | undefined>;
  createTruck(truck: InsertTruck): Promise<Truck>;
  updateTruck(id: number, truck: Partial<InsertTruck>): Promise<Truck | undefined>;
  deleteTruck(id: number): Promise<boolean>;
  
  // Notepad
  getNotepad(): Promise<Notepad | undefined>;
  updateNotepad(content: string): Promise<Notepad>;
}

export class MemStorage implements IStorage {
  private data!: DataStore;
  private currentIds: { [key: string]: number };

  constructor() {
    this.currentIds = {
      users: 1,
      customerLoads: 1,
      trucks: 1,
      notepad: 1
    };
    this.loadData();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        
        // Update current IDs to prevent conflicts
        this.currentIds.users = this.data.users.length > 0 ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
        this.currentIds.customerLoads = this.data.customerLoads.length > 0 ? Math.max(...this.data.customerLoads.map(l => l.id)) + 1 : 1;
        this.currentIds.trucks = this.data.trucks.length > 0 ? Math.max(...this.data.trucks.map(t => t.id)) + 1 : 1;
        this.currentIds.notepad = this.data.notepad.length > 0 ? Math.max(...this.data.notepad.map(n => n.id)) + 1 : 1;
      } else {
        this.data = {
          customerLoads: [],
          trucks: [],
          notepad: [],
          users: []
        };
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = {
        customerLoads: [],
        trucks: [],
        notepad: [],
        users: []
      };
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.data.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  async getCustomerLoads(): Promise<CustomerLoad[]> {
    return this.data.customerLoads;
  }

  async getCustomerLoad(id: number): Promise<CustomerLoad | undefined> {
    return this.data.customerLoads.find(load => load.id === id);
  }

  async createCustomerLoad(insertLoad: InsertCustomerLoad): Promise<CustomerLoad> {
    const id = this.currentIds.customerLoads++;
    const load: CustomerLoad = { 
      ...insertLoad, 
      id,
      location: insertLoad.location || null,
      algoAssignedResource: insertLoad.algoAssignedResource || null,
      humanReservedResource: insertLoad.humanReservedResource || null,
      remark: insertLoad.remark || null,
      createdAt: new Date().toISOString(),
      deliveryDate: insertLoad.deliveryDate || null,
      startTime: insertLoad.startTime || null,
      endTime: insertLoad.endTime || null,
      deliveryStatus: insertLoad.deliveryStatus || "pending"
    };
    this.data.customerLoads.push(load);
    this.saveData();
    return load;
  }

  async updateCustomerLoad(id: number, updateData: Partial<InsertCustomerLoad>): Promise<CustomerLoad | undefined> {
    const index = this.data.customerLoads.findIndex(load => load.id === id);
    if (index === -1) return undefined;
    
    this.data.customerLoads[index] = { ...this.data.customerLoads[index], ...updateData };
    this.saveData();
    return this.data.customerLoads[index];
  }

  async deleteCustomerLoad(id: number): Promise<boolean> {
    const index = this.data.customerLoads.findIndex(load => load.id === id);
    if (index === -1) return false;
    
    this.data.customerLoads.splice(index, 1);
    this.saveData();
    return true;
  }

  async getTrucks(): Promise<Truck[]> {
    return this.data.trucks;
  }

  async getTruck(id: number): Promise<Truck | undefined> {
    return this.data.trucks.find(truck => truck.id === id);
  }

  async createTruck(insertTruck: InsertTruck): Promise<Truck> {
    const id = this.currentIds.trucks++;
    const truck: Truck = { 
      ...insertTruck, 
      id,
      assignedTo: insertTruck.assignedTo || null
    };
    this.data.trucks.push(truck);
    this.saveData();
    return truck;
  }

  async updateTruck(id: number, updateData: Partial<InsertTruck>): Promise<Truck | undefined> {
    const index = this.data.trucks.findIndex(truck => truck.id === id);
    if (index === -1) return undefined;
    
    this.data.trucks[index] = { ...this.data.trucks[index], ...updateData };
    this.saveData();
    return this.data.trucks[index];
  }

  async deleteTruck(id: number): Promise<boolean> {
    const index = this.data.trucks.findIndex(truck => truck.id === id);
    if (index === -1) return false;
    
    this.data.trucks.splice(index, 1);
    this.saveData();
    return true;
  }

  async getNotepad(): Promise<Notepad | undefined> {
    return this.data.notepad[0];
  }

  async updateNotepad(content: string): Promise<Notepad> {
    const updatedAt = new Date().toISOString();
    
    if (this.data.notepad.length === 0) {
      const id = this.currentIds.notepad++;
      const notepad: Notepad = { id, content, updatedAt };
      this.data.notepad.push(notepad);
    } else {
      this.data.notepad[0] = { ...this.data.notepad[0], content, updatedAt };
    }
    
    this.saveData();
    return this.data.notepad[0];
  }
}

export const storage = new MemStorage();
