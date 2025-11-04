/**
 * Image Routes
 * RESTful API endpoints for customer image management
 */

import express from 'express';
import ImageService from '../services/ImageService.js';
import { upload } from '../middleware/upload.js';
import { successResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ensureUploadDir } from '../utils/fileStorage.js';

const router = express.Router();

/**
 * GET /api/v1/customers/:customerId/images
 * Get all images for a customer
 */
router.get('/customers/:customerId/images', (req, res, next) => {
  try {
    const { name_starts_with } = req.query;
    const filters = {};
    if (name_starts_with) filters.name_starts_with = name_starts_with;

    const images = ImageService.getImagesByCustomer(req.params.customerId, filters);
    logger.debug(`Retrieved ${images.length} images for customer ${req.params.customerId}`);
    res.json(successResponse(images, images.length));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/customers/:customerId/images
 * Upload image for a customer
 */
router.post('/customers/:customerId/images', async (req, res, next) => {
  try {
    // Ensure directory exists before upload
    await ensureUploadDir(req.params.customerId);
    
    // Use upload middleware
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      try {
        const { description } = req.body;
        const image = await ImageService.processUpload(
          req.file,
          req.params.customerId,
          description
        );
        
        logger.info(`Uploaded image ${image.id} for customer ${req.params.customerId}`);
        res.status(201).json(successResponse(image));
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/images/:id
 * Get single image by ID
 */
router.get('/images/:id', (req, res, next) => {
  try {
    const image = ImageService.getImageWithCustomer(req.params.id);
    logger.debug(`Retrieved image ${req.params.id}`);
    res.json(successResponse(image));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/images/:id
 * Update image metadata (description)
 */
router.put('/images/:id', (req, res, next) => {
  try {
    const image = ImageService.updateImage(req.params.id, req.body);
    logger.info(`Updated image ${req.params.id}`);
    res.json(successResponse(image));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/images/:id
 * Delete image (also deletes physical file)
 */
router.delete('/images/:id', async (req, res, next) => {
  try {
    await ImageService.deleteImage(req.params.id);
    logger.info(`Deleted image ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/images/stats
 * Get image statistics
 */
router.get('/images/stats', (req, res, next) => {
  try {
    const stats = ImageService.getStatistics();
    logger.debug('Retrieved image statistics');
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
});

export default router;
