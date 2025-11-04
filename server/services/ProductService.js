/**
 * Product Service
 * Handles all business logic for product management
 * Extends BaseService for reusable CRUD operations
 */

import BaseService from './BaseService.js';
import * as queryBuilder from '../database/queryBuilder.js';

class ProductService extends BaseService {
  constructor() {
    super('products');
  }

  /**
   * Validate product data
   */
  validateProduct(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.part_no) {
      errors.push('part_no is required');
    }

    if (data.part_no && data.part_no.trim() === '') {
      errors.push('part_no must not be empty');
    }

    if (!isUpdate && !data.category) {
      errors.push('category is required');
    }

    if (data.category && data.category.trim() === '') {
      errors.push('category must not be empty');
    }

    if (!isUpdate && !data.status) {
      errors.push('status is required');
    }

    const validStatuses = ['active', 'inactive', 'discontinued'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate quantity fields are non-negative
    const quantityFields = ['no_of_holes', 'no_of_cylinder', 'reorder_quantity', 'replenish_quantity', 'no_of_pieces_per_box'];
    quantityFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] < 0) {
        errors.push(`${field} must be non-negative`);
      }
    });

    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = errors;
      throw error;
    }

    return true;
  }

  /**
   * Create product with validation
   */
  createProduct(data) {
    this.validateProduct(data);
    
    // Check for duplicate part_no
    const existing = queryBuilder.queryOne('SELECT id FROM products WHERE part_no = ?', [data.part_no]);
    if (existing) {
      const error = new Error(`Product with part_no ${data.part_no} already exists`);
      error.statusCode = 409;
      throw error;
    }

    return this.create(data);
  }

  /**
   * Update product with validation
   */
  updateProduct(id, data) {
    this.validateProduct(data, true);
    
    // Check for duplicate part_no if being updated
    if (data.part_no) {
      const existing = queryBuilder.queryOne('SELECT id FROM products WHERE part_no = ? AND id != ?', [data.part_no, id]);
      if (existing) {
        const error = new Error(`Product with part_no ${data.part_no} already exists`);
        error.statusCode = 409;
        throw error;
      }
    }

    return this.update(id, data);
  }

  /**
   * Get products with enriched data (suppliers and prices)
   */
  getProductsEnriched(filters = {}, limit = 100, offset = 0) {
    const { whereClause, params } = this.buildProductWhereClause(filters);
    
    const sql = `
      SELECT 
        p.*,
        COUNT(DISTINCT sc.id) as supplier_count
      FROM products p
      LEFT JOIN supplier_cog sc ON p.id = sc.product_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const data = queryBuilder.queryAll(sql, [...params, limit, offset]);

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const countResult = queryBuilder.queryOne(countSql, params);

    return {
      data,
      total: countResult.total,
      limit,
      offset
    };
  }

  /**
   * Build WHERE clause for product queries with filters
   */
  buildProductWhereClause(filters) {
    const conditions = [];
    const params = [];

    if (filters.category) {
      conditions.push('p.category = ?');
      params.push(filters.category);
    }

    if (filters.brand) {
      conditions.push('p.brand = ?');
      params.push(filters.brand);
    }

    if (filters.status) {
      conditions.push('p.status = ?');
      params.push(filters.status);
    }

    if (filters.part_no) {
      conditions.push('p.part_no LIKE ?');
      params.push(`%${filters.part_no}%`);
    }

    if (filters.barcode) {
      conditions.push('p.barcode = ?');
      params.push(filters.barcode);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  /**
   * Get single product with full details (suppliers and all price groups)
   */
  getProductByIdFull(id) {
    const product = this.getById(id);
    
    if (!product) {
      const error = new Error(`Product with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    // Get suppliers
    const suppliersSql = 'SELECT * FROM supplier_cog WHERE product_id = ? ORDER BY is_primary DESC, created_at DESC';
    const suppliers = queryBuilder.queryAll(suppliersSql, [id]);

    // Get price lists
    const pricesSql = 'SELECT * FROM product_price_lists WHERE product_id = ?';
    const priceRecords = queryBuilder.queryAll(pricesSql, [id]);
    
    // Transform price records into object
    const prices = {};
    priceRecords.forEach(record => {
      prices[record.price_group] = record.price;
    });

    // Calculate lowest supplier cost
    const lowestCost = suppliers.length > 0 
      ? Math.min(...suppliers.map(s => s.cost))
      : null;

    return {
      ...product,
      suppliers,
      prices,
      lowest_supplier_cost: lowestCost
    };
  }

  /**
   * Get product by part number
   */
  getByPartNumber(partNo) {
    const sql = 'SELECT * FROM products WHERE part_no = ?';
    const product = queryBuilder.queryOne(sql, [partNo]);
    
    if (!product) {
      const error = new Error(`Product with part_no ${partNo} not found`);
      error.statusCode = 404;
      throw error;
    }

    return this.getProductByIdFull(product.id);
  }

  /**
   * Get product by barcode
   */
  getByBarcode(barcode) {
    const sql = 'SELECT * FROM products WHERE barcode = ?';
    const product = queryBuilder.queryOne(sql, [barcode]);
    
    if (!product) {
      const error = new Error(`Product with barcode ${barcode} not found`);
      error.statusCode = 404;
      throw error;
    }

    return this.getProductByIdFull(product.id);
  }

  /**
   * Get product price for specific price group
   */
  getProductPrice(productId, priceGroup) {
    const sql = 'SELECT price FROM product_price_lists WHERE product_id = ? AND price_group = ?';
    const result = queryBuilder.queryOne(sql, [productId, priceGroup]);
    
    if (!result) {
      return null;
    }

    return result.price;
  }

  /**
   * Search products by name, part number, or description
   */
  searchProducts(searchTerm, limit = 100, offset = 0) {
    const sql = `
      SELECT 
        p.*,
        COUNT(DISTINCT sc.id) as supplier_count
      FROM products p
      LEFT JOIN supplier_cog sc ON p.id = sc.product_id
      WHERE p.part_no LIKE ?
         OR p.item_code LIKE ?
         OR p.description LIKE ?
         OR p.barcode LIKE ?
      GROUP BY p.id
      ORDER BY p.part_no
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${searchTerm}%`;
    const data = queryBuilder.queryAll(sql, [searchPattern, searchPattern, searchPattern, searchPattern, limit, offset]);

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total 
      FROM products 
      WHERE part_no LIKE ? OR item_code LIKE ? OR description LIKE ? OR barcode LIKE ?
    `;
    const countResult = queryBuilder.queryOne(countSql, [searchPattern, searchPattern, searchPattern, searchPattern]);

    return {
      data,
      total: countResult.total,
      limit,
      offset
    };
  }

  /**
   * Get products by category
   */
  getByCategory(category, limit = 100, offset = 0) {
    return this.getProductsEnriched({ category }, limit, offset);
  }

  /**
   * Get products by brand
   */
  getByBrand(brand, limit = 100, offset = 0) {
    return this.getProductsEnriched({ brand }, limit, offset);
  }

  /**
   * Get products below reorder quantity (inventory alert)
   */
  getProductsBelowReorder() {
    const sql = `
      SELECT * FROM products 
      WHERE reorder_quantity IS NOT NULL 
        AND status = 'active'
      ORDER BY part_no
    `;
    return queryBuilder.queryAll(sql);
  }

  /**
   * Get product statistics
   */
  getStatistics() {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(DISTINCT category) as categories
      FROM products
      GROUP BY status
    `;
    const stats = queryBuilder.queryAll(sql);
    
    // Get statistics by category
    const categorySql = `
      SELECT 
        category,
        COUNT(*) as count
      FROM products
      WHERE status = 'active'
      GROUP BY category
    `;
    const categoryStats = queryBuilder.queryAll(categorySql);

    // Get statistics by brand
    const brandSql = `
      SELECT 
        brand,
        COUNT(*) as count
      FROM products
      WHERE status = 'active' AND brand IS NOT NULL
      GROUP BY brand
    `;
    const brandStats = queryBuilder.queryAll(brandSql);

    return {
      by_status: stats,
      by_category: categoryStats,
      by_brand: brandStats,
      total: stats.reduce((sum, stat) => sum + stat.count, 0)
    };
  }

  /**
   * Delete product (will cascade delete suppliers and prices)
   */
  deleteProduct(id) {
    const product = this.getById(id);
    if (!product) {
      const error = new Error(`Product with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    // The database will handle cascade deletion
    return this.delete(id);
  }
}

// Export singleton instance
export default new ProductService();
