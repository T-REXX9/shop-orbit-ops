/**
 * Customer Service
 * Handles all business logic for customer management
 * Extends BaseService for reusable CRUD operations
 */

import BaseService from './BaseService.js';
import * as queryBuilder from '../database/queryBuilder.js';

class CustomerService extends BaseService {
  constructor() {
    super('customers');
  }

  /**
   * Validate customer data
   */
  validateCustomer(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.customer_name) {
      errors.push('customer_name is required');
    }

    if (data.customer_name && data.customer_name.trim() === '') {
      errors.push('customer_name must not be empty');
    }

    if (!isUpdate && !data.status) {
      errors.push('status is required');
    }

    if (data.vat_percentage !== undefined && data.vat_percentage !== null) {
      if (data.vat_percentage < 0 || data.vat_percentage > 100) {
        errors.push('vat_percentage must be between 0 and 100');
      }
    }

    if (data.credit_limit !== undefined && data.credit_limit !== null) {
      if (data.credit_limit < 0) {
        errors.push('credit_limit must be non-negative');
      }
    }

    if (data.dealership_quota !== undefined && data.dealership_quota !== null) {
      if (data.dealership_quota < 0) {
        errors.push('dealership_quota must be non-negative');
      }
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
   * Create customer with validation
   */
  createCustomer(data) {
    this.validateCustomer(data);
    return this.create(data);
  }

  /**
   * Update customer with validation
   */
  updateCustomer(id, data) {
    this.validateCustomer(data, true);
    return this.update(id, data);
  }

  /**
   * Get customers with enriched data (including contact count and image count)
   */
  getCustomersEnriched(filters = {}, limit = 100, offset = 0) {
    const { whereClause, params } = this.buildCustomerWhereClause(filters);
    
    const sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT cp.id) as contact_count,
        COUNT(DISTINCT ci.id) as image_count
      FROM customers c
      LEFT JOIN contact_persons cp ON c.id = cp.customer_id
      LEFT JOIN customer_images ci ON c.id = ci.customer_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const data = queryBuilder.queryAll(sql, [...params, limit, offset]);

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM customers c ${whereClause}`;
    const countResult = queryBuilder.queryOne(countSql, params);

    return {
      data,
      total: countResult.total,
      limit,
      offset
    };
  }

  /**
   * Build WHERE clause for customer queries with filters
   */
  buildCustomerWhereClause(filters) {
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push('c.status = ?');
      params.push(filters.status);
    }

    if (filters.team) {
      conditions.push('c.team = ?');
      params.push(filters.team);
    }

    if (filters.salesman) {
      conditions.push('c.salesman = ?');
      params.push(filters.salesman);
    }

    if (filters.province) {
      conditions.push('c.province = ?');
      params.push(filters.province);
    }

    if (filters.city) {
      conditions.push('c.city = ?');
      params.push(filters.city);
    }

    if (filters.business_line) {
      conditions.push('c.business_line = ?');
      params.push(filters.business_line);
    }

    if (filters.name_starts_with) {
      conditions.push('c.customer_name LIKE ?');
      params.push(`${filters.name_starts_with}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, params };
  }

  /**
   * Get single customer with full details (contacts and images)
   */
  getCustomerByIdFull(id) {
    const customer = this.getById(id);
    
    if (!customer) {
      const error = new Error(`Customer with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    // Get contact persons
    const contactsSql = 'SELECT * FROM contact_persons WHERE customer_id = ? ORDER BY created_at DESC';
    const contacts = queryBuilder.queryAll(contactsSql, [id]);

    // Get images
    const imagesSql = 'SELECT * FROM customer_images WHERE customer_id = ? ORDER BY created_at DESC';
    const images = queryBuilder.queryAll(imagesSql, [id]);

    return {
      ...customer,
      contacts,
      images
    };
  }

  /**
   * Get customers by salesman
   */
  getCustomersBySalesman(salesman, limit = 100, offset = 0) {
    return this.getCustomersEnriched({ salesman }, limit, offset);
  }

  /**
   * Get customers by team
   */
  getCustomersByTeam(team, limit = 100, offset = 0) {
    return this.getCustomersEnriched({ team }, limit, offset);
  }

  /**
   * Search customers by name
   */
  searchCustomers(searchTerm, limit = 100, offset = 0) {
    const sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT cp.id) as contact_count,
        COUNT(DISTINCT ci.id) as image_count
      FROM customers c
      LEFT JOIN contact_persons cp ON c.id = cp.customer_id
      LEFT JOIN customer_images ci ON c.id = ci.customer_id
      WHERE c.customer_name LIKE ?
         OR c.tin LIKE ?
         OR c.address LIKE ?
      GROUP BY c.id
      ORDER BY c.customer_name
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${searchTerm}%`;
    const data = queryBuilder.queryAll(sql, [searchPattern, searchPattern, searchPattern, limit, offset]);

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total 
      FROM customers 
      WHERE customer_name LIKE ? OR tin LIKE ? OR address LIKE ?
    `;
    const countResult = queryBuilder.queryOne(countSql, [searchPattern, searchPattern, searchPattern]);

    return {
      data,
      total: countResult.total,
      limit,
      offset
    };
  }

  /**
   * Get customer statistics
   */
  getStatistics() {
    const sql = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(credit_limit) as total_credit_limit
      FROM customers
      GROUP BY status
    `;

    const stats = queryBuilder.queryAll(sql);
    
    // Get statistics by team
    const teamSql = `
      SELECT 
        team,
        COUNT(*) as count
      FROM customers
      WHERE team IS NOT NULL
      GROUP BY team
    `;
    const teamStats = queryBuilder.queryAll(teamSql);

    // Get statistics by price group
    const priceGroupSql = `
      SELECT 
        price_group,
        COUNT(*) as count
      FROM customers
      WHERE price_group IS NOT NULL
      GROUP BY price_group
    `;
    const priceGroupStats = queryBuilder.queryAll(priceGroupSql);

    return {
      by_status: stats,
      by_team: teamStats,
      by_price_group: priceGroupStats,
      total: stats.reduce((sum, stat) => sum + stat.count, 0)
    };
  }

  /**
   * Get customers with outstanding inquiries
   */
  getCustomersWithInquiries(status = null) {
    let sql = `
      SELECT DISTINCT
        c.*,
        COUNT(i.id) as inquiry_count
      FROM customers c
      INNER JOIN inquiries i ON c.id = i.customer_id
    `;

    const params = [];
    
    if (status) {
      sql += ' WHERE i.status = ?';
      params.push(status);
    }

    sql += ' GROUP BY c.id ORDER BY inquiry_count DESC';

    return queryBuilder.queryAll(sql, params);
  }

  /**
   * Delete customer (will cascade delete contacts and images)
   */
  deleteCustomer(id) {
    // Check if customer exists first
    const customer = this.getById(id);
    if (!customer) {
      const error = new Error(`Customer with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    // The database will handle cascade deletion of contacts and images
    return this.delete(id);
  }
}

// Export singleton instance
export default new CustomerService();
