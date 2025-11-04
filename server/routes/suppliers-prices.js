/**
 * Supplier and Price Routes
 * RESTful API endpoints for supplier COG and price list management
 */

import express from 'express';
import SupplierService from '../services/SupplierService.js';
import PriceService from '../services/PriceService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ============================================================================
// SUPPLIER COG ROUTES
// ============================================================================

/**
 * GET /api/v1/products/:productId/suppliers
 * Get all suppliers for a product
 */
router.get('/products/:productId/suppliers', (req, res, next) => {
  try {
    const suppliers = SupplierService.getSuppliersByProduct(req.params.productId);
    logger.debug(`Retrieved ${suppliers.length} suppliers for product ${req.params.productId}`);
    res.json(successResponse(suppliers, suppliers.length));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/products/:productId/suppliers
 * Add supplier to a product
 */
router.post('/products/:productId/suppliers', (req, res, next) => {
  try {
    const supplierData = {
      ...req.body,
      product_id: req.params.productId
    };
    const supplier = SupplierService.createSupplierCOG(supplierData);
    logger.info(`Created supplier ${supplier.id} for product ${req.params.productId}`);
    res.status(201).json(successResponse(supplier));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/suppliers/:id
 * Get single supplier by ID
 */
router.get('/suppliers/:id', (req, res, next) => {
  try {
    const supplier = SupplierService.getById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    logger.debug(`Retrieved supplier ${req.params.id}`);
    res.json(successResponse(supplier));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/suppliers/:id
 * Update supplier
 */
router.put('/suppliers/:id', (req, res, next) => {
  try {
    const supplier = SupplierService.updateSupplierCOG(req.params.id, req.body);
    logger.info(`Updated supplier ${req.params.id}`);
    res.json(successResponse(supplier));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/suppliers/:id
 * Delete supplier
 */
router.delete('/suppliers/:id', (req, res, next) => {
  try {
    SupplierService.deleteSupplierCOG(req.params.id);
    logger.info(`Deleted supplier ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/suppliers/:id/set-primary
 * Set supplier as primary
 */
router.post('/suppliers/:id/set-primary', (req, res, next) => {
  try {
    const supplier = SupplierService.setPrimarySupplier(req.params.id);
    logger.info(`Set supplier ${req.params.id} as primary`);
    res.json(successResponse(supplier));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/suppliers/stats
 * Get supplier statistics
 */
router.get('/suppliers/stats', (req, res, next) => {
  try {
    const stats = SupplierService.getStatistics();
    logger.debug('Retrieved supplier statistics');
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PRICE LIST ROUTES
// ============================================================================

/**
 * GET /api/v1/products/:productId/prices
 * Get all prices for a product
 */
router.get('/products/:productId/prices', (req, res, next) => {
  try {
    const prices = PriceService.getPricesForProduct(req.params.productId);
    logger.debug(`Retrieved prices for product ${req.params.productId}`);
    res.json(successResponse(prices));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/products/:productId/prices
 * Set or update multiple prices for a product
 */
router.put('/products/:productId/prices', (req, res, next) => {
  try {
    const result = PriceService.setProductPrices(req.params.productId, req.body);
    logger.info(`Updated prices for product ${req.params.productId}`);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/prices/groups
 * Get valid price groups
 */
router.get('/prices/groups', (req, res, next) => {
  try {
    const priceGroups = PriceService.getValidPriceGroups();
    logger.debug('Retrieved valid price groups');
    res.json(successResponse(priceGroups));
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/prices/bulk
 * Bulk update prices for specific price group across multiple products
 */
router.put('/prices/bulk', (req, res, next) => {
  try {
    const { price_group, updates } = req.body;
    
    if (!price_group || !updates || !Array.isArray(updates)) {
      return res.status(400).json({ 
        success: false, 
        message: 'price_group and updates array are required' 
      });
    }

    const result = PriceService.bulkUpdatePrices(price_group, updates);
    logger.info(`Bulk updated ${updates.length} prices for price group ${price_group}`);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/prices/adjust
 * Apply percentage adjustment to all products in a price group
 */
router.post('/prices/adjust', (req, res, next) => {
  try {
    const { price_group, percentage } = req.body;
    
    if (!price_group || percentage === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'price_group and percentage are required' 
      });
    }

    const result = PriceService.adjustPricesByPercentage(price_group, parseFloat(percentage));
    logger.info(`Adjusted prices for ${price_group} by ${percentage}%`);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/prices/copy
 * Copy prices from one price group to another
 */
router.post('/prices/copy', (req, res, next) => {
  try {
    const { from_price_group, to_price_group } = req.body;
    
    if (!from_price_group || !to_price_group) {
      return res.status(400).json({ 
        success: false, 
        message: 'from_price_group and to_price_group are required' 
      });
    }

    const result = PriceService.copyPrices(from_price_group, to_price_group);
    logger.info(`Copied prices from ${from_price_group} to ${to_price_group}`);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/prices/stats
 * Get price statistics
 */
router.get('/prices/stats', (req, res, next) => {
  try {
    const stats = PriceService.getStatistics();
    logger.debug('Retrieved price statistics');
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/prices/:id
 * Delete price
 */
router.delete('/prices/:id', (req, res, next) => {
  try {
    PriceService.deletePrice(req.params.id);
    logger.info(`Deleted price ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
