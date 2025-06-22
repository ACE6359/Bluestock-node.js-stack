import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = "misc";
    
    if (file.fieldname === "logo") {
      subDir = "logos";
    } else if (file.fieldname === "rhpPdf" || file.fieldname === "drhpPdf") {
      subDir = "documents";
    }
    
    const targetDir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  }
});

// File filter for allowed file types
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.fieldname === "logo") {
    // Allow only image files for logos
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Logo must be an image file"), false);
    }
  } else if (file.fieldname === "rhpPdf" || file.fieldname === "drhpPdf") {
    // Allow only PDF files for documents
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Documents must be PDF files"), false);
    }
  } else {
    cb(new Error("Unexpected field"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Utility function to get file URL
export function getFileUrl(filePath: string): string {
  if (!filePath) return "";
  return `/uploads/${path.relative(uploadsDir, filePath)}`;
}

// Utility function to delete file
export function deleteFile(filePath: string): void {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
