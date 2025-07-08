import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerLoadSchema, insertTruckSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customer Loads routes
  app.get("/api/customer-loads", async (req, res) => {
    try {
      const loads = await storage.getCustomerLoads();
      res.json(loads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer loads" });
    }
  });

  app.get("/api/customer-loads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const load = await storage.getCustomerLoad(id);
      if (!load) {
        return res.status(404).json({ message: "Customer load not found" });
      }
      res.json(load);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer load" });
    }
  });

  app.post("/api/customer-loads", async (req, res) => {
    try {
      const validatedData = insertCustomerLoadSchema.parse(req.body);
      const load = await storage.createCustomerLoad(validatedData);
      res.status(201).json(load);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer load" });
    }
  });

  app.put("/api/customer-loads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerLoadSchema.partial().parse(req.body);
      const load = await storage.updateCustomerLoad(id, validatedData);
      if (!load) {
        return res.status(404).json({ message: "Customer load not found" });
      }
      res.json(load);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer load" });
    }
  });

  app.delete("/api/customer-loads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomerLoad(id);
      if (!success) {
        return res.status(404).json({ message: "Customer load not found" });
      }
      res.json({ message: "Customer load deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer load" });
    }
  });

  // Trucks routes
  app.get("/api/trucks", async (req, res) => {
    try {
      const trucks = await storage.getTrucks();
      res.json(trucks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trucks" });
    }
  });

  app.post("/api/trucks", async (req, res) => {
    try {
      const validatedData = insertTruckSchema.parse(req.body);
      const truck = await storage.createTruck(validatedData);
      res.status(201).json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create truck" });
    }
  });

  app.put("/api/trucks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTruckSchema.partial().parse(req.body);
      const truck = await storage.updateTruck(id, validatedData);
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
      res.json(truck);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update truck" });
    }
  });

  // Notepad routes
  app.get("/api/notepad", async (req, res) => {
    try {
      const notepad = await storage.getNotepad();
      res.json(notepad || { content: "", updatedAt: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notepad" });
    }
  });

  app.post("/api/notepad", async (req, res) => {
    try {
      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ message: "Content must be a string" });
      }
      const notepad = await storage.updateNotepad(content);
      res.json(notepad);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notepad" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const loads = await storage.getCustomerLoads();
      const trucks = await storage.getTrucks();
      
      const totalLoads = loads.length;
      const assigned = loads.filter(load => load.algoAssignedResource || load.humanReservedResource).length;
      const pending = loads.filter(load => !load.algoAssignedResource && !load.humanReservedResource).length;
      const highPriority = loads.filter(load => load.priority === 'High').length;
      
      const stats = {
        totalLoads,
        assigned,
        pending,
        highPriority,
        totalTrucks: trucks.length,
        availableTrucks: trucks.filter(truck => truck.status === 'available').length,
        busyTrucks: trucks.filter(truck => truck.status === 'busy').length,
        maintenanceTrucks: trucks.filter(truck => truck.status === 'maintenance').length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
