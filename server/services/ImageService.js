/**
 * Image Service
 * Handles all business logic for customer image management and file uploads
 * Extends BaseService for reusable CRUD operations
 */

import BaseService from './BaseService.js';
import * as queryBuilder from '../database/queryBuilder.js';
import * as fileStorage from '../utils/fileStorage.js';
import sharp from 'sharp';
import { join } from 'path';

class ImageService extends BaseService {
  constructor() {
    super('customer_images');
  }

  /**
   * Validate image data
   */
  validateImage(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.customer_id) {
      errors.push('customer_id is required');
    }

    if (!isUpdate && !data.image_url) {
      errors.push('image_url is required');
    }

    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = errors;
      throw error;
    }

    return true;
  }

  /**
   * Verify that customer exists
   */
  verifyCustomerExists(customerId) {
    const sql = 'SELECT id FROM customers WHERE id = ?';
    const customer = queryBuilder.queryOne(sql, [customerId]);
    
    if (!customer) {
      const error = new Error(`Customer with id ${customerId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    return true;
  }

  /**
   * Process and save uploaded image
   */
  async processUpload(file, customerId, description = null) {
    this.verifyCustomerExists(customerId);

    // Ensure upload directory exists
    const uploadDir = await fileStorage.ensureUploadDir(customerId);

    // Generate unique filename
    const uniqueFilename = fileStorage.generateUniqueFilename(file.originalname);
    const filePath = join(uploadDir, uniqueFilename);

    // Process image with sharp (resize if too large, optimize)
    await sharp(file.path)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    // Get file info
    const metadata = await sharp(filePath).metadata();

    // Create database record
    const imageData = {
      customer_id: customerId,
      image_url: fileStorage.getFileUrl(customerId, uniqueFilename),
      image_name: file.originalname,
      image_type: file.mimetype,
      image_size: metadata.size,
      description
    };

    this.validateImage(imageData);
    return this.create(imageData);
  }

  /**
   * Create image record with validation
   */
  createImage(data) {
    this.validateImage(data);
    this.verifyCustomerExists(data.customer_id);
    return this.create(data);
  }

  /**
   * Update image metadata
   */
  updateImage(id, data) {
    if (data.customer_id) {
      this.verifyCustomerExists(data.customer_id);
    }
    
    this.validateImage(data, true);
    return this.update(id, data);
  }

  /**
   * Get all images for a customer
   */
  getImagesByCustomer(customerId, filters = {}) {
    let sql = 'SELECT * FROM customer_images WHERE customer_id = ?';
    const params = [customerId];

    if (filters.name_starts_with) {
      sql += ' AND image_name LIKE ?';
      params.push(`${filters.name_starts_with}%`);
    }

    sql += ' ORDER BY created_at DESC';

    return queryBuilder.queryAll(sql, params);
  }

  /**
   * Get image with customer information
   */
  getImageWithCustomer(id) {
    const sql = `
      SELECT 
        ci.*,
        c.customer_name,
        c.company
      FROM customer_images ci
      LEFT JOIN customers c ON ci.customer_id = c.id
      WHERE ci.id = ?
    `;

    const image = queryBuilder.queryOne(sql, [id]);
    
    if (!image) {
      const error = new Error(`Image with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return image;
  }

  /**
   * Count images for a customer
   */
  countByCustomer(customerId) {
    const sql = 'SELECT COUNT(*) as total FROM customer_images WHERE customer_id = ?';
    const result = queryBuilder.queryOne(sql, [customerId]);
    return result.total;
  }

  /**
   * Delete image (also deletes physical file)
   */
  async deleteImage(id) {
    const image = this.getById(id);
    
    if (!image) {
      const error = new Error(`Image with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    // Extract file path from URL
    // URL format: /uploads/customers/{customerId}/{filename}
    const urlParts = image.image_url.split('/');
    const customerId = urlParts[urlParts.length - 2];
    const filename = urlParts[urlParts.length - 1];
    
    // Delete physical file
    const uploadDir = await fileStorage.ensureUploadDir(customerId);
    const filePath = join(uploadDir, filename);
    await fileStorage.deleteFile(filePath);

    // Delete database record
    return this.delete(id);
  }

  /**
   * Delete all images for a customer (used when deleting customer)
   */
  async deleteAllByCustomer(customerId) {
    const images = this.getImagesByCustomer(customerId);

    // Delete all physical files and database records
    for (const image of images) {
      await this.deleteImage(image.id);
    }

    return true;
  }

  /**
   * Get total storage used by customer
   */
  getStorageUsed(customerId) {
    const sql = 'SELECT SUM(image_size) as total_size FROM customer_images WHERE customer_id = ?';
    const result = queryBuilder.queryOne(sql, [customerId]);
    return result.total_size || 0;
  }

  /**
   * Get image statistics
   */
  getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_images,
        SUM(image_size) as total_size,
        AVG(image_size) as avg_size,
        COUNT(DISTINCT customer_id) as customers_with_images
      FROM customer_images
    `;
    return queryBuilder.queryOne(sql);
  }
}

// Export singleton instance
export default new ImageService();
