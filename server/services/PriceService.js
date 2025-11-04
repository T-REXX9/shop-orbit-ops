/**
 * Price List Service  
 * Handles all business logic for product pricing across different price groups
 * Extends BaseService for reusable CRUD operations
 */

import BaseService from './BaseService.js';
import * as queryBuilder from '../database/queryBuilder.js';

// Valid price groups
const VALID_PRICE_GROUPS = [
  'regular_aaa', 'regular_aab', 'regular_acc', 'regular_add',
  'regular_baa', 'regular_bbb', 'regular_bcc', 'regular_bdd',
  'vip1', 'vip2'
];

class PriceService extends BaseService {
  constructor() {
    super('product_price_lists');
  }

  /**
   * Validate price data
   */
  validatePrice(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.product_id) {
      errors.push('product_id is required');
    }

    if (!isUpdate && !data.price_group) {
      errors.push('price_group is required');
    }

    if (data.price_group && !VALID_PRICE_GROUPS.includes(data.price_group)) {
      errors.push(`price_group must be one of: ${VALID_PRICE_GROUPS.join(', ')}`);
    }

    if (!isUpdate && (data.price === undefined || data.price === null)) {
      errors.push('price is required');
    }

    if (data.price !== undefined && data.price !== null && data.price < 0) {
      errors.push('price must be non-negative');
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
   * Verify that product exists
   */
  verifyProductExists(productId) {
    const sql = 'SELECT id FROM products WHERE id = ?';
    const product = queryBuilder.queryOne(sql, [productId]);
    
    if (!product) {
      const error = new Error(`Product with id ${productId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    return true;
  }

  /**
   * Create price list entry with validation
   */
  createPrice(data) {
    this.validatePrice(data);
    this.verifyProductExists(data.product_id);
    
    // Check for duplicate (product_id + price_group should be unique)
    const existing = queryBuilder.queryOne(
      'SELECT id FROM product_price_lists WHERE product_id = ? AND price_group = ?',
      [data.product_id, data.price_group]
    );
    
    if (existing) {
      const error = new Error(`Price for ${data.price_group} already exists for this product`);
      error.statusCode = 409;
      throw error;
    }

    return this.create(data);
  }

  /**
   * Update price with validation
   */
  updatePrice(id, data) {
    if (data.product_id) {
      this.verifyProductExists(data.product_id);
    }
    
    this.validatePrice(data, true);
    return this.update(id, data);
  }

  /**
   * Get all prices for a product (as object with price_group keys)
   */
  getPricesForProduct(productId) {
    const sql = 'SELECT * FROM product_price_lists WHERE product_id = ?';
    const priceRecords = queryBuilder.queryAll(sql, [productId]);
    
    // Transform array to object
    const prices = {};
    priceRecords.forEach(record => {
      prices[record.price_group] = {
        id: record.id,
        price: record.price,
        created_at: record.created_at,
        updated_at: record.updated_at
      };
    });

    return prices;
  }

  /**
   * Get price for specific product and price group
   */
  getPrice(productId, priceGroup) {
    const sql = 'SELECT * FROM product_price_lists WHERE product_id = ? AND price_group = ?';
    const price = queryBuilder.queryOne(sql, [productId, priceGroup]);
    
    if (!price) {
      return null;
    }

    return price;
  }

  /**
   * Set or update multiple prices for a product
   */
  setProductPrices(productId, pricesObject) {
    this.verifyProductExists(productId);

    return queryBuilder.transaction(() => {
      const results = [];

      Object.entries(pricesObject).forEach(([priceGroup, price]) => {
        // Validate price group
        if (!VALID_PRICE_GROUPS.includes(priceGroup)) {
          throw new Error(`Invalid price group: ${priceGroup}`);
        }

        // Check if price exists
        const existing = queryBuilder.queryOne(
          'SELECT id FROM product_price_lists WHERE product_id = ? AND price_group = ?',
          [productId, priceGroup]
        );

        if (existing) {
          // Update existing price
          results.push(this.update(existing.id, { price }));
        } else {
          // Create new price
          results.push(this.create({
            product_id: productId,
            price_group: priceGroup,
            price
          }));
        }
      });

      return results;
    });
  }

  /**
   * Bulk update prices for specific price group across multiple products
   */
  bulkUpdatePrices(priceGroup, updates) {
    // Validate price group
    if (!VALID_PRICE_GROUPS.includes(priceGroup)) {
      const error = new Error(`Invalid price group: ${priceGroup}`);
      error.statusCode = 400;
      throw error;
    }

    return queryBuilder.transaction(() => {
      return updates.map(({ product_id, price }) => {
        this.verifyProductExists(product_id);

        // Check if price exists
        const existing = queryBuilder.queryOne(
          'SELECT id FROM product_price_lists WHERE product_id = ? AND price_group = ?',
          [product_id, priceGroup]
        );

        if (existing) {
          return this.update(existing.id, { price });
        } else {
          return this.create({
            product_id,
            price_group: priceGroup,
            price
          });
        }
      });
    });
  }

  /**
   * Apply percentage increase/decrease to all products in a price group
   */
  adjustPricesByPercentage(priceGroup, percentage) {
    // Validate price group
    if (!VALID_PRICE_GROUPS.includes(priceGroup)) {
      const error = new Error(`Invalid price group: ${priceGroup}`);
      error.statusCode = 400;
      throw error;
    }

    const sql = 'SELECT * FROM product_price_lists WHERE price_group = ?';
    const prices = queryBuilder.queryAll(sql, [priceGroup]);

    return queryBuilder.transaction(() => {
      return prices.map(priceRecord => {
        const newPrice = priceRecord.price * (1 + percentage / 100);
        return this.update(priceRecord.id, { price: newPrice });
      });
    });
  }

  /**
   * Get all products and their prices for a specific price group
   */
  getProductsByPriceGroup(priceGroup, limit = 100, offset = 0) {
    const sql = `
      SELECT 
        p.*,
        pp.price,
        pp.id as price_id
      FROM products p
      INNER JOIN product_price_lists pp ON p.id = pp.product_id
      WHERE pp.price_group = ?
      ORDER BY p.part_no
      LIMIT ? OFFSET ?
    `;

    const data = queryBuilder.queryAll(sql, [priceGroup, limit, offset]);

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total 
      FROM products p
      INNER JOIN product_price_lists pp ON p.id = pp.product_id
      WHERE pp.price_group = ?
    `;
    const countResult = queryBuilder.queryOne(countSql, [priceGroup]);

    return {
      data,
      total: countResult.total,
      limit,
      offset
    };
  }

  /**
   * Copy prices from one price group to another
   */
  copyPrices(fromPriceGroup, toPriceGroup) {
    // Validate price groups
    if (!VALID_PRICE_GROUPS.includes(fromPriceGroup) || !VALID_PRICE_GROUPS.includes(toPriceGroup)) {
      const error = new Error('Invalid price group');
      error.statusCode = 400;
      throw error;
    }

    const sql = 'SELECT * FROM product_price_lists WHERE price_group = ?';
    const sourcePrices = queryBuilder.queryAll(sql, [fromPriceGroup]);

    return queryBuilder.transaction(() => {
      return sourcePrices.map(sourcePrice => {
        // Check if destination price exists
        const existing = queryBuilder.queryOne(
          'SELECT id FROM product_price_lists WHERE product_id = ? AND price_group = ?',
          [sourcePrice.product_id, toPriceGroup]
        );

        if (existing) {
          return this.update(existing.id, { price: sourcePrice.price });
        } else {
          return this.create({
            product_id: sourcePrice.product_id,
            price_group: toPriceGroup,
            price: sourcePrice.price
          });
        }
      });
    });
  }

  /**
   * Get price statistics by price group
   */
  getStatistics() {
    const sql = `
      SELECT 
        price_group,
        COUNT(*) as product_count,
        AVG(price) as avg_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM product_price_lists
      GROUP BY price_group
      ORDER BY price_group
    `;
    return queryBuilder.queryAll(sql);
  }

  /**
   * Delete price
   */
  deletePrice(id) {
    const price = this.getById(id);
    if (!price) {
      const error = new Error(`Price with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return this.delete(id);
  }

  /**
   * Get valid price groups
   */
  getValidPriceGroups() {
    return VALID_PRICE_GROUPS;
  }
}

// Export singleton instance
export default new PriceService();
