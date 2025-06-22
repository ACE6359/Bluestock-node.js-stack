import { pgTable, text, serial, integer, decimal, date, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: serial("company_id").primaryKey(),
  name: varchar("company_name", { length: 255 }).notNull(),
  logo: varchar("company_logo", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ipos = pgTable("ipos", {
  id: serial("ipo_id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  priceBand: varchar("price_band", { length: 50 }),
  openDate: date("open_date"),
  closeDate: date("close_date"),
  issueSize: varchar("issue_size", { length: 100 }),
  issueType: varchar("issue_type", { length: 50 }),
  listingDate: date("listing_date"),
  status: varchar("status", { length: 20 }).notNull().default("Upcoming"), // 'Upcoming', 'Open', 'Closed', 'Listed'
  ipoPrice: decimal("ipo_price", { precision: 10, scale: 2 }),
  listingPrice: decimal("listing_price", { precision: 10, scale: 2 }),
  listingGain: decimal("listing_gain", { precision: 5, scale: 2 }),
  currentMarketPrice: decimal("current_market_price", { precision: 10, scale: 2 }),
  currentReturn: decimal("current_return", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("document_id").primaryKey(),
  ipoId: integer("ipo_id").notNull().references(() => ipos.id, { onDelete: "cascade" }),
  rhpPdf: varchar("rhp_pdf", { length: 255 }),
  drhpPdf: varchar("drhp_pdf", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  ipos: many(ipos),
}));

export const iposRelations = relations(ipos, ({ one, many }) => ({
  company: one(companies, {
    fields: [ipos.companyId],
    references: [companies.id],
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  ipo: one(ipos, {
    fields: [documents.ipoId],
    references: [ipos.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertIpoSchema = createInsertSchema(ipos).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Ipo = typeof ipos.$inferSelect;
export type InsertIpo = z.infer<typeof insertIpoSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Combined types for API responses
export type IpoWithCompany = Ipo & {
  company: Company;
  documents: Document[];
};

export type CompanyWithIpos = Company & {
  ipos: Ipo[];
};
