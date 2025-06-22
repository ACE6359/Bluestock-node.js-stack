# IPO Tracker API

A comprehensive Node.js REST API for tracking and managing Initial Public Offerings (IPOs) built with Express.js, TypeScript, and PostgreSQL.

## Features

- **Authentication System**: User registration, login, and session management
- **Company Management**: CRUD operations for companies with logo uploads
- **IPO Tracking**: Complete IPO lifecycle management (Upcoming → Open → Closed → Listed)
- **Document Management**: Upload and serve RHP and DRHP PDF documents
- **File Handling**: Organized file storage for logos and documents
- **PostgreSQL Database**: Robust data persistence with Drizzle ORM
- **TypeScript**: Full type safety across the application

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current authenticated user

### Public Endpoints
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID with associated IPOs
- `GET /api/ipos` - Get all IPOs (supports `?status=upcoming|open|closed|listed`)
- `GET /api/ipos/:id` - Get IPO by ID with company and documents
- `GET /api/ipos/:ipoId/documents` - Get documents for specific IPO

### Admin Endpoints (Authentication Required)
- `POST /api/admin/companies` - Create company (supports logo file upload)
- `PUT /api/admin/companies/:id` - Update company
- `DELETE /api/admin/companies/:id` - Delete company
- `POST /api/admin/ipos` - Create IPO
- `PUT /api/admin/ipos/:id` - Update IPO
- `DELETE /api/admin/ipos/:id` - Delete IPO
- `POST /api/admin/ipos/:ipoId/documents` - Upload RHP/DRHP documents

## Database Schema

### Companies
- `id` - Primary key
- `name` - Company name
- `logo` - Logo file URL
- `createdAt` - Creation timestamp

### IPOs
- `id` - Primary key
- `companyId` - Foreign key to companies
- `priceBand` - IPO price range
- `openDate` - IPO opening date
- `closeDate` - IPO closing date
- `issueSize` - Total issue size
- `issueType` - Type of issue
- `listingDate` - Stock listing date
- `status` - Current status (Upcoming/Open/Closed/Listed)
- `ipoPrice` - IPO price per share
- `listingPrice` - Listing price per share
- `listingGain` - Gain percentage from IPO to listing
- `currentMarketPrice` - Current market price
- `currentReturn` - Current return percentage
- `createdAt` - Creation timestamp

### Documents
- `id` - Primary key
- `ipoId` - Foreign key to IPOs
- `rhpPdf` - RHP document URL
- `drhpPdf` - DRHP document URL
- `createdAt` - Creation timestamp

### Users
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `createdAt` - Creation timestamp

## File Upload

The API supports file uploads for:
- **Company Logos**: Images (JPG, PNG, etc.) stored in `/uploads/logos/`
- **IPO Documents**: PDF files (RHP, DRHP) stored in `/uploads/documents/`

Files are accessible via `/uploads/` static route.

## Development

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret key for session management
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

## Usage Examples

### Create a Company
```bash
curl -X POST http://localhost:5000/api/admin/companies \
  -H "Content-Type: multipart/form-data" \
  -F "name=Tech Corp" \
  -F "logo=@logo.png"
```

### Create an IPO
```bash
curl -X POST http://localhost:5000/api/admin/ipos \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": 1,
    "priceBand": "₹100-120",
    "openDate": "2025-01-15",
    "closeDate": "2025-01-17",
    "issueSize": "₹1000 Cr",
    "status": "Upcoming"
  }'
```

### Get IPOs by Status
```bash
curl http://localhost:5000/api/ipos?status=open
```

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer
- **Validation**: Zod
- **Session Store**: PostgreSQL-backed sessions

## Architecture

The application follows a clean architecture pattern:
- **Routes**: Handle HTTP requests and responses
- **Storage**: Database operations and business logic
- **Middleware**: Authentication, file upload, error handling
- **Schema**: Type definitions and validation rules

This API provides a solid foundation for IPO tracking applications and can be consumed by web frontends, mobile apps, or other services.