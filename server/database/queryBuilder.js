/**
 * Database Query Abstraction Layer
 * This module provides database-agnostic query methods to facilitate
 * future migration from SQLite to MySQL or other databases.
 * 
 * Key principles for MySQL compatibility:
 * 1. Use parameterized queries (? placeholders work in both SQLite and MySQL)
 * 2. Avoid SQLite-specific syntax
 * 3. Use standard SQL features
 * 4. Abstract CRUD operations
 */

import db, { getCurrentTimestamp, getDb } from './db.js';

// Ensure database is initialized
let dbReady = false;

async function ensureDb() {
  if (!dbReady) {
    await getDb();
    dbReady = true;
  }
}

/**
 * Execute a SELECT query and return all rows
 * Compatible with both SQLite and MySQL
 */
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/**
 * Execute a SELECT query and return single row
 * Compatible with both SQLite and MySQL
 */
export function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

/**
 * Execute an INSERT query and return the inserted ID
 * Note: MySQL returns insertId, SQLite returns lastInsertRowid
 */
export function insert(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return result.lastInsertRowid || result.insertId;
}

/**
 * Execute an UPDATE query and return number of affected rows
 * Compatible with both SQLite and MySQL
 */
export function update(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return result.changes;
}

/**
 * Execute a DELETE query and return number of affected rows
 * Compatible with both SQLite and MySQL
 */
export function deleteQuery(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return result.changes;
}

/**
 * Execute multiple queries in a transaction
 * Both SQLite and MySQL support transactions
 */
export function transaction(callback) {
  const trans = db.transaction(callback);
  return trans();
}

/**
 * Helper function to build WHERE clause from filters
 * Generates SQL WHERE conditions and parameters array
 */
export function buildWhereClause(filters) {
  const conditions = [];
  const params = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && value.operator) {
        // Support for operators like LIKE, >, <, etc.
        conditions.push(`${key} ${value.operator} ?`);
        params.push(value.value);
      } else {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

/**
 * Helper to generate pagination SQL
 * Both SQLite and MySQL use LIMIT and OFFSET
 */
export function buildPagination(limit = 100, offset = 0) {
  return {
    sql: `LIMIT ? OFFSET ?`,
    params: [limit, offset]
  };
}

/**
 * Generic CRUD operations that work with both SQLite and MySQL
 */

// CREATE operation
export function createRecord(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  return insert(sql, values);
}

// READ operation
export function getRecordById(table, id) {
  const sql = `SELECT * FROM ${table} WHERE id = ?`;
  return queryOne(sql, [id]);
}

// UPDATE operation
export function updateRecord(table, id, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
  return update(sql, [...values, id]);
}

// DELETE operation
export function deleteRecord(table, id) {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  return deleteQuery(sql, [id]);
}

/**
 * Date/Time helpers
 * Both SQLite and MySQL can store ISO 8601 timestamps as TEXT/VARCHAR
 */
export function getTimestamp() {
  return getCurrentTimestamp();
}

/**
 * Execute raw SQL (use sparingly, prefer abstracted methods)
 */
export function executeRaw(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export default {
  queryAll,
  queryOne,
  insert,
  update,
  deleteQuery,
  transaction,
  buildWhereClause,
  buildPagination,
  createRecord,
  getRecordById,
  updateRecord,
  deleteRecord,
  getTimestamp,
  executeRaw
};
