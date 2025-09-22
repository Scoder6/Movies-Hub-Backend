import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/config.js"; // keep .js extension since it's your own local file (NodeNext requires this)
import { AppError } from "../middleware/errorHandler.js";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const ensureUploadDirExists = () => {
  const uploadDir = path.join(__dirname, "../../", config.UPLOAD_DIR);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Delete a file from storage
const deleteFile = (filename: string) => {
  try {
    const filePath = path.join(__dirname, "../../", config.UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    throw new AppError("Failed to delete file", 500);
  }
};

// Delete multiple files
const deleteFiles = (filenames: string[]) => {
  try {
    filenames.forEach((filename) => deleteFile(filename));
    return true;
  } catch (error) {
    throw new AppError("Failed to delete files", 500);
  }
};

export { ensureUploadDirExists, deleteFile, deleteFiles };
