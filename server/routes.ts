import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { registrationFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.group]) {
          acc[setting.group] = {};
        }
        acc[setting.group][setting.name] = setting.value;
        return acc;
      }, {} as Record<string, Record<string, string>>);
      
      res.json(groupedSettings);
    } catch (error) {
      res.status(500).json({ error: "Error fetching settings" });
    }
  });

  // Update settings
  app.post("/api/settings", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const { group, settings } = req.body;
      const results = [];

      for (const [name, value] of Object.entries(settings)) {
        const updated = await storage.updateSetting(name, value as string);
        if (updated) {
          results.push(updated);
        }
      }

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error updating settings" });
    }
  });

  // Wiki routes
  app.get("/api/wiki/categories", async (req, res) => {
    try {
      const categories = await storage.getAllWikiCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wiki categories" });
    }
  });

  app.get("/api/wiki", async (req, res) => {
    try {
      const content = await storage.getAllWikiContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wiki content" });
    }
  });

  app.get("/api/wiki/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const content = await storage.getWikiContentByCategory(category);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wiki content" });
    }
  });

  app.get("/api/wiki/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const content = await storage.getWikiContent(id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wiki content" });
    }
  });

  app.post("/api/wiki", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const newContent = await storage.createWikiContent({
        ...req.body,
        createdBy: req.user.id
      });
      res.status(201).json(newContent);
    } catch (error) {
      res.status(500).json({ error: "Error creating wiki content" });
    }
  });

  app.put("/api/wiki/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const updated = await storage.updateWikiContent(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Error updating wiki content" });
    }
  });

  app.delete("/api/wiki/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user?.role !== "admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const success = await storage.deleteWikiContent(id);
      if (!success) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Error deleting wiki content" });
    }
  });

  // Registration routes
  app.post("/api/register-carnival", async (req, res) => {
    try {
      // Validate the registration data
      const validatedData = registrationFormSchema.parse(req.body);
      
      // Convert activities array if needed
      const activities = Array.isArray(validatedData.activities) 
        ? validatedData.activities 
        : (validatedData.activities ? [validatedData.activities] : []);

      // Create the registration
      const registration = await storage.createRegistration({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber || "",
        participantType: validatedData.participantType,
        grade: validatedData.grade || "",
        activities,
        specialRequests: validatedData.specialRequests || "",
        status: "confirmed",
        registrationId: `SC2023-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: req.isAuthenticated() ? req.user.id : undefined
      });
      
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ error: "Error creating registration" });
    }
  });

  app.get("/api/registrations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      if (req.user.role === "admin") {
        // Admins can view all registrations
        const registrations = await storage.getAllRegistrations();
        return res.json(registrations);
      } else {
        // Regular users can only view their own registrations
        const registrations = await storage.getRegistrationsByUser(req.user.id);
        return res.json(registrations);
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching registrations" });
    }
  });

  app.get("/api/registrations/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Registration not found" });
      }
      
      // Regular users can only view their own registrations
      if (req.user.role !== "admin" && registration.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      res.json(registration);
    } catch (error) {
      res.status(500).json({ error: "Error fetching registration" });
    }
  });

  app.put("/api/registrations/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const registration = await storage.getRegistration(id);
      if (!registration) {
        return res.status(404).json({ error: "Registration not found" });
      }
      
      // Regular users can only update their own registrations
      if (req.user.role !== "admin" && registration.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const updated = await storage.updateRegistration(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Error updating registration" });
    }
  });

  app.delete("/api/registrations/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      const success = await storage.deleteRegistration(id);
      if (!success) {
        return res.status(404).json({ error: "Registration not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Error deleting registration" });
    }
  });

  // User profile route
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Get user's registrations
      const registrations = await storage.getRegistrationsByUser(req.user.id);
      
      res.json({
        user: userWithoutPassword,
        registrations
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching profile" });
    }
  });

  // Update user profile
  app.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Handle password updates
      let userData = { ...req.body };
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const updated = await storage.updateUser(req.user.id, userData);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error updating profile" });
    }
  });

  // User management routes (admin only)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Hash password if it's provided
      let userData = { ...req.body };
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const updated = await storage.updateUser(id, userData);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error updating user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      
      // Prevent deleting yourself
      if (id === req.user.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Error deleting user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
