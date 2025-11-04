import { mkdir, unlink, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOAD_BASE_PATH = process.env.UPLOAD_PATH || join(__dirname, '..', 'uploads');

// Ensure upload directory exists
export async function ensureUploadDir(customerId) {
  const customerDir = join(UPLOAD_BASE_PATH, 'customers', customerId);
  try {
    await mkdir(customerDir, { recursive: true });
    return customerDir;
  } catch (error) {
    throw new Error(`Failed to create upload directory: ${error.message}`);
  }
}

// Generate unique filename
export function generateUniqueFilename(originalName) {
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  return `${uuidv4()}${ext}`;
}

// Delete file from storage
export async function deleteFile(filePath) {
  try {
    await access(filePath);
    await unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
    return false;
  }
}

// Get file URL for serving
export function getFileUrl(customerId, filename) {
  return `/uploads/customers/${customerId}/${filename}`;
}
