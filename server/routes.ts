import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerLoadSchema, insertTruckSchema, insertJourneyMilestoneSchema } from "@shared/schema";
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

  // External API endpoint for GPT agent integration
  app.post("/api/external/customer-loads", async (req, res) => {
    try {
      // Allow external requests from GPT agents
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      
      const { customerName, location, priority, deliveryStartDate, deliveryEndDate, deliveryStartTime, deliveryEndTime, remark, algoAssignedResource, humanReservedResource } = req.body;
      
      if (!customerName || !priority) {
        return res.status(400).json({ 
          message: "Customer name and priority are required",
          example: {
            customerName: "ABC Corp",
            location: "New York",
            priority: "High",
            deliveryStartDate: "2025-07-10",
            deliveryEndDate: "2025-07-11",
            deliveryStartTime: "09:00",
            deliveryEndTime: "17:00",
            remark: "Urgent delivery",
            algoAssignedResource: "TRK-001",
            humanReservedResource: ""
          }
        });
      }

      // Get current loads to generate serial number
      const loads = await storage.getCustomerLoads();
      const slNo = String(loads.length + 1).padStart(3, '0');
      
      const loadData = {
        slNo,
        customerName,
        location: location || "",
        priority,
        deliveryStartDate: deliveryStartDate || "",
        deliveryEndDate: deliveryEndDate || "",
        deliveryStartTime: deliveryStartTime || "",
        deliveryEndTime: deliveryEndTime || "",
        remark: remark || "",
        algoAssignedResource: algoAssignedResource || "",
        humanReservedResource: humanReservedResource || "",
        deliveryStatus: "pending"
      };

      const validatedData = insertCustomerLoadSchema.parse(loadData);
      const load = await storage.createCustomerLoad(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Customer load created successfully",
        data: load
      });
    } catch (error) {
      console.error("External API error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid data format", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        success: false,
        message: "Failed to create customer load" 
      });
    }
  });

  // External API endpoint for updating delivery status
  app.put("/api/external/customer-loads/:id/status", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      
      const id = parseInt(req.params.id);
      const { deliveryStatus, deliveryStartTime, deliveryEndTime } = req.body;
      
      if (!deliveryStatus || !["pending", "in-progress", "completed", "cancelled"].includes(deliveryStatus)) {
        return res.status(400).json({ 
          success: false,
          message: "Valid delivery status is required (pending, in-progress, completed, cancelled)" 
        });
      }

      const updateData: any = { deliveryStatus };
      if (deliveryStartTime) updateData.deliveryStartTime = deliveryStartTime;
      if (deliveryEndTime) updateData.deliveryEndTime = deliveryEndTime;
      
      const load = await storage.updateCustomerLoad(id, updateData);
      if (!load) {
        return res.status(404).json({ 
          success: false,
          message: "Customer load not found" 
        });
      }
      
      res.json({
        success: true,
        message: "Delivery status updated successfully",
        data: load
      });
    } catch (error) {
      console.error("External API error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to update delivery status" 
      });
    }
  });

  // External API endpoint for retrieving loads
  app.get("/api/external/customer-loads", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      const loads = await storage.getCustomerLoads();
      res.json({
        success: true,
        data: loads
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch customer loads" 
      });
    }
  });

  // Journey Milestones routes
  app.get("/api/journey-milestones/:customerLoadId", async (req, res) => {
    try {
      const customerLoadId = parseInt(req.params.customerLoadId);
      if (isNaN(customerLoadId)) {
        return res.status(400).json({ message: "Invalid customer load ID" });
      }
      
      const milestones = await storage.getJourneyMilestones(customerLoadId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching journey milestones:", error);
      res.status(500).json({ message: "Failed to fetch journey milestones" });
    }
  });

  app.post("/api/journey-milestones", async (req, res) => {
    try {
      const validation = insertJourneyMilestoneSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.issues });
      }
      
      const milestone = await storage.createJourneyMilestone(validation.data);
      res.json(milestone);
    } catch (error) {
      console.error("Error creating journey milestone:", error);
      res.status(500).json({ message: "Failed to create journey milestone" });
    }
  });

  app.put("/api/journey-milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }
      
      const validation = insertJourneyMilestoneSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.issues });
      }
      
      const milestone = await storage.updateJourneyMilestone(id, validation.data);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json(milestone);
    } catch (error) {
      console.error("Error updating journey milestone:", error);
      res.status(500).json({ message: "Failed to update journey milestone" });
    }
  });

  app.delete("/api/journey-milestones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }
      
      const success = await storage.deleteJourneyMilestone(id);
      if (!success) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting journey milestone:", error);
      res.status(500).json({ message: "Failed to delete journey milestone" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
