# Bluestock-node.js-stack
IPO Tracker API
Overview
IPO Tracker is a Node.js REST API for tracking and managing Initial Public Offerings (IPOs). The API provides comprehensive endpoints for managing companies, IPOs, and related documents. Built with Express.js, TypeScript, and PostgreSQL, it offers a robust backend solution for IPO data management that can be consumed by any frontend application or external service.

System Architecture
API Architecture
Runtime: Node.js with Express.js framework
Language: TypeScript with ES modules
Database: PostgreSQL with Drizzle ORM
Authentication: Passport.js with local strategy and session-based auth
File Uploads: Multer for handling file uploads (logos, PDFs)
Session Storage: PostgreSQL-backed sessions using connect-pg-simple
Database Architecture
ORM: Drizzle ORM with PostgreSQL dialect
Migration Strategy: Schema-first approach with generated migrations
Connection: Neon serverless PostgreSQL with connection pooling
Key Components
Data Models
Users: Authentication and authorization
Companies: Company information and logos
IPOs: Complete IPO lifecycle tracking (Upcoming → Open → Closed → Listed)
Documents: RHP and DRHP PDF storage and management
Authentication System
Session-based authentication using Passport.js
Password hashing with Node.js crypto (scrypt)
PostgreSQL session storage for scalability
Protected routes for admin functionality
File Management
Organized file storage in uploads/ directory
Separate subdirectories for logos, documents, and miscellaneous files
File type validation (images for logos, PDFs for documents)
Static file serving for uploaded content
API Structure
RESTful API design with clear endpoint separation
Public endpoints for IPO data viewing
Protected admin endpoints for CRUD operations
Comprehensive error handling and validation
Data Flow
Public API Flow: External applications can browse IPOs by status, view company information, and access documents
Admin API Flow: Authenticated requests can create/edit companies, manage IPOs, and upload documents
File Upload Flow: Multer handles file uploads with validation, stores files in organized directories
Database Flow: Drizzle ORM manages all database interactions with type safety
External Dependencies
Core Technologies
Database: Neon serverless PostgreSQL
File Storage: Local filesystem with organized directory structure
UI Components: Radix UI primitives for accessibility
Validation: Zod for runtime type checking and validation
Development Tools
TypeScript: Full type safety across the API
ESBuild: Fast bundling for production
TSX: Development server with hot reload
Deployment Strategy
Development Environment
TSX for API development with hot reload
Simple Node.js API server startup
Production Build
ESBuild creates bundled Node.js application
Static file serving for uploaded content
Environment Configuration
Database URL configuration for PostgreSQL connection
Session secret for authentication security
File upload paths and validation settings
Replit Integration
Configured for Replit's PostgreSQL module
Automatic port configuration and deployment
Development and production workflow support
Changelog
June 22, 2025: Initial full-stack setup
June 22, 2025: Converted to Node.js backend-only API per user request
User Preferences
Focus on Node.js backend development only
No frontend components
Preferred communication style: Simple, everyday language
