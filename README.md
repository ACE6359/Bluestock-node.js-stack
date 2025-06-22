📘 Bluestock-node.js-stack: IPO Tracker API
A Node.js REST API for tracking and managing Initial Public Offerings (IPOs). Built with Express.js, TypeScript, and PostgreSQL, it serves as a powerful backend for IPO data management, suitable for any frontend app or external service.

🧱 System Architecture
Runtime: Node.js with Express.js framework

Language: TypeScript (ES Modules)

Database: PostgreSQL (via Drizzle ORM)

Authentication: Passport.js (Local Strategy, Session-based)

File Uploads: Multer (for logos & PDFs)

Session Storage: PostgreSQL (via connect-pg-simple)

🗃️ Database Architecture
ORM: Drizzle ORM (PostgreSQL dialect)

Migration Strategy: Schema-first with auto-generated migrations

Connection: Neon (serverless PostgreSQL with connection pooling)

🧩 Key Components
🔐 Authentication System
Session-based login using Passport.js

Password hashing with crypto.scrypt

PostgreSQL-backed session storage

Protected routes for admin-only access

🏢 Data Models
Users: Handles login and roles

Companies: Stores company data and logos

IPOs: Tracks full lifecycle (Upcoming → Open → Closed → Listed)

Documents: Manages RHP/DRHP PDFs

📁 File Management
Uploads stored in /uploads/ directory

logos/, documents/, misc/ subfolders

File type validation (Images for logos, PDFs for documents)

Static file serving enabled

🌐 API Structure
RESTful Design: Clean separation of routes

Public Endpoints:

View IPOs by status

Browse companies

Download documents

Admin Endpoints:

Create/edit companies

Manage IPOs

Upload files

Error Handling: Comprehensive with validation

🔄 Data Flow
Public Flow:
External apps can query IPO status, company info, documents

Admin Flow:
Authenticated admins manage companies, IPOs, and uploads

File Upload Flow:
Handled by Multer → Validated → Stored in organized directories

Database Flow:
Drizzle ORM handles all operations with full type safety

🔌 External Dependencies
Database: Neon (Serverless PostgreSQL)

Storage: Local filesystem

UI Tools (Internal Admin use): Radix UI primitives

Validation: Zod (runtime schema validation)

⚙️ Development Tools
TypeScript: Type safety everywhere

TSX: Dev server with hot reload

ESBuild: For fast production bundling

🚀 Deployment Strategy
Development
Run using TSX with hot reload

.env for config (DB URL, session secret, file paths)

Production
Build with ESBuild

Serve uploaded files statically

Supports deployment on platforms like Replit

📝 Changelog
June 22, 2025:

Initial full-stack setup

Converted to backend-only API (as per user request)

👤 User Preferences
Focus: Backend only (no frontend)

Style: Simple, everyday language
