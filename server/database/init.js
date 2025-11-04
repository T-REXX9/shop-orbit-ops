import { initializeDatabase } from './db.js';

console.log('🔧 Initializing Shop Orbit ERP database...');

(async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
})();
