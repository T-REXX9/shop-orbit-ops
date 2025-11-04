/**
 * Product Routes
 * RESTful API endpoints for product management
 */

import express from 'express';
import ProductService from '../services/ProductService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/v1/products
 * Get all products with optional filters and pagination
 */
router.get('/', (req, res, next) => {
  try {
    const { 
      category, brand, status, part_no, barcode, 
      limit = 100, offset = 0 
    } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (status) filters.status = status;
    if (part_no) filters.part_no = part_no;
    if (barcode) filters.barcode = barcode;

    const result = ProductService.getProductsEnriched(
      filters,
      parseInt(limit),
      parseInt(offset)
    );

    logger.debug(`Retrieved ${result.data.length} products`);
    res.json(paginatedResponse(result.data, result.total, result.limit, result.offset));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/products/search
 * Search products by name, part number, or description
 */
router.get('/search', (req, res, next) => {
  try {
    const { q, limit = 100, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query (q) is required' });
    }

    const result = ProductService.searchProducts(q, parseInt(limit), parseInt(offset));
    logger.debug(`Search returned ${result.data.length} products`);
    res.json(paginatedResponse(result.data, result.total, result.limit, result.offset));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/products/stats
 * Get product statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const stats = ProductService.getStatistics();
    logger.debug('Retrieved product statistics');
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/products/part/:partNo
 * Get product by part number
 */
router.get('/part/:partNo', (req, res, next) => {
  try {
    const product = ProductService.getByPartNumber(req.params.partNo);
    logger.debug(`Retrieved product by part number ${req.params.partNo}`);
    res.json(successResponse(product));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/products/:id
 * Get single product by ID with full details
 */
router.get('/:id', (req, res, next) => {
  try {
    const product = ProductService.getProductByIdFull(req.params.id);
    logger.debug(`Retrieved product ${req.params.id}`);
    res.json(successResponse(product));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/products/:id/price/:priceGroup
 * Get product price for specific price group
 */
router.get('/:id/price/:priceGroup', (req, res, next) => {
  try {
    const price = ProductService.getProductPrice(req.params.id, req.params.priceGroup);
    
    if (price === null) {
      return res.status(404).json({ 
        success: false, 
        message: `Price not found for price group ${req.params.priceGroup}` 
      });
    }

    logger.debug(`Retrieved price for product ${req.params.id}, group ${req.params.priceGroup}`);
    res.json(successResponse({ price_group: req.params.priceGroup, price }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/products
 * Create new product
 */
router.post('/', (req, res, next) => {
  try {
    const product = ProductService.createProduct(req.body);
    logger.info(`Created product ${product.id}`);
    res.status(201).json(successResponse(product));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/products/:id
 * Update product
 */
router.put('/:id', (req, res, next) => {
  try {
    const product = ProductService.updateProduct(req.params.id, req.body);
    logger.info(`Updated product ${req.params.id}`);
    res.json(successResponse(product));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/products/:id
 * Delete product (cascades to suppliers and prices)
 */
router.delete('/:id', (req, res, next) => {
  try {
    ProductService.deleteProduct(req.params.id);
    logger.info(`Deleted product ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
