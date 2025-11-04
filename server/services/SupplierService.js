/**
 * Supplier COG (Cost of Goods) Service
 * Handles all business logic for product supplier cost management
 * Extends BaseService for reusable CRUD operations
 */

import BaseService from './BaseService.js';
import * as queryBuilder from '../database/queryBuilder.js';

class SupplierService extends BaseService {
  constructor() {
    super('supplier_cog');
  }

  /**
   * Validate supplier COG data
   */
  validateSupplierCOG(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.product_id) {
      errors.push('product_id is required');
    }

    if (!isUpdate && !data.supplier_name) {
      errors.push('supplier_name is required');
    }

    if (data.supplier_name && data.supplier_name.trim() === '') {
      errors.push('supplier_name must not be empty');
    }

    if (!isUpdate && (data.cost === undefined || data.cost === null)) {
      errors.push('cost is required');
    }

    if (data.cost !== undefined && data.cost !== null && data.cost < 0) {
      errors.push('cost must be non-negative');
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
   * Create supplier COG with validation
   */
  createSupplierCOG(data) {
    this.validateSupplierCOG(data);
    this.verifyProductExists(data.product_id);
    
    // Convert boolean to integer for SQLite
    const supplierData = {
      ...data,
      is_primary: data.is_primary ? 1 : 0,
      apply_to_all_part_no: data.apply_to_all_part_no ? 1 : 0
    };

    const result = this.create(supplierData);

    // Handle apply_to_all_part_no logic
    if (data.apply_to_all_part_no) {
      this.applyToAllPartNumbers(data.product_id, data.supplier_name, data.cost);
    }

    return result;
  }

  /**
   * Update supplier COG with validation
   */
  updateSupplierCOG(id, data) {
    if (data.product_id) {
      this.verifyProductExists(data.product_id);
    }
    
    this.validateSupplierCOG(data, true);
    
    // Convert boolean to integer for SQLite
    const supplierData = { ...data };
    if (data.is_primary !== undefined) {
      supplierData.is_primary = data.is_primary ? 1 : 0;
    }
    if (data.apply_to_all_part_no !== undefined) {
      supplierData.apply_to_all_part_no = data.apply_to_all_part_no ? 1 : 0;
    }

    return this.update(id, supplierData);
  }

  /**
   * Apply cost to all products with matching part number
   */
  applyToAllPartNumbers(productId, supplierName, cost) {
    // Get the part_no of the current product
    const productSql = 'SELECT part_no FROM products WHERE id = ?';
    const product = queryBuilder.queryOne(productSql, [productId]);

    if (!product) {
      return;
    }

    // Find all products with same part_no
    const samePartNoSql = 'SELECT id FROM products WHERE part_no = ? AND id != ?';
    const samePartProducts = queryBuilder.queryAll(samePartNoSql, [product.part_no, productId]);

    // Apply cost to each product
    return queryBuilder.transaction(() => {
      return samePartProducts.map(p => {
        // Check if supplier already exists for this product
        const existingSql = 'SELECT id FROM supplier_cog WHERE product_id = ? AND supplier_name = ?';
        const existing = queryBuilder.queryOne(existingSql, [p.id, supplierName]);

        if (existing) {
          // Update existing
          return this.update(existing.id, { cost });
        } else {
          // Create new
          return this.create({
            product_id: p.id,
            supplier_name: supplierName,
            cost,
            is_primary: 0,
            apply_to_all_part_no: 0
          });
        }
      });
    });
  }

  /**
   * Get all suppliers for a product
   */
  getSuppliersByProduct(productId) {
    const sql = 'SELECT * FROM supplier_cog WHERE product_id = ? ORDER BY is_primary DESC, cost ASC';
    return queryBuilder.queryAll(sql, [productId]);
  }

  /**
   * Get primary supplier for a product
   */
  getPrimarySupplier(productId) {
    const sql = 'SELECT * FROM supplier_cog WHERE product_id = ? AND is_primary = 1 LIMIT 1';
    return queryBuilder.queryOne(sql, [productId]);
  }

  /**
   * Get lowest cost supplier for a product
   */
  getLowestCostSupplier(productId) {
    const sql = 'SELECT * FROM supplier_cog WHERE product_id = ? ORDER BY cost ASC LIMIT 1';
    return queryBuilder.queryOne(sql, [productId]);
  }

  /**
   * Set supplier as primary (unset others)
   */
  setPrimarySupplier(supplierId) {
    const supplier = this.getById(supplierId);
    
    if (!supplier) {
      const error = new Error(`Supplier with id ${supplierId} not found`);
      error.statusCode = 404;
      throw error;
    }

    return queryBuilder.transaction(() => {
      // Unset all primary suppliers for this product
      const unsetSql = 'UPDATE supplier_cog SET is_primary = 0 WHERE product_id = ?';
      queryBuilder.executeRaw(unsetSql, [supplier.product_id]);

      // Set this supplier as primary
      return this.update(supplierId, { is_primary: 1 });
    });
  }

  /**
   * Get suppliers by supplier name (across all products)
   */
  getBySupplierName(supplierName) {
    const sql = `
      SELECT 
        sc.*,
        p.part_no,
        p.description
      FROM supplier_cog sc
      LEFT JOIN products p ON sc.product_id = p.id
      WHERE sc.supplier_name = ?
      ORDER BY p.part_no
    `;
    return queryBuilder.queryAll(sql, [supplierName]);
  }

  /**
   * Get all unique supplier names
   */
  getAllSupplierNames() {
    const sql = 'SELECT DISTINCT supplier_name FROM supplier_cog ORDER BY supplier_name';
    const results = queryBuilder.queryAll(sql);
    return results.map(r => r.supplier_name);
  }

  /**
   * Get supplier statistics
   */
  getStatistics() {
    const sql = `
      SELECT 
        supplier_name,
        COUNT(*) as product_count,
        AVG(cost) as avg_cost,
        MIN(cost) as min_cost,
        MAX(cost) as max_cost
      FROM supplier_cog
      GROUP BY supplier_name
      ORDER BY product_count DESC
    `;
    return queryBuilder.queryAll(sql);
  }

  /**
   * Delete supplier COG
   */
  deleteSupplierCOG(id) {
    const supplier = this.getById(id);
    if (!supplier) {
      const error = new Error(`Supplier with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return this.delete(id);
  }
}

// Export singleton instance
export default new SupplierService();
