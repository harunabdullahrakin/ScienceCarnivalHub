import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  role: text("role").default("user").notNull(), // admin, user
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Registration table
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  participantType: text("participant_type").notNull(), // student, teacher, parent, other
  grade: text("grade"),
  activities: text("activities").array(),
  specialRequests: text("special_requests"),
  status: text("status").default("pending").notNull(), // pending, confirmed, cancelled
  registrationId: text("registration_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Wiki content table
export const wikiContent = pgTable("wiki_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  value: text("value").notNull(),
  group: text("group").notNull() // general, email, appearance
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  role: true
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true
});

export const insertWikiContentSchema = createInsertSchema(wikiContent).omit({
  id: true,
  lastUpdated: true
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

export type WikiContent = typeof wikiContent.$inferSelect;
export type InsertWikiContent = z.infer<typeof insertWikiContentSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

export type LoginData = z.infer<typeof loginSchema>;

// Registration form schema
export const registrationFormSchema = z.object({
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

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
