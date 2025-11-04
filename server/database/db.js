import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'database.sqlite');
let db = null;
let SQL = null;

// Initialize SQL.js
async function initDatabase() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  
  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  return db;
}

// Save database to file
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

// Initialize database with schema
export async function initializeDatabase() {
  try {
    await initDatabase();
    
    const schemaPath = join(__dirname, 'schema.sql');
    const authSchemaPath = join(__dirname, 'auth-schema.sql');
    
    const schema = readFileSync(schemaPath, 'utf8');
    const authSchema = readFileSync(authSchemaPath, 'utf8');
    
    // Execute main schema
    db.exec(schema);
    
    // Execute auth schema
    db.exec(authSchema);
    
    saveDatabase();
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Helper function to get current timestamp in ISO 8601 format
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Get database instance (initialize if needed)
export async function getDb() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

// Export a synchronous wrapper for compatibility
const dbWrapper = {
  prepare: (sql) => {
    if (!db) {
      throw new Error('Database not initialized. Call getDb() first.');
    }
    
    return {
      run: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        const changes = db.getRowsModified();
        stmt.free();
        saveDatabase();
        return { changes, lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] };
      },
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
      },
      all: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  },
  exec: (sql) => {
    if (!db) {
      throw new Error('Database not initialized. Call getDb() first.');
    }
    db.exec(sql);
    saveDatabase();
  },
  pragma: (pragma) => {
    if (!db) {
      throw new Error('Database not initialized. Call getDb() first.');
    }
    db.run(pragma);
  },
  transaction: (fn) => {
    if (!db) {
      throw new Error('Database not initialized. Call getDb() first.');
    }
    db.run('BEGIN TRANSACTION');
    try {
      const result = fn();
      db.run('COMMIT');
      saveDatabase();
      return result;
    } catch (error) {
      db.run('ROLLBACK');
      throw error;
    }
  }
};

export default dbWrapper;
