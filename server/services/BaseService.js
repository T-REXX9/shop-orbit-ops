/**
 * Base Service Class
 * Provides reusable CRUD operations for all services
 * Implements DRY principle and ensures consistent behavior across all entities
 */

import { v4 as uuidv4 } from 'uuid';
import * as queryBuilder from '../database/queryBuilder.js';

export class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Generate UUID for new records
   */
  generateId() {
    return uuidv4();
  }

  /**
   * Get current timestamp in ISO 8601 format
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Add timestamps to data object
   */
  addTimestamps(data, isUpdate = false) {
    const timestamp = this.getTimestamp();
    if (isUpdate) {
      return { ...data, updated_at: timestamp };
    }
    return { ...data, created_at: timestamp, updated_at: timestamp };
  }

  /**
   * Generic create operation
   */
  create(data) {
    const id = this.generateId();
    const recordWithTimestamps = this.addTimestamps({ id, ...data });
    
    queryBuilder.createRecord(this.tableName, recordWithTimestamps);
    return this.getById(id);
  }

  /**
   * Generic get by ID operation
   */
  getById(id) {
    return queryBuilder.getRecordById(this.tableName, id);
  }

  /**
   * Generic get all with pagination and filters
   */
  getAll(filters = {}, limit = 100, offset = 0) {
    const { whereClause, params } = queryBuilder.buildWhereClause(filters);
    const { sql: paginationSql, params: paginationParams } = queryBuilder.buildPagination(limit, offset);
    
    const sql = `SELECT * FROM ${this.tableName} ${whereClause} ${paginationSql}`;
    const data = queryBuilder.queryAll(sql, [...params, ...paginationParams]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const countResult = queryBuilder.queryOne(countSql, params);
    
    return {
      data,
      total: countResult.total,
      limit,
      offset
    };
  }

  /**
   * Generic update operation
   */
  update(id, data) {
    const recordWithTimestamps = this.addTimestamps(data, true);
    const affectedRows = queryBuilder.updateRecord(this.tableName, id, recordWithTimestamps);
    
    if (affectedRows === 0) {
      throw new Error(`${this.tableName} with id ${id} not found`);
    }
    
    return this.getById(id);
  }

  /**
   * Generic delete operation
   */
  delete(id) {
    const affectedRows = queryBuilder.deleteRecord(this.tableName, id);
    
    if (affectedRows === 0) {
      throw new Error(`${this.tableName} with id ${id} not found`);
    }
    
    return true;
  }

  /**
   * Check if record exists
   */
  exists(id) {
    const record = this.getById(id);
    return !!record;
  }

  /**
   * Count records with optional filters
   */
  count(filters = {}) {
    const { whereClause, params } = queryBuilder.buildWhereClause(filters);
    const sql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const result = queryBuilder.queryOne(sql, params);
    return result.total;
  }

  /**
   * Batch create operation
   */
  createMany(dataArray) {
    return queryBuilder.transaction(() => {
      return dataArray.map(data => this.create(data));
    });
  }

  /**
   * Batch update operation
   */
  updateMany(updates) {
    return queryBuilder.transaction(() => {
      return updates.map(({ id, data }) => this.update(id, data));
    });
  }

  /**
   * Batch delete operation
   */
  deleteMany(ids) {
    return queryBuilder.transaction(() => {
      return ids.map(id => this.delete(id));
    });
  }

  /**
   * Execute custom query
   */
  executeQuery(sql, params = []) {
    return queryBuilder.queryAll(sql, params);
  }

  /**
   * Execute custom query for single record
   */
  executeQueryOne(sql, params = []) {
    return queryBuilder.queryOne(sql, params);
  }
}

export default BaseService;
