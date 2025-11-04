/**
 * Inquiry Routes
 * RESTful API endpoints for inquiry management
 */

import express from 'express';
import InquiryService from '../services/InquiryService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/v1/inquiries
 * Get all inquiries with optional filters and pagination
 */
router.get('/', (req, res, next) => {
  try {
    const { status, customer_id, limit = 100, offset = 0 } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (customer_id) filters.customer_id = customer_id;

    const result = InquiryService.getAllInquiriesEnriched(
      filters,
      parseInt(limit),
      parseInt(offset)
    );

    logger.debug(`Retrieved ${result.data.length} inquiries`);
    res.json(paginatedResponse(result.data, result.total, result.limit, result.offset));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/inquiries/stats
 * Get inquiry statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const stats = InquiryService.getStatistics();
    logger.debug('Retrieved inquiry statistics');
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/inquiries/:id
 * Get single inquiry by ID
 */
router.get('/:id', (req, res, next) => {
  try {
    const inquiry = InquiryService.getInquiryByIdEnriched(req.params.id);
    logger.debug(`Retrieved inquiry ${req.params.id}`);
    res.json(successResponse(inquiry));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/inquiries
 * Create new inquiry
 */
router.post('/', (req, res, next) => {
  try {
    const inquiry = InquiryService.createInquiry(req.body);
    logger.info(`Created inquiry ${inquiry.id}`);
    res.status(201).json(successResponse(inquiry));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/inquiries/:id
 * Update inquiry
 */
router.put('/:id', (req, res, next) => {
  try {
    const inquiry = InquiryService.updateInquiry(req.params.id, req.body);
    logger.info(`Updated inquiry ${req.params.id}`);
    res.json(successResponse(inquiry));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/inquiries/:id
 * Delete inquiry
 */
router.delete('/:id', (req, res, next) => {
  try {
    InquiryService.delete(req.params.id);
    logger.info(`Deleted inquiry ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/inquiries/:id/convert
 * Convert inquiry to order
 */
router.post('/:id/convert', (req, res, next) => {
  try {
    const inquiry = InquiryService.convertToOrder(req.params.id);
    logger.info(`Converted inquiry ${req.params.id} to order`);
    res.json(successResponse(inquiry));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/inquiries/:id/reject
 * Reject inquiry
 */
router.post('/:id/reject', (req, res, next) => {
  try {
    const { notes } = req.body;
    const inquiry = InquiryService.rejectInquiry(req.params.id, notes);
    logger.info(`Rejected inquiry ${req.params.id}`);
    res.json(successResponse(inquiry));
  } catch (error) {
    next(error);
  }
});

export default router;
