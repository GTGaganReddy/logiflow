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
      const aiAccepted = loads.reduce((sum, load) => sum + (load.aiAcceptanceCount || 0), 0);
      const totalIncentivePoints = loads.reduce((sum, load) => sum + (load.incentivePoints || 0), 0);
      
      const stats = {
        totalLoads,
        assigned,
        pending,
        highPriority,
        aiAccepted,
        totalIncentivePoints,
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

  // External API endpoint for retrieving notepad
  app.get("/api/external/notepad", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      const notepad = await storage.getNotepad();
      res.json({
        success: true,
        data: notepad || { content: "", updatedAt: new Date().toISOString() }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch notepad" 
      });
    }
  });

  // External API endpoint for updating notepad
  app.put("/api/external/notepad", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      
      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ 
          success: false,
          message: "Content must be a string" 
        });
      }
      
      const notepad = await storage.updateNotepad(content);
      res.json({
        success: true,
        message: "Notepad updated successfully",
        data: notepad
      });
    } catch (error) {
      console.error("External API error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to update notepad" 
      });
    }
  });

  // External API endpoint for retrieving all customer loads with journey milestones
  app.get("/api/external/customer-loads", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      const customerLoads = await storage.getCustomerLoads();
      
      // Get journey milestones for each customer load
      const loadsWithMilestones = await Promise.all(
        customerLoads.map(async (load) => {
          const milestones = await storage.getJourneyMilestones(load.id);
          return {
            ...load,
            journeyMilestones: milestones
          };
        })
      );
      
      res.json({
        success: true,
        data: loadsWithMilestones
      });
    } catch (error) {
      console.error("External API error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch customer loads" 
      });
    }
  });

  // External API endpoint for retrieving a specific customer load with journey milestones (by customer name)
  app.get("/api/external/customer-loads/:customerName", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      const customerName = decodeURIComponent(req.params.customerName);
      
      if (!customerName) {
        return res.status(400).json({
          success: false,
          message: "Customer name is required"
        });
      }
      
      const customerLoad = await storage.getCustomerLoadByName(customerName);
      if (!customerLoad) {
        return res.status(404).json({
          success: false,
          message: `Customer load not found for customer: ${customerName}`
        });
      }
      
      const milestones = await storage.getJourneyMilestones(customerLoad.id);
      const loadWithMilestones = {
        ...customerLoad,
        journeyMilestones: milestones
      };
      
      res.json({
        success: true,
        data: loadWithMilestones
      });
    } catch (error) {
      console.error("External API error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch customer load" 
      });
    }
  });

  // External API endpoint for creating or updating a customer load with optional journey milestones
  app.post("/api/external/customer-loads", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      
      const { journeyMilestones, PriorityAIsuggestion, ...loadData } = req.body;
      
      // Map alternative field names for easier API usage
      if (PriorityAIsuggestion && !loadData.remarkPriority) {
        loadData.remarkPriority = PriorityAIsuggestion;
      }
      
      // Check if a customer load with the same name already exists
      const existingLoad = await storage.getCustomerLoadByName(loadData.customerName);
      
      let customerLoad;
      let isUpdate = false;
      
      if (existingLoad) {
        // Update existing customer load
        isUpdate = true;
        
        // Preserve original slNo and createdAt, but allow other fields to be updated
        const updateData = {
          ...loadData,
          // Don't override these fields when updating
          slNo: existingLoad.slNo,
          createdAt: existingLoad.createdAt
        };
        
        const validatedUpdateData = insertCustomerLoadSchema.parse(updateData);
        customerLoad = await storage.updateCustomerLoad(existingLoad.id, validatedUpdateData);
        
        if (!customerLoad) {
          throw new Error("Failed to update existing customer load");
        }
      } else {
        // Create new customer load
        // Auto-generate slNo if not provided
        if (!loadData.slNo) {
          const timestamp = Date.now();
          loadData.slNo = `EXT-${timestamp}`;
        }
        
        // Add createdAt timestamp
        loadData.createdAt = new Date().toISOString();
        
        // Validate customer load data using the standard schema (now with slNo populated)
        const validatedLoad = insertCustomerLoadSchema.parse(loadData);
        customerLoad = await storage.createCustomerLoad(validatedLoad);
      }
      
      // Handle journey milestones replacement
      let createdMilestones: any[] = [];
      if (journeyMilestones && Array.isArray(journeyMilestones)) {
        // If updating an existing load, delete all existing milestones first
        if (isUpdate) {
          const existingMilestones = await storage.getJourneyMilestones(customerLoad.id);
          await Promise.all(
            existingMilestones.map(milestone => storage.deleteJourneyMilestone(milestone.id))
          );
        }
        
        // Create new milestones
        createdMilestones = await Promise.all(
          journeyMilestones.map(async (milestone: any) => {
            // Helper function to handle "undefined" string values
            const cleanValue = (value: any) => {
              if (value === "undefined" || value === undefined || value === null) {
                return "";
              }
              return String(value);
            };
            
            const milestoneData = {
              customerLoadId: customerLoad.id,
              sequenceNumber: milestone.sequence || milestone.sequenceNumber || 1,
              startingPoint: cleanValue(milestone.startingPoint),
              endingPoint: cleanValue(milestone.endingPoint),
              startDate: cleanValue(milestone.startDate),
              endDate: cleanValue(milestone.endDate),
              startTime: cleanValue(milestone.startTime),
              endTime: cleanValue(milestone.endTime),
              breakTime: milestone.breakHours ? (milestone.breakHours * 60).toString() : undefined,
              status: milestone.status || "pending",
              notes: milestone.notes && milestone.notes !== "undefined" ? milestone.notes : undefined
            };
            const validatedMilestone = insertJourneyMilestoneSchema.parse(milestoneData);
            return await storage.createJourneyMilestone(validatedMilestone);
          })
        );
      }
      
      const loadWithMilestones = {
        ...customerLoad,
        journeyMilestones: createdMilestones
      };
      
      res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: isUpdate ? "Customer load updated successfully" : "Customer load created successfully",
        data: loadWithMilestones
      });
    } catch (error) {
      console.error("External API error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ 
        success: false,
        message: "Failed to create/update customer load" 
      });
    }
  });

  // External API endpoint for updating a customer load with optional journey milestones (by customer name)
  app.put("/api/external/customer-loads/:customerName", async (req, res) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      
      const customerName = decodeURIComponent(req.params.customerName);
      if (!customerName) {
        return res.status(400).json({
          success: false,
          message: "Customer name is required"
        });
      }
      
      // Find existing customer load by name
      const existingLoad = await storage.getCustomerLoadByName(customerName);
      if (!existingLoad) {
        return res.status(404).json({
          success: false,
          message: `Customer load not found for customer: ${customerName}`
        });
      }
      
      const { journeyMilestones, ...loadData } = req.body;
      
      // Update customer load
      const updatedLoad = await storage.updateCustomerLoad(existingLoad.id, loadData);
      if (!updatedLoad) {
        return res.status(404).json({
          success: false,
          message: "Failed to update customer load"
        });
      }
      
      // Get current milestones
      let currentMilestones = await storage.getJourneyMilestones(existingLoad.id);
      
      // If journey milestones are provided, replace them
      if (journeyMilestones && Array.isArray(journeyMilestones)) {
        // Delete existing milestones
        await Promise.all(
          currentMilestones.map(milestone => 
            storage.deleteJourneyMilestone(milestone.id)
          )
        );
        
        // Create new milestones with proper field mapping
        currentMilestones = await Promise.all(
          journeyMilestones.map(async (milestone: any) => {
            // Helper function to handle "undefined" string values
            const cleanValue = (value: any) => {
              if (value === "undefined" || value === undefined || value === null) {
                return "";
              }
              return String(value);
            };
            
            const milestoneData = {
              customerLoadId: existingLoad.id,
              sequenceNumber: milestone.sequence || milestone.sequenceNumber || 1,
              startingPoint: cleanValue(milestone.startingPoint),
              endingPoint: cleanValue(milestone.endingPoint),
              startDate: cleanValue(milestone.startDate),
              endDate: cleanValue(milestone.endDate),
              startTime: cleanValue(milestone.startTime),
              endTime: cleanValue(milestone.endTime),
              breakTime: milestone.breakHours ? (milestone.breakHours * 60).toString() : undefined,
              status: milestone.status || "pending",
              notes: milestone.notes && milestone.notes !== "undefined" ? milestone.notes : undefined
            };
            const validatedMilestone = insertJourneyMilestoneSchema.parse(milestoneData);
            return await storage.createJourneyMilestone(validatedMilestone);
          })
        );
      }
      
      const loadWithMilestones = {
        ...updatedLoad,
        journeyMilestones: currentMilestones
      };
      
      res.json({
        success: true,
        message: "Customer load updated successfully",
        data: loadWithMilestones
      });
    } catch (error) {
      console.error("External API error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ 
        success: false,
        message: "Failed to update customer load" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
