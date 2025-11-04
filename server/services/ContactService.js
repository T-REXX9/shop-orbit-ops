/**
 * Contact Person Service
 * Handles all business logic for customer contact persons
 * Extends BaseService for reusable CRUD operations
 */

import BaseService from './BaseService.js';
import * as queryBuilder from '../database/queryBuilder.js';

class ContactService extends BaseService {
  constructor() {
    super('contact_persons');
  }

  /**
   * Validate contact person data
   */
  validateContact(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate && !data.customer_id) {
      errors.push('customer_id is required');
    }

    if (!isUpdate && !data.name) {
      errors.push('name is required');
    }

    if (data.name && data.name.trim() === '') {
      errors.push('name must not be empty');
    }

    // Validate email format if provided
    if (data.email && data.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('email must be a valid email address');
      }
    }

    // Check that at least one contact method is provided (recommended)
    if (!isUpdate) {
      const hasContactMethod = data.telephone || data.mobile || data.email;
      if (!hasContactMethod) {
        errors.push('At least one contact method (telephone, mobile, or email) is recommended');
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
   * Create contact person with validation
   */
  createContact(data) {
    this.validateContact(data);
    this.verifyCustomerExists(data.customer_id);
    return this.create(data);
  }

  /**
   * Update contact person with validation
   */
  updateContact(id, data) {
    if (data.customer_id) {
      this.verifyCustomerExists(data.customer_id);
    }
    
    this.validateContact(data, true);
    return this.update(id, data);
  }

  /**
   * Get all contacts for a specific customer
   */
  getContactsByCustomer(customerId) {
    const sql = 'SELECT * FROM contact_persons WHERE customer_id = ? ORDER BY created_at DESC';
    return queryBuilder.queryAll(sql, [customerId]);
  }

  /**
   * Get contact with customer information
   */
  getContactWithCustomer(id) {
    const sql = `
      SELECT 
        cp.*,
        c.customer_name,
        c.company
      FROM contact_persons cp
      LEFT JOIN customers c ON cp.customer_id = c.id
      WHERE cp.id = ?
    `;

    const contact = queryBuilder.queryOne(sql, [id]);
    
    if (!contact) {
      const error = new Error(`Contact with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return contact;
  }

  /**
   * Search contacts by name, email, or phone
   */
  searchContacts(searchTerm, customerId = null) {
    let sql = `
      SELECT 
        cp.*,
        c.customer_name
      FROM contact_persons cp
      LEFT JOIN customers c ON cp.customer_id = c.id
      WHERE (cp.name LIKE ? OR cp.email LIKE ? OR cp.mobile LIKE ? OR cp.telephone LIKE ?)
    `;

    const params = Array(4).fill(`%${searchTerm}%`);

    if (customerId) {
      sql += ' AND cp.customer_id = ?';
      params.push(customerId);
    }

    sql += ' ORDER BY cp.name';

    return queryBuilder.queryAll(sql, params);
  }

  /**
   * Get primary contact for a customer (first contact created)
   */
  getPrimaryContact(customerId) {
    const sql = `
      SELECT * FROM contact_persons 
      WHERE customer_id = ? 
      ORDER BY created_at ASC 
      LIMIT 1
    `;
    return queryBuilder.queryOne(sql, [customerId]);
  }

  /**
   * Count contacts for a customer
   */
  countByCustomer(customerId) {
    const sql = 'SELECT COUNT(*) as total FROM contact_persons WHERE customer_id = ?';
    const result = queryBuilder.queryOne(sql, [customerId]);
    return result.total;
  }

  /**
   * Delete contact person
   */
  deleteContact(id) {
    const contact = this.getById(id);
    if (!contact) {
      const error = new Error(`Contact with id ${id} not found`);
      error.statusCode = 404;
      throw error;
    }

    return this.delete(id);
  }

  /**
   * Bulk create contacts for a customer
   */
  createBulkContacts(customerId, contactsArray) {
    this.verifyCustomerExists(customerId);

    return queryBuilder.transaction(() => {
      return contactsArray.map(contactData => {
        return this.createContact({
          ...contactData,
          customer_id: customerId
        });
      });
    });
  }
}

// Export singleton instance
export default new ContactService();
