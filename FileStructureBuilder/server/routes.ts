import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { upload, getFileUrl, deleteFile } from "./middleware/upload";
import { insertCompanySchema, insertIpoSchema, insertDocumentSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import path from "path";
import express from "express";

// Middleware to check if user is authenticated
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  // API documentation endpoint
  app.get("/", (_req, res) => {
    res.json({
      message: "IPO Tracker API",
      version: "1.0.0",
      endpoints: {
        authentication: {
          "POST /api/register": "Register a new user",
          "POST /api/login": "Login user",
          "POST /api/logout": "Logout user",
          "GET /api/user": "Get current user"
        },
        public: {
          "GET /api/companies": "Get all companies",
          "GET /api/companies/:id": "Get company by ID with IPOs",
          "GET /api/ipos": "Get all IPOs (query param: ?status=upcoming)",
          "GET /api/ipos/:id": "Get IPO by ID",
          "GET /api/ipos/:ipoId/documents": "Get documents for IPO"
        },
        admin: {
          "POST /api/admin/companies": "Create company (with logo upload)",
          "PUT /api/admin/companies/:id": "Update company",
          "DELETE /api/admin/companies/:id": "Delete company",
          "POST /api/admin/ipos": "Create IPO",
          "PUT /api/admin/ipos/:id": "Update IPO",
          "DELETE /api/admin/ipos/:id": "Delete IPO",
          "POST /api/admin/ipos/:ipoId/documents": "Upload IPO documents"
        }
      }
    });
  });

  // Public IPO endpoints
  app.get("/api/ipos", async (req, res, next) => {
    try {
      const { status } = req.query;
      let ipos;
      
      if (status && typeof status === "string") {
        ipos = await storage.getIposByStatus(status);
      } else {
        ipos = await storage.getAllIpos();
      }
      
      res.json(ipos);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/ipos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid IPO ID" });
      }

      const ipo = await storage.getIpoById(id);
      if (!ipo) {
        return res.status(404).json({ message: "IPO not found" });
      }

      res.json(ipo);
    } catch (error) {
      next(error);
    }
  });

  // Public company endpoints
  app.get("/api/companies", async (req, res, next) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/companies/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const company = await storage.getCompanyWithIpos(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      next(error);
    }
  });

  // Protected admin endpoints for companies
  app.post("/api/admin/companies", requireAuth, upload.single("logo"), async (req: any, res, next) => {
    try {
      let companyData = { ...req.body };
      
      if (req.file) {
        companyData.logo = getFileUrl(req.file.path);
      }

      const result = insertCompanySchema.safeParse(companyData);
      if (!result.success) {
        if (req.file) deleteFile(req.file.path);
        const error = fromZodError(result.error);
        return res.status(400).json({ message: error.toString() });
      }

      const company = await storage.createCompany(result.data);
      res.status(201).json(company);
    } catch (error) {
      if (req.file) deleteFile(req.file.path);
      next(error);
    }
  });

  app.put("/api/admin/companies/:id", requireAuth, upload.single("logo"), async (req: any, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        if (req.file) deleteFile(req.file.path);
        return res.status(400).json({ message: "Invalid company ID" });
      }

      let updateData = { ...req.body };
      
      if (req.file) {
        updateData.logo = getFileUrl(req.file.path);
      }

      const result = insertCompanySchema.partial().safeParse(updateData);
      if (!result.success) {
        if (req.file) deleteFile(req.file.path);
        const error = fromZodError(result.error);
        return res.status(400).json({ message: error.toString() });
      }

      const company = await storage.updateCompany(id, result.data);
      if (!company) {
        if (req.file) deleteFile(req.file.path);
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      if (req.file) deleteFile(req.file.path);
      next(error);
    }
  });

  app.delete("/api/admin/companies/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const deleted = await storage.deleteCompany(id);
      if (!deleted) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Protected admin endpoints for IPOs
  app.post("/api/admin/ipos", requireAuth, async (req, res, next) => {
    try {
      // Convert string fields to proper types
      const ipoData = {
        ...req.body,
        companyId: parseInt(req.body.companyId),
        ipoPrice: req.body.ipoPrice ? parseFloat(req.body.ipoPrice) : undefined,
        listingPrice: req.body.listingPrice ? parseFloat(req.body.listingPrice) : undefined,
        listingGain: req.body.listingGain ? parseFloat(req.body.listingGain) : undefined,
        currentMarketPrice: req.body.currentMarketPrice ? parseFloat(req.body.currentMarketPrice) : undefined,
        currentReturn: req.body.currentReturn ? parseFloat(req.body.currentReturn) : undefined,
      };

      const result = insertIpoSchema.safeParse(ipoData);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ message: error.toString() });
      }

      const ipo = await storage.createIpo(result.data);
      res.status(201).json(ipo);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/ipos/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid IPO ID" });
      }

      // Convert string fields to proper types
      const updateData: any = { ...req.body };
      if (updateData.companyId) updateData.companyId = parseInt(updateData.companyId);
      if (updateData.ipoPrice) updateData.ipoPrice = parseFloat(updateData.ipoPrice);
      if (updateData.listingPrice) updateData.listingPrice = parseFloat(updateData.listingPrice);
      if (updateData.listingGain) updateData.listingGain = parseFloat(updateData.listingGain);
      if (updateData.currentMarketPrice) updateData.currentMarketPrice = parseFloat(updateData.currentMarketPrice);
      if (updateData.currentReturn) updateData.currentReturn = parseFloat(updateData.currentReturn);

      const result = insertIpoSchema.partial().safeParse(updateData);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ message: error.toString() });
      }

      const ipo = await storage.updateIpo(id, result.data);
      if (!ipo) {
        return res.status(404).json({ message: "IPO not found" });
      }

      res.json(ipo);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/ipos/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid IPO ID" });
      }

      const deleted = await storage.deleteIpo(id);
      if (!deleted) {
        return res.status(404).json({ message: "IPO not found" });
      }

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Protected admin endpoints for documents
  app.post("/api/admin/ipos/:ipoId/documents", requireAuth, upload.fields([
    { name: "rhpPdf", maxCount: 1 },
    { name: "drhpPdf", maxCount: 1 }
  ]), async (req, res, next) => {
    try {
      const ipoId = parseInt(req.params.ipoId);
      if (isNaN(ipoId)) {
        return res.status(400).json({ message: "Invalid IPO ID" });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const documentData: any = { ipoId };

      if (files.rhpPdf?.[0]) {
        documentData.rhpPdf = getFileUrl(files.rhpPdf[0].path);
      }
      if (files.drhpPdf?.[0]) {
        documentData.drhpPdf = getFileUrl(files.drhpPdf[0].path);
      }

      const result = insertDocumentSchema.safeParse(documentData);
      if (!result.success) {
        // Clean up uploaded files on validation error
        if (files.rhpPdf?.[0]) deleteFile(files.rhpPdf[0].path);
        if (files.drhpPdf?.[0]) deleteFile(files.drhpPdf[0].path);
        
        const error = fromZodError(result.error);
        return res.status(400).json({ message: error.toString() });
      }

      const document = await storage.createDocument(result.data);
      res.status(201).json(document);
    } catch (error) {
      // Clean up uploaded files on error
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.rhpPdf?.[0]) deleteFile(files.rhpPdf[0].path);
      if (files.drhpPdf?.[0]) deleteFile(files.drhpPdf[0].path);
      next(error);
    }
  });

  app.get("/api/ipos/:ipoId/documents", async (req, res, next) => {
    try {
      const ipoId = parseInt(req.params.ipoId);
      if (isNaN(ipoId)) {
        return res.status(400).json({ message: "Invalid IPO ID" });
      }

      const documents = await storage.getDocumentsByIpoId(ipoId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
