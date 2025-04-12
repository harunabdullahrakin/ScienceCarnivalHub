import { users, type User, type InsertUser } from "@shared/schema";
import { registrations, type Registration, type InsertRegistration } from "@shared/schema";
import { wikiContent, type WikiContent, type InsertWikiContent } from "@shared/schema";
import { settings, type Setting, type InsertSetting } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Registration operations
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrationById(registrationId: string): Promise<Registration | undefined>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: number, data: Partial<InsertRegistration>): Promise<Registration | undefined>;
  deleteRegistration(id: number): Promise<boolean>;
  getAllRegistrations(): Promise<Registration[]>;
  
  // Wiki content operations
  getWikiContent(id: number): Promise<WikiContent | undefined>;
  getWikiContentByCategory(category: string): Promise<WikiContent[]>;
  getAllWikiCategories(): Promise<string[]>;
  createWikiContent(content: InsertWikiContent): Promise<WikiContent>;
  updateWikiContent(id: number, content: Partial<InsertWikiContent>): Promise<WikiContent | undefined>;
  deleteWikiContent(id: number): Promise<boolean>;
  getAllWikiContent(): Promise<WikiContent[]>;
  
  // Settings operations
  getSetting(name: string): Promise<Setting | undefined>;
  getSettingsByGroup(group: string): Promise<Setting[]>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(name: string, value: string): Promise<Setting | undefined>;
  getAllSettings(): Promise<Setting[]>;
  
  // Session store
  sessionStore: any; // express-session.Store
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private registrations: Map<number, Registration>;
  private wikiContents: Map<number, WikiContent>;
  private settingsMap: Map<string, Setting>;
  private userIdCounter: number;
  private registrationIdCounter: number;
  private wikiContentIdCounter: number;
  private settingIdCounter: number;
  sessionStore: any; // express-session store

  constructor() {
    this.users = new Map();
    this.registrations = new Map();
    this.wikiContents = new Map();
    this.settingsMap = new Map();
    this.userIdCounter = 1;
    this.registrationIdCounter = 1;
    this.wikiContentIdCounter = 1;
    this.settingIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with default admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$mRli.9H1tlzjZzc.qvqcYuyFkl34LYvJQvnF8LKIzLLy5eqhdNXdC", // "password"
      role: "admin",
      email: "admin@tghbhs.edu",
      firstName: "Admin",
      lastName: "User"
    });
    
    // Initialize with default settings
    this.createSetting({
      name: "siteTitle",
      value: "TGHBHS Science Carnival",
      group: "general"
    });
    
    this.createSetting({
      name: "siteDescription",
      value: "A celebration of science and discovery at Town Green High School",
      group: "general"
    });
    
    this.createSetting({
      name: "contactEmail",
      value: "science@tghbhs.edu",
      group: "general"
    });
    
    this.createSetting({
      name: "registrationStatus",
      value: "open",
      group: "general"
    });
    
    this.createSetting({
      name: "eventDate",
      value: "May 15th, 2023",
      group: "general"
    });
    
    this.createSetting({
      name: "eventTime",
      value: "9:00 AM - 4:00 PM",
      group: "general"
    });
    
    this.createSetting({
      name: "eventLocation",
      value: "TGHBHS Main Campus",
      group: "general"
    });
    
    this.createSetting({
      name: "emailFrom",
      value: "noreply@tghbhs.edu",
      group: "email"
    });
    
    this.createSetting({
      name: "emailName",
      value: "TGHBHS Science Carnival",
      group: "email"
    });
    
    this.createSetting({
      name: "sendConfirmation",
      value: "true",
      group: "email"
    });
    
    this.createSetting({
      name: "sendReminder",
      value: "true",
      group: "email"
    });
    
    this.createSetting({
      name: "primaryColor",
      value: "#3B82F6",
      group: "appearance"
    });
    
    this.createSetting({
      name: "secondaryColor",
      value: "#10B981",
      group: "appearance"
    });
    
    // Add initial wiki content
    this.createWikiContent({
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
    
    this.createWikiContent({
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
    
    this.createWikiContent({
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

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Registration methods
  async getRegistration(id: number): Promise<Registration | undefined> {
    return this.registrations.get(id);
  }

  async getRegistrationById(registrationId: string): Promise<Registration | undefined> {
    for (const registration of this.registrations.values()) {
      if (registration.registrationId === registrationId) {
        return registration;
      }
    }
    return undefined;
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    const results: Registration[] = [];
    for (const registration of this.registrations.values()) {
      if (registration.userId === userId) {
        results.push(registration);
      }
    }
    return results;
  }

  async createRegistration(registrationData: InsertRegistration): Promise<Registration> {
    const id = this.registrationIdCounter++;
    const registrationId = `SC2023-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const newRegistration: Registration = {
      ...registrationData,
      id,
      registrationId,
      createdAt: new Date()
    };
    
    this.registrations.set(id, newRegistration);
    return newRegistration;
  }

  async updateRegistration(id: number, data: Partial<InsertRegistration>): Promise<Registration | undefined> {
    const registration = await this.getRegistration(id);
    if (!registration) return undefined;

    const updatedRegistration: Registration = { ...registration, ...data };
    this.registrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  async deleteRegistration(id: number): Promise<boolean> {
    return this.registrations.delete(id);
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  // Wiki content methods
  async getWikiContent(id: number): Promise<WikiContent | undefined> {
    return this.wikiContents.get(id);
  }

  async getWikiContentByCategory(category: string): Promise<WikiContent[]> {
    const results: WikiContent[] = [];
    for (const content of this.wikiContents.values()) {
      if (content.category.toLowerCase() === category.toLowerCase()) {
        results.push(content);
      }
    }
    return results;
  }

  async getAllWikiCategories(): Promise<string[]> {
    const categories = new Set<string>();
    for (const content of this.wikiContents.values()) {
      categories.add(content.category);
    }
    return Array.from(categories);
  }

  async createWikiContent(contentData: InsertWikiContent): Promise<WikiContent> {
    const id = this.wikiContentIdCounter++;
    const newContent: WikiContent = {
      ...contentData,
      id,
      lastUpdated: new Date()
    };
    
    this.wikiContents.set(id, newContent);
    return newContent;
  }

  async updateWikiContent(id: number, contentData: Partial<InsertWikiContent>): Promise<WikiContent | undefined> {
    const content = await this.getWikiContent(id);
    if (!content) return undefined;

    const updatedContent: WikiContent = { 
      ...content, 
      ...contentData, 
      lastUpdated: new Date() 
    };
    
    this.wikiContents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteWikiContent(id: number): Promise<boolean> {
    return this.wikiContents.delete(id);
  }

  async getAllWikiContent(): Promise<WikiContent[]> {
    return Array.from(this.wikiContents.values());
  }

  // Settings methods
  async getSetting(name: string): Promise<Setting | undefined> {
    for (const setting of this.settingsMap.values()) {
      if (setting.name === name) {
        return setting;
      }
    }
    return undefined;
  }

  async getSettingsByGroup(group: string): Promise<Setting[]> {
    const results: Setting[] = [];
    for (const setting of this.settingsMap.values()) {
      if (setting.group === group) {
        results.push(setting);
      }
    }
    return results;
  }

  async createSetting(settingData: InsertSetting): Promise<Setting> {
    const id = this.settingIdCounter++;
    const newSetting: Setting = {
      ...settingData,
      id
    };
    
    this.settingsMap.set(settingData.name, newSetting);
    return newSetting;
  }

  async updateSetting(name: string, value: string): Promise<Setting | undefined> {
    const setting = await this.getSetting(name);
    if (!setting) return undefined;

    const updatedSetting: Setting = { ...setting, value };
    this.settingsMap.set(name, updatedSetting);
    return updatedSetting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settingsMap.values());
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // PostgreSQL session store

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });

    // Initialize default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if admin user exists
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        // Create default admin user
        await this.createUser({
          username: "admin",
          password: "$2b$10$mRli.9H1tlzjZzc.qvqcYuyFkl34LYvJQvnF8LKIzLLy5eqhdNXdC", // "password"
          role: "admin",
          email: "admin@tghbhs.edu",
          firstName: "Admin",
          lastName: "User"
        });
      }

      // Initialize default settings
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

      // Initialize default wiki content
      const categories = await this.getAllWikiCategories();
      
      if (categories.length === 0) {
        // Physics content
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

        // Chemistry content
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

        // Biology content
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
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Registration methods
  async getRegistration(id: number): Promise<Registration | undefined> {
    const [registration] = await db.select().from(registrations).where(eq(registrations.id, id));
    return registration;
  }

  async getRegistrationById(registrationId: string): Promise<Registration | undefined> {
    const [registration] = await db.select()
      .from(registrations)
      .where(eq(registrations.registrationId, registrationId));
    return registration;
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return db.select()
      .from(registrations)
      .where(eq(registrations.userId, userId));
  }

  async createRegistration(registrationData: InsertRegistration): Promise<Registration> {
    const registrationId = `SC${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const [registration] = await db.insert(registrations)
      .values({ ...registrationData, registrationId })
      .returning();
    return registration;
  }

  async updateRegistration(id: number, data: Partial<InsertRegistration>): Promise<Registration | undefined> {
    const [updatedRegistration] = await db.update(registrations)
      .set(data)
      .where(eq(registrations.id, id))
      .returning();
    return updatedRegistration;
  }

  async deleteRegistration(id: number): Promise<boolean> {
    const result = await db.delete(registrations).where(eq(registrations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllRegistrations(): Promise<Registration[]> {
    return db.select().from(registrations);
  }

  // Wiki content methods
  async getWikiContent(id: number): Promise<WikiContent | undefined> {
    const [content] = await db.select().from(wikiContent).where(eq(wikiContent.id, id));
    return content;
  }

  async getWikiContentByCategory(category: string): Promise<WikiContent[]> {
    return db.select()
      .from(wikiContent)
      .where(eq(wikiContent.category, category));
  }

  async getAllWikiCategories(): Promise<string[]> {
    const result = await db.selectDistinct({ category: wikiContent.category }).from(wikiContent);
    return result.map(item => item.category);
  }

  async createWikiContent(contentData: InsertWikiContent): Promise<WikiContent> {
    const [content] = await db.insert(wikiContent)
      .values({ ...contentData, lastUpdated: new Date() })
      .returning();
    return content;
  }

  async updateWikiContent(id: number, contentData: Partial<InsertWikiContent>): Promise<WikiContent | undefined> {
    const [updatedContent] = await db.update(wikiContent)
      .set({ ...contentData, lastUpdated: new Date() })
      .where(eq(wikiContent.id, id))
      .returning();
    return updatedContent;
  }

  async deleteWikiContent(id: number): Promise<boolean> {
    const result = await db.delete(wikiContent).where(eq(wikiContent.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllWikiContent(): Promise<WikiContent[]> {
    return db.select().from(wikiContent);
  }

  // Settings methods
  async getSetting(name: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.name, name));
    return setting;
  }

  async getSettingsByGroup(group: string): Promise<Setting[]> {
    return db.select()
      .from(settings)
      .where(eq(settings.group, group));
  }

  async createSetting(settingData: InsertSetting): Promise<Setting> {
    const [setting] = await db.insert(settings)
      .values(settingData)
      .returning();
    return setting;
  }

  async updateSetting(name: string, value: string): Promise<Setting | undefined> {
    const [updatedSetting] = await db.update(settings)
      .set({ value })
      .where(eq(settings.name, name))
      .returning();
    return updatedSetting;
  }

  async getAllSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }
}

// Use DatabaseStorage for production, MemStorage for development if needed
export const storage = new DatabaseStorage();
