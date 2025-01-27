import path from "path";
import fs from "fs";
import multer from "multer";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/assets";
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir); // Save the file in the 'public/assets' directory
  },
  filename: (req, file, cb) => {
    // Save file with a unique timestamp and its original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File type filter (only allow video files of any type)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    // Check if the file is a video type
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed."));
  }
};

// Multer setup with no file size limit
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 50MB
  },
  timeout: 600000,
  // No file size limit, allowing any size
});
