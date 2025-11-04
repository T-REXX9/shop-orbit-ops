# MySQL Migration Guide

## Overview

The Shop Orbit backend is designed with database abstraction to facilitate easy migration from SQLite to MySQL. This guide provides step-by-step instructions for the migration process.

## Architecture for Database Portability

### Abstraction Layer

The backend uses a query abstraction layer (`server/database/queryBuilder.js`) that provides database-agnostic methods:

- `queryAll()` - SELECT multiple rows
- `queryOne()` - SELECT single row  
- `insert()` - INSERT records
- `update()` - UPDATE records
- `deleteQuery()` - DELETE records
- `transaction()` - Transaction support
- Generic CRUD helpers

### Portable SQL Features

The codebase uses SQL features compatible with both SQLite and MySQL:

- ✅ Parameterized queries with `?` placeholders
- ✅ Standard SQL syntax (SELECT, INSERT, UPDATE, DELETE)
- ✅ Foreign key constraints
- ✅ Indexes
- ✅ Transactions
- ✅ ISO 8601 timestamp strings
- ✅ LIMIT and OFFSET for pagination

### Avoided SQLite-Specific Features

- ❌ No `AUTOINCREMENT` (uses UUID TEXT primary keys instead)
- ❌ No SQLite pragma statements in business logic
- ❌ No SQLite-specific functions in queries
- ❌ No dynamic typing reliance

## Migration Steps

### Step 1: Install MySQL Dependencies

```bash
npm install mysql2
npm uninstall better-sqlite3
```

### Step 2: Update Environment Configuration

Add MySQL connection settings to `.env`:

```env
# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=shop_orbit_erp

# Keep for backward compatibility during migration
# DATABASE_PATH=./server/database.sqlite
```

### Step 3: Create MySQL Database Connection

Create `server/database/db-mysql.js`:

```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
}

export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export default pool;
```

### Step 4: Convert Schema for MySQL

Update `server/database/schema.sql` for MySQL compatibility:

**Changes needed:**

1. Replace `TEXT PRIMARY KEY` with `VARCHAR(36) PRIMARY KEY`
2. Add `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
3. Change `INTEGER` to `INT`
4. Change check constraints to application-level validation (MySQL < 8.0.16)
5. Add `ON UPDATE CURRENT_TIMESTAMP` for `updated_at` columns (optional)

Example conversion:

```sql
-- SQLite version
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    -- ...
);

-- MySQL version
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    -- ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 5: Update Query Builder for MySQL

Modify `server/database/queryBuilder.js` to detect database type:

```javascript
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

// Use appropriate driver based on DB_TYPE
let db;
if (DB_TYPE === 'mysql') {
  db = await import('./db-mysql.js');
} else {
  db = await import('./db.js');
}
```

### Step 6: Data Migration

Export data from SQLite:

```javascript
// Create migration script: server/database/migrate-to-mysql.js
import sqliteDb from './db.js';
import mysqlDb from './db-mysql.js';

async function migrateData() {
  // Export from SQLite
  const customers = sqliteDb.prepare('SELECT * FROM customers').all();
  const products = sqliteDb.prepare('SELECT * FROM products').all();
  // ... other tables
  
  // Import to MySQL
  for (const customer of customers) {
    await mysqlDb.execute(
      'INSERT INTO customers (...) VALUES (...)',
      [customer.id, customer.customer_name, ...]
    );
  }
  // ... migrate other tables
}
```

### Step 7: Update Services

Services using the query abstraction layer require minimal changes:

- Change synchronous calls to async/await
- Update imports if needed
- Test all CRUD operations

Example:

```javascript
// Before (SQLite - synchronous)
const customers = queryAll('SELECT * FROM customers');

// After (MySQL - asynchronous)  
const customers = await queryAll('SELECT * FROM customers');
```

### Step 8: Testing

1. **Unit Tests**: Run all service layer tests
2. **Integration Tests**: Test all API endpoints
3. **Data Integrity**: Verify foreign key constraints
4. **Performance**: Compare query performance

### Step 9: Update Connection Pooling

MySQL benefits from connection pooling (already configured in Step 3):

- Handles concurrent requests efficiently
- Automatic connection management
- Configurable pool size

## Comparison: SQLite vs MySQL

### SQLite (Current)

**Advantages:**
- ✅ Zero configuration
- ✅ File-based (easy backup)
- ✅ Perfect for development
- ✅ Fast for single-user scenarios

**Limitations:**
- ❌ Limited concurrent write support
- ❌ No client-server architecture
- ❌ Not ideal for distributed systems

### MySQL (Future)

**Advantages:**
- ✅ Excellent concurrent access
- ✅ Client-server architecture
- ✅ Better for production at scale
- ✅ Advanced features (replication, clustering)
- ✅ Better transaction isolation

**Considerations:**
- ⚠️ Requires server setup
- ⚠️ More complex configuration
- ⚠️ Connection management needed

## Rollback Plan

If migration issues occur:

1. Keep SQLite database file as backup
2. Switch `DB_TYPE` back to `sqlite` in `.env`
3. Restore from SQLite backup
4. Investigate and resolve MySQL-specific issues

## Performance Optimization for MySQL

After migration:

1. **Add Indexes**: Verify all indexes from SQLite are created
2. **Query Optimization**: Use EXPLAIN to analyze slow queries
3. **Connection Pool Tuning**: Adjust pool size based on load
4. **Caching**: Consider Redis for frequently accessed data
5. **Read Replicas**: For high-traffic scenarios

## Automated Migration Script

We can create a complete migration script that:

1. Backs up SQLite data
2. Creates MySQL database
3. Runs schema conversion
4. Migrates all data
5. Validates data integrity
6. Switches configuration

## Conclusion

The abstraction layer ensures that:

- Business logic remains unchanged
- SQL queries are database-agnostic
- Migration is a configuration change, not a rewrite
- Both databases can coexist during transition

**Estimated Migration Time**: 2-4 hours for full migration and testing

**Downtime**: Can be done with zero downtime using blue-green deployment
