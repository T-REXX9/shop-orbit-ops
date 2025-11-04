/**
 * Inquiry Service
 * Handles all business logic for sales inquiries
 * Extends BaseService for reusable CRUD operations
 */

import BaseService from './BaseService.js';
import * as queryBuilder from '../database/queryBuilder.js';

class InquiryService extends BaseService {
  constructor() {
    super('inquiries');
  }

  /**
   * Validate inquiry data
   */
  validateInquiry(data) {
    const errors = [];

    if (!data.customer_id) {
      errors.push('customer_id is required');
    }

    if (!data.product_id) {
      errors.push('product_id is required');
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push('quantity must be a positive number');
    }

    if (!data.status) {
      errors.push('status is required');
    }

    const validStatuses = ['pending', 'converted', 'rejected'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }

    if (data.notes && data.notes.length > 1000) {
      errors.push('notes must not exceed 1000 characters');
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
   * Create inquiry with validation
   */
  createInquiry(data) {
    this.validateInquiry(data);
    this.verifyCustomerExists(data.customer_id);
    this.verifyProductExists(data.product_id);
    
    return this.create(data);
  }

  /**
   * Update inquiry with validation
   */
  updateInquiry(id, data) {
    if (data.customer_id) {
      this.verifyCustomerExists(data.customer_id);
    }
    
    if (data.product_id) {
      this.verifyProductExists(data.product_id);
    }
    
    // Validate only provided fields
    const partialValidation = { ...data };
    if (!partialValidation.status) {
      partialValidation.status = 'pending'; // Provide default for validation
    }
    if (!partialValidation.quantity) {
      partialValidation.quantity = 1; // Provide default for validation
    }
    
    this.validateInquiry(partialValidation);
    
    return this.update(id, data);
  }

  /**
   * Get inquiries with customer and product names (enriched data)
   */
  getAllInquiriesEnriched(filters = {}, limit = 100, offset = 0) {
    const sql = `
      SELECT 
        i.*,
        c.customer_name,
        p.part_no as product_name
      FROM inquiries i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN products p ON i.product_id = p.id
      ${this.buildEnrichedWhereClause(filters)}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const params = this.buildEnrichedParams(filters);
    const data = queryBuilder.queryAll(sql, [...params, limit, offset]);

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM inquiries i
      ${this.buildEnrichedWhereClause(filters)}
    `;
    const countResult = queryBuilder.queryOne(countSql, params);

    return {
      data,
      total: countResult.total,
      limit,
      offset
    };
  }

  /**
   * Build WHERE clause for enriched queries
   */
  buildEnrichedWhereClause(filters) {
    const conditions = [];

    if (filters.status) {
      conditions.push('i.status = ?');
    }

    if (filters.customer_id) {
      conditions.push('i.customer_id = ?');
    }

    if (filters.product_id) {
      conditions.push('i.product_id = ?');
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  /**
   * Build parameters array for enriched queries
   */
  buildEnrichedParams(filters) {
    const params = [];

    if (filters.status) {
      params.push(filters.status);
    }

    if (filters.customer_id) {
      params.push(filters.customer_id);
    }

    if (filters.product_id) {
      params.push(filters.product_id);
    }

    return params;
  }

  /**
   * Get single inquiry with enriched data
   */
  getInquiryByIdEnriched(id) {
    const sql = `
      SELECT 
        i.*,
        c.customer_name,
        c.email,
        c.phone,
        p.part_no as product_name,
        p.description as product_description,
        p.category as product_category
      FROM inquiries i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN products p ON i.product_id = p.id
      WHERE i.id = ?
    `;

    const inquiry = queryBuilder.queryOne(sql, [id]);
    
    if (!inquiry) {
      const error = new Error(`Inquiry with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return inquiry;
  }

  /**
   * Get inquiries by customer
   */
  getInquiriesByCustomer(customerId, limit = 100, offset = 0) {
    return this.getAllInquiriesEnriched({ customer_id: customerId }, limit, offset);
  }

  /**
   * Get inquiries by product
   */
  getInquiriesByProduct(productId, limit = 100, offset = 0) {
    return this.getAllInquiriesEnriched({ product_id: productId }, limit, offset);
  }

  /**
   * Get inquiries by status
   */
  getInquiriesByStatus(status, limit = 100, offset = 0) {
    return this.getAllInquiriesEnriched({ status }, limit, offset);
  }

  /**
   * Convert inquiry to order (business logic)
   */
  convertToOrder(inquiryId) {
    const inquiry = this.getById(inquiryId);
    
    if (!inquiry) {
      const error = new Error(`Inquiry with id ${inquiryId} not found`);
      error.statusCode = 404;
      throw error;
    }

    if (inquiry.status === 'converted') {
      const error = new Error('Inquiry has already been converted');
      error.statusCode = 400;
      throw error;
    }

    // Update status to converted
    return this.update(inquiryId, { status: 'converted' });
  }

  /**
   * Reject inquiry
   */
  rejectInquiry(inquiryId, notes = null) {
    const updateData = { status: 'rejected' };
    if (notes) {
      updateData.notes = notes;
    }
    
    return this.update(inquiryId, updateData);
  }

  /**
   * Get inquiry statistics
   */
  getStatistics() {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(quantity) as total_quantity
      FROM inquiries
      GROUP BY status
    `;

    const stats = queryBuilder.queryAll(sql);
    
    return {
      by_status: stats,
      total: stats.reduce((sum, stat) => sum + stat.count, 0)
    };
  }
}

// Export singleton instance
export default new InquiryService();
