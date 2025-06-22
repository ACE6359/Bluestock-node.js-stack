import { users, companies, ipos, documents, type User, type InsertUser, type Company, type InsertCompany, type Ipo, type InsertIpo, type Document, type InsertDocument, type IpoWithCompany, type CompanyWithIpos } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Company methods
  getAllCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<Company | undefined>;
  getCompanyWithIpos(id: number): Promise<CompanyWithIpos | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // IPO methods
  getAllIpos(): Promise<IpoWithCompany[]>;
  getIpoById(id: number): Promise<IpoWithCompany | undefined>;
  getIposByStatus(status: string): Promise<IpoWithCompany[]>;
  createIpo(ipo: InsertIpo): Promise<Ipo>;
  updateIpo(id: number, ipo: Partial<InsertIpo>): Promise<Ipo | undefined>;
  deleteIpo(id: number): Promise<boolean>;

  // Document methods
  getDocumentsByIpoId(ipoId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Company methods
  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanyWithIpos(id: number): Promise<CompanyWithIpos | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    if (!company) return undefined;

    const companyIpos = await db.select().from(ipos).where(eq(ipos.companyId, id));
    return { ...company, ipos: companyIpos };
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db
      .insert(companies)
      .values(company)
      .returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(company)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany || undefined;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // IPO methods
  async getAllIpos(): Promise<IpoWithCompany[]> {
    const result = await db
      .select({
        ipo: ipos,
        company: companies,
      })
      .from(ipos)
      .leftJoin(companies, eq(ipos.companyId, companies.id))
      .orderBy(desc(ipos.createdAt));

    const iposWithDocs = await Promise.all(
      result.map(async (row) => {
        const docs = await this.getDocumentsByIpoId(row.ipo.id);
        return {
          ...row.ipo,
          company: row.company!,
          documents: docs,
        };
      })
    );

    return iposWithDocs;
  }

  async getIpoById(id: number): Promise<IpoWithCompany | undefined> {
    const [result] = await db
      .select({
        ipo: ipos,
        company: companies,
      })
      .from(ipos)
      .leftJoin(companies, eq(ipos.companyId, companies.id))
      .where(eq(ipos.id, id));

    if (!result) return undefined;

    const docs = await this.getDocumentsByIpoId(id);
    return {
      ...result.ipo,
      company: result.company!,
      documents: docs,
    };
  }

  async getIposByStatus(status: string): Promise<IpoWithCompany[]> {
    const result = await db
      .select({
        ipo: ipos,
        company: companies,
      })
      .from(ipos)
      .leftJoin(companies, eq(ipos.companyId, companies.id))
      .where(eq(ipos.status, status))
      .orderBy(desc(ipos.createdAt));

    const iposWithDocs = await Promise.all(
      result.map(async (row) => {
        const docs = await this.getDocumentsByIpoId(row.ipo.id);
        return {
          ...row.ipo,
          company: row.company!,
          documents: docs,
        };
      })
    );

    return iposWithDocs;
  }

  async createIpo(ipo: InsertIpo): Promise<Ipo> {
    const [newIpo] = await db
      .insert(ipos)
      .values(ipo)
      .returning();
    return newIpo;
  }

  async updateIpo(id: number, ipo: Partial<InsertIpo>): Promise<Ipo | undefined> {
    const [updatedIpo] = await db
      .update(ipos)
      .set(ipo)
      .where(eq(ipos.id, id))
      .returning();
    return updatedIpo || undefined;
  }

  async deleteIpo(id: number): Promise<boolean> {
    const result = await db.delete(ipos).where(eq(ipos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Document methods
  async getDocumentsByIpoId(ipoId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.ipoId, ipoId));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
