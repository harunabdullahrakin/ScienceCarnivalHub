var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertRegistrationSchema: () => insertRegistrationSchema,
  insertSettingSchema: () => insertSettingSchema,
  insertUserSchema: () => insertUserSchema,
  insertWikiContentSchema: () => insertWikiContentSchema,
  loginSchema: () => loginSchema,
  registrationFormSchema: () => registrationFormSchema,
  registrations: () => registrations,
  settings: () => settings,
  users: () => users,
  wikiContent: () => wikiContent
});
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  role: text("role").default("user").notNull(),
  // admin, user
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  participantType: text("participant_type").notNull(),
  // student, teacher, parent, other
  grade: text("grade"),
  activities: text("activities").array(),
  specialRequests: text("special_requests"),
  status: text("status").default("pending").notNull(),
  // pending, confirmed, cancelled
  registrationId: text("registration_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var wikiContent = pgTable("wiki_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});
var settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: text("value").notNull(),
  group: text("group").notNull()
  // general, email, appearance
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true
});
var insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true
});
var insertWikiContentSchema = createInsertSchema(wikiContent).omit({
  id: true,
  lastUpdated: true
});
var insertSettingSchema = createInsertSchema(settings).omit({
  id: true
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
var registrationFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  participantType: z.enum(["student", "teacher", "parent", "other"]),
  grade: z.string().optional(),
  activities: z.array(z.string()).optional(),
  specialRequests: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" })
  })
});

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
var MemoryStore = createMemoryStore(session);
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  // PostgreSQL session store
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    this.initializeDefaultData();
  }
  async initializeDefaultData() {
    try {
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        await this.createUser({
          username: "admin",
          password: "$2b$10$mRli.9H1tlzjZzc.qvqcYuyFkl34LYvJQvnF8LKIzLLy5eqhdNXdC",
          // "password"
          role: "admin",
          email: "admin@tghbhs.edu",
          firstName: "Admin",
          lastName: "User"
        });
      }
      const generalSettings = [
        { name: "siteTitle", value: "TGHBHS Science Carnival", group: "general" },
        { name: "siteDescription", value: "A celebration of science and discovery at Town Green High School", group: "general" },
        { name: "contactEmail", value: "science@tghbhs.edu", group: "general" },
        { name: "registrationStatus", value: "open", group: "general" },
        { name: "eventDate", value: "May 15th, 2025", group: "general" },
        { name: "eventTime", value: "9:00 AM - 4:00 PM", group: "general" },
        { name: "eventLocation", value: "TGHBHS Main Campus", group: "general" }
      ];
      const emailSettings = [
        { name: "emailFrom", value: "noreply@tghbhs.edu", group: "email" },
        { name: "emailName", value: "TGHBHS Science Carnival", group: "email" },
        { name: "sendConfirmation", value: "true", group: "email" },
        { name: "sendReminder", value: "true", group: "email" }
      ];
      const appearanceSettings = [
        { name: "primaryColor", value: "#3B82F6", group: "appearance" },
        { name: "secondaryColor", value: "#10B981", group: "appearance" }
      ];
      const allSettings = [...generalSettings, ...emailSettings, ...appearanceSettings];
      for (const setting of allSettings) {
        const existingSetting = await this.getSetting(setting.name);
        if (!existingSetting) {
          await this.createSetting(setting);
        }
      }
      const categories = await this.getAllWikiCategories();
      if (categories.length === 0) {
        await this.createWikiContent({
          title: "Physics: The Science of Motion",
          content: `<p>Physics is the natural science that studies matter, its fundamental constituents, its motion and behavior through space and time, and the related entities of energy and force. Physics is one of the most fundamental scientific disciplines, and its main goal is to understand how the universe behaves.</p>
          
          <h3>Newton's Laws of Motion</h3>
          <p>Isaac Newton's three laws of motion describe the relationship between a body and the forces acting upon it, and its motion in response to those forces.</p>
          
          <ol>
            <li><strong>First Law:</strong> An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.</li>
            <li><strong>Second Law:</strong> The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object.</li>
            <li><strong>Third Law:</strong> For every action, there is an equal and opposite reaction.</li>
          </ol>

          <h3>Experiment: Demonstrating Inertia</h3>
          <p>You can demonstrate Newton's First Law with a simple experiment:</p>
          
          <div>
            <h4>Materials Needed:</h4>
            <ul>
              <li>A smooth table or surface</li>
              <li>A small, heavy object (like a coin)</li>
              <li>A piece of card paper</li>
            </ul>
            
            <h4>Steps:</h4>
            <ol>
              <li>Place the card on a smooth surface</li>
              <li>Place the coin on top of the card</li>
              <li>Quickly pull the card horizontally</li>
              <li>Observe how the coin stays in place due to inertia</li>
            </ol>
          </div>`,
          category: "Physics",
          createdBy: 1
        });
        await this.createWikiContent({
          title: "Introduction to Chemistry",
          content: `<p>Chemistry is the scientific study of the properties and behavior of matter. It is a natural science that covers the elements that make up matter to the compounds composed of atoms, molecules and ions: their composition, structure, properties, behavior and the changes they undergo during a reaction with other substances.</p>
          
          <h3>States of Matter</h3>
          <p>Matter can exist in several states, which are characterized by different physical properties.</p>
          
          <ul>
            <li><strong>Solid:</strong> Has a fixed shape and volume. Particles are closely packed together.</li>
            <li><strong>Liquid:</strong> Has a fixed volume but takes the shape of its container. Particles are less tightly packed than solids.</li>
            <li><strong>Gas:</strong> Has no fixed shape or volume. Particles are far apart and move freely.</li>
            <li><strong>Plasma:</strong> Similar to gas but contains a high number of electrons and ions.</li>
          </ul>

          <h3>Experiment: Creating a Chemical Reaction</h3>
          <p>You can demonstrate a simple chemical reaction using common household items:</p>
          
          <div>
            <h4>Materials Needed:</h4>
            <ul>
              <li>Baking soda</li>
              <li>Vinegar</li>
              <li>A clear container</li>
            </ul>
            
            <h4>Steps:</h4>
            <ol>
              <li>Place a few tablespoons of baking soda in the container</li>
              <li>Slowly pour vinegar into the container</li>
              <li>Observe the bubbling reaction as carbon dioxide gas is produced</li>
            </ol>
          </div>`,
          category: "Chemistry",
          createdBy: 1
        });
        await this.createWikiContent({
          title: "Exploring Biology",
          content: `<p>Biology is the scientific study of life. It is a natural science with a broad scope but has several unifying themes that tie it together as a single, coherent field. For instance, all organisms are made up of cells that process hereditary information encoded in genes, which can be transmitted to future generations.</p>
          
          <h3>Cell Structure</h3>
          <p>Cells are the basic structural and functional units of all living organisms. There are two main types of cells:</p>
          
          <ul>
            <li><strong>Prokaryotic cells:</strong> Simpler, smaller cells without a nucleus or membrane-bound organelles, found in bacteria and archaea.</li>
            <li><strong>Eukaryotic cells:</strong> More complex cells with a nucleus and various membrane-bound organelles, found in plants, animals, fungi, and protists.</li>
          </ul>

          <h3>Experiment: Observing Plant Cells</h3>
          <p>You can observe plant cells using a simple microscope and everyday materials:</p>
          
          <div>
            <h4>Materials Needed:</h4>
            <ul>
              <li>A microscope (even a basic one)</li>
              <li>A thin piece of onion skin</li>
              <li>A glass slide and cover slip</li>
              <li>Water</li>
              <li>Tweezers</li>
            </ul>
            
            <h4>Steps:</h4>
            <ol>
              <li>Place a drop of water on the glass slide</li>
              <li>Using tweezers, carefully place a small, thin piece of onion skin in the water</li>
              <li>Gently place the cover slip over the onion skin</li>
              <li>Observe under the microscope - you should be able to see the rectangular plant cells</li>
            </ol>
          </div>`,
          category: "Biology",
          createdBy: 1
        });
      }
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async getUsers() {
    return db.select().from(users);
  }
  async updateUser(id, userData) {
    const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Registration methods
  async getRegistration(id) {
    const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
    return registration;
  }
  async getRegistrationById(registrationId) {
    const [registration] = await db.select().from(registrations).where(eq(registrations.registrationId, registrationId));
    return registration;
  }
  async getRegistrationsByUser(userId) {
    return db.select().from(registrations).where(eq(registrations.userId, userId));
  }
  async createRegistration(registrationData) {
    const registrationId = `SC${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const [registration] = await db.insert(registrations).values({ ...registrationData, registrationId }).returning();
    return registration;
  }
  async updateRegistration(id, data) {
    const [updatedRegistration] = await db.update(registrations).set(data).where(eq(registrations.id, id)).returning();
    return updatedRegistration;
  }
  async deleteRegistration(id) {
    const result = await db.delete(registrations).where(eq(registrations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getAllRegistrations() {
    return db.select().from(registrations);
  }
  // Wiki content methods
  async getWikiContent(id) {
    const [content] = await db.select().from(wikiContent).where(eq(wikiContent.id, id));
    return content;
  }
  async getWikiContentByCategory(category) {
    return db.select().from(wikiContent).where(eq(wikiContent.category, category));
  }
  async getAllWikiCategories() {
    const result = await db.selectDistinct({ category: wikiContent.category }).from(wikiContent);
    return result.map((item) => item.category);
  }
  async createWikiContent(contentData) {
    const [content] = await db.insert(wikiContent).values({ ...contentData, lastUpdated: /* @__PURE__ */ new Date() }).returning();
    return content;
  }
  async updateWikiContent(id, contentData) {
    const [updatedContent] = await db.update(wikiContent).set({ ...contentData, lastUpdated: /* @__PURE__ */ new Date() }).where(eq(wikiContent.id, id)).returning();
    return updatedContent;
  }
  async deleteWikiContent(id) {
    const result = await db.delete(wikiContent).where(eq(wikiContent.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getAllWikiContent() {
    return db.select().from(wikiContent);
  }
  // Settings methods
  async getSetting(name) {
    const [setting] = await db.select().from(settings).where(eq(settings.name, name));
    return setting;
  }
  async getSettingsByGroup(group) {
    return db.select().from(settings).where(eq(settings.group, group));
  }
  async createSetting(settingData) {
    const [setting] = await db.insert(settings).values(settingData).returning();
    return setting;
  }
  async updateSetting(name, value) {
    const [updatedSetting] = await db.update(settings).set({ value }).where(eq(settings.name, name)).returning();
    return updatedSetting;
  }
  async getAllSettings() {
    return db.select().from(settings);
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "science-carnival-tghbhs-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // 1 week
      secure: app2.get("env") === "production"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.getAllSettings();
      const groupedSettings = settings2.reduce((acc, setting) => {
        if (!acc[setting.group]) {
          acc[setting.group] = {};
        }
        acc[setting.group][setting.name] = setting.value;
        return acc;
      }, {});
      res.json(groupedSettings);
    } catch (error) {
      res.status(500).json({ error: "Error fetching settings" });
    }
  });
  app2.post("/api/settings", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    try {
      const { group, settings: settings2 } = req.body;
      const results = [];
      for (const [name, value] of Object.entries(settings2)) {
        const updated = await storage.updateSetting(name, value);
        if (updated) {
          results.push(updated);
        }
      }
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Error updating settings" });
    }
  });
  app2.get("/api/wiki/categories", async (req, res) => {
    try {
      const categories = await storage.getAllWikiCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wiki categories" });
    }
  });
  app2.get("/api/wiki", async (req, res) => {
    try {
      const content = await storage.getAllWikiContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wiki content" });
    }
  });
  app2.get("/api/wiki/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const content = await storage.getWikiContentByCategory(category);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Error fetching wiki content" });
    }
  });
  app2.get("/api/wiki/:id", async (req, res) => {
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
  app2.post("/api/wiki", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
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
  app2.put("/api/wiki/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
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
  app2.delete("/api/wiki/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
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
  app2.post("/api/register-carnival", async (req, res) => {
    try {
      const validatedData = registrationFormSchema.parse(req.body);
      const activities = Array.isArray(validatedData.activities) ? validatedData.activities : validatedData.activities ? [validatedData.activities] : [];
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
        registrationId: `SC2023-${Math.floor(1e4 + Math.random() * 9e4)}`,
        userId: req.isAuthenticated() ? req.user.id : void 0
      });
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ error: "Error creating registration" });
    }
  });
  app2.get("/api/registrations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      if (req.user.role === "admin") {
        const registrations2 = await storage.getAllRegistrations();
        return res.json(registrations2);
      } else {
        const registrations2 = await storage.getRegistrationsByUser(req.user.id);
        return res.json(registrations2);
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching registrations" });
    }
  });
  app2.get("/api/registrations/:id", async (req, res) => {
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
      if (req.user.role !== "admin" && registration.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      res.json(registration);
    } catch (error) {
      res.status(500).json({ error: "Error fetching registration" });
    }
  });
  app2.put("/api/registrations/:id", async (req, res) => {
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
      if (req.user.role !== "admin" && registration.userId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const updated = await storage.updateRegistration(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Error updating registration" });
    }
  });
  app2.delete("/api/registrations/:id", async (req, res) => {
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
  app2.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      const registrations2 = await storage.getRegistrationsByUser(req.user.id);
      res.json({
        user: userWithoutPassword,
        registrations: registrations2
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching profile" });
    }
  });
  app2.put("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      let userData = { ...req.body };
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      const updated = await storage.updateUser(req.user.id, userData);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error updating profile" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    try {
      const users2 = await storage.getUsers();
      const usersWithoutPasswords = users2.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Error fetching users" });
    }
  });
  app2.post("/api/users", async (req, res) => {
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
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      let userData = { ...req.body };
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      const updated = await storage.updateUser(id, userData);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Error updating user" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
