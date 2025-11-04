/**
 * Customer Routes
 * RESTful API endpoints for customer management
 */

import express from 'express';
import CustomerService from '../services/CustomerService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/v1/customers
 * Get all customers with optional filters and pagination
 */
router.get('/', (req, res, next) => {
  try {
    const { 
      status, team, salesman, province, city, business_line, 
      name_starts_with, limit = 100, offset = 0 
    } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (team) filters.team = team;
    if (salesman) filters.salesman = salesman;
    if (province) filters.province = province;
    if (city) filters.city = city;
    if (business_line) filters.business_line = business_line;
    if (name_starts_with) filters.name_starts_with = name_starts_with;

    const result = CustomerService.getCustomersEnriched(
      filters,
      parseInt(limit),
      parseInt(offset)
    );

    logger.debug(`Retrieved ${result.data.length} customers`);
    res.json(paginatedResponse(result.data, result.total, result.limit, result.offset));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/customers/search
 * Search customers by name or other fields
 */
router.get('/search', (req, res, next) => {
  try {
    const { q, limit = 100, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query (q) is required' });
    }

    const result = CustomerService.searchCustomers(q, parseInt(limit), parseInt(offset));
    logger.debug(`Search returned ${result.data.length} customers`);
    res.json(paginatedResponse(result.data, result.total, result.limit, result.offset));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/customers/stats
 * Get customer statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const stats = CustomerService.getStatistics();
    logger.debug('Retrieved customer statistics');
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/customers/:id
 * Get single customer by ID with full details
 */
router.get('/:id', (req, res, next) => {
  try {
    const customer = CustomerService.getCustomerByIdFull(req.params.id);
    logger.debug(`Retrieved customer ${req.params.id}`);
    res.json(successResponse(customer));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/customers
 * Create new customer
 */
router.post('/', (req, res, next) => {
  try {
    const customer = CustomerService.createCustomer(req.body);
    logger.info(`Created customer ${customer.id}`);
    res.status(201).json(successResponse(customer));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/customers/:id
 * Update customer
 */
router.put('/:id', (req, res, next) => {
  try {
    const customer = CustomerService.updateCustomer(req.params.id, req.body);
    logger.info(`Updated customer ${req.params.id}`);
    res.json(successResponse(customer));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/customers/:id
 * Delete customer (cascades to contacts and images)
 */
router.delete('/:id', (req, res, next) => {
  try {
    CustomerService.deleteCustomer(req.params.id);
    logger.info(`Deleted customer ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
