/**
 * Database Seeding Script
 * Populates the database with initial sample data
 */

import { v4 as uuidv4 } from 'uuid';
import db, { getCurrentTimestamp, getDb } from './db.js';
import { logger } from '../utils/logger.js';

// Ensure database is initialized
await getDb();

function seedCustomers() {
  logger.info('Seeding customers...');
  
  const customers = [
    {
      id: uuidv4(),
      customer_name: 'ABC Corporation',
      since: '2023-01-15',
      address: '123 Business Street, Metro Manila',
      delivery_address: '123 Business Street, Metro Manila',
      area: 'Metro Manila',
      tin: '123-456-789-000',
      team: 'Team A',
      salesman: 'John Doe',
      province: 'Metro Manila',
      city: 'Makati',
      refer_by: 'Direct',
      price_group: 'regular_aaa',
      business_line: 'Retail',
      terms: 'Net 30',
      transaction_type: 'Credit',
      vat_type: 'VAT Inclusive',
      vat_percentage: 12,
      dealership_terms: 'Standard',
      dealership_since: '2023-01-15',
      dealership_quota: 100000,
      credit_limit: 500000,
      status: 'active',
      comment: 'Premium customer',
      debt_type: 'None',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      customer_name: 'XYZ Trading Inc.',
      since: '2023-03-20',
      address: '456 Commerce Ave, Quezon City',
      delivery_address: '456 Commerce Ave, Quezon City',
      area: 'Metro Manila',
      tin: '987-654-321-000',
      team: 'Team B',
      salesman: 'Jane Smith',
      province: 'Metro Manila',
      city: 'Quezon City',
      refer_by: 'Referral',
      price_group: 'vip1',
      business_line: 'Wholesale',
      terms: 'Net 60',
      transaction_type: 'Credit',
      vat_type: 'VAT Inclusive',
      vat_percentage: 12,
      dealership_terms: 'Premium',
      dealership_since: '2023-03-20',
      dealership_quota: 200000,
      credit_limit: 1000000,
      status: 'active',
      comment: 'VIP customer with high volume',
      debt_type: 'None',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      customer_name: 'Small Shop Co.',
      since: '2024-01-10',
      address: '789 Market Road, Pasig',
      delivery_address: '789 Market Road, Pasig',
      area: 'Metro Manila',
      tin: '111-222-333-000',
      team: 'Team A',
      salesman: 'John Doe',
      province: 'Metro Manila',
      city: 'Pasig',
      refer_by: 'Walk-in',
      price_group: 'regular_baa',
      business_line: 'Retail',
      terms: 'Cash',
      transaction_type: 'Cash',
      vat_type: 'VAT Exclusive',
      vat_percentage: 12,
      dealership_terms: null,
      dealership_since: null,
      dealership_quota: null,
      credit_limit: 50000,
      status: 'active',
      comment: 'New customer',
      debt_type: 'None',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO customers (
      id, customer_name, since, address, delivery_address, area, tin, team, salesman,
      province, city, refer_by, price_group, business_line, terms, transaction_type,
      vat_type, vat_percentage, dealership_terms, dealership_since, dealership_quota,
      credit_limit, status, comment, debt_type, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  customers.forEach(customer => {
    stmt.run(
      customer.id, customer.customer_name, customer.since, customer.address,
      customer.delivery_address, customer.area, customer.tin, customer.team,
      customer.salesman, customer.province, customer.city, customer.refer_by,
      customer.price_group, customer.business_line, customer.terms, customer.transaction_type,
      customer.vat_type, customer.vat_percentage, customer.dealership_terms,
      customer.dealership_since, customer.dealership_quota, customer.credit_limit,
      customer.status, customer.comment, customer.debt_type, customer.created_at,
      customer.updated_at
    );
  });

  logger.info(`Seeded ${customers.length} customers`);
  return customers;
}

function seedProducts() {
  logger.info('Seeding products...');
  
  const products = [
    {
      id: uuidv4(),
      part_no: 'BRK-001',
      item_code: 'BRAKE-PAD-001',
      category: 'Brake Parts',
      original_pn_no: 'OEM-BRK-001',
      oem_no: 'TOYOTA-BRK-001',
      description: 'Front Brake Pad Set',
      descriptive_inquiry: 'High-quality ceramic brake pads for Toyota vehicles',
      application: 'Toyota Corolla 2015-2020',
      brand: 'Premium Auto Parts',
      size: 'Standard',
      no_of_holes: null,
      no_of_cylinder: null,
      barcode: '1234567890123',
      reorder_quantity: 10,
      replenish_quantity: 50,
      no_of_pieces_per_box: 4,
      status: 'active',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      part_no: 'FLT-002',
      item_code: 'OIL-FILTER-002',
      category: 'Filters',
      original_pn_no: 'OEM-FLT-002',
      oem_no: 'HONDA-FLT-002',
      description: 'Engine Oil Filter',
      descriptive_inquiry: 'Premium oil filter for Honda engines',
      application: 'Honda Civic 2016-2022',
      brand: 'FilterPro',
      size: 'M20x1.5',
      no_of_holes: null,
      no_of_cylinder: null,
      barcode: '2345678901234',
      reorder_quantity: 20,
      replenish_quantity: 100,
      no_of_pieces_per_box: 12,
      status: 'active',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      part_no: 'SPK-003',
      item_code: 'SPARK-PLUG-003',
      category: 'Ignition',
      original_pn_no: 'OEM-SPK-003',
      oem_no: 'NISSAN-SPK-003',
      description: 'Spark Plug Set',
      descriptive_inquiry: 'Iridium spark plugs for improved performance',
      application: 'Nissan Sentra 2017-2023',
      brand: 'SparkMaster',
      size: '14mm',
      no_of_holes: null,
      no_of_cylinder: 4,
      barcode: '3456789012345',
      reorder_quantity: 15,
      replenish_quantity: 75,
      no_of_pieces_per_box: 4,
      status: 'active',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO products (
      id, part_no, item_code, category, original_pn_no, oem_no, description,
      descriptive_inquiry, application, brand, size, no_of_holes, no_of_cylinder,
      barcode, reorder_quantity, replenish_quantity, no_of_pieces_per_box, status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  products.forEach(product => {
    stmt.run(
      product.id, product.part_no, product.item_code, product.category,
      product.original_pn_no, product.oem_no, product.description,
      product.descriptive_inquiry, product.application, product.brand,
      product.size, product.no_of_holes, product.no_of_cylinder, product.barcode,
      product.reorder_quantity, product.replenish_quantity, product.no_of_pieces_per_box,
      product.status, product.created_at, product.updated_at
    );
  });

  logger.info(`Seeded ${products.length} products`);
  return products;
}

function seedPrices(products) {
  logger.info('Seeding product prices...');
  
  const priceGroups = [
    'regular_aaa', 'regular_aab', 'regular_acc', 'regular_add',
    'regular_baa', 'regular_bbb', 'regular_bcc', 'regular_bdd',
    'vip1', 'vip2'
  ];

  const stmt = db.prepare(`
    INSERT INTO product_price_lists (id, product_id, price_group, price, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  products.forEach((product, idx) => {
    const basePrice = (idx + 1) * 500; // Different base prices for each product
    
    priceGroups.forEach((group, groupIdx) => {
      // VIP groups get better prices
      const discount = group.startsWith('vip') ? 0.85 : (1 - (groupIdx * 0.02));
      const price = basePrice * discount;
      
      stmt.run(
        uuidv4(),
        product.id,
        group,
        price,
        getCurrentTimestamp(),
        getCurrentTimestamp()
      );
      count++;
    });
  });

  logger.info(`Seeded ${count} price entries`);
}

function seedSuppliers(products) {
  logger.info('Seeding suppliers...');
  
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C'];
  
  const stmt = db.prepare(`
    INSERT INTO supplier_cog (id, product_id, supplier_name, cost, is_primary, apply_to_all_part_no, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  products.forEach((product, idx) => {
    const baseCost = (idx + 1) * 300; // Base cost for each product
    
    suppliers.forEach((supplier, supplierIdx) => {
      const cost = baseCost * (1 + (supplierIdx * 0.1)); // Different costs per supplier
      const isPrimary = supplierIdx === 0 ? 1 : 0; // First supplier is primary
      
      stmt.run(
        uuidv4(),
        product.id,
        supplier,
        cost,
        isPrimary,
        0,
        getCurrentTimestamp(),
        getCurrentTimestamp()
      );
      count++;
    });
  });

  logger.info(`Seeded ${count} supplier entries`);
}

function seedInquiries(customers, products) {
  logger.info('Seeding inquiries...');
  
  const inquiries = [
    {
      id: uuidv4(),
      customer_id: customers[0].id,
      product_id: products[0].id,
      quantity: 10,
      status: 'pending',
      notes: 'Urgent order needed for upcoming project',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      customer_id: customers[1].id,
      product_id: products[1].id,
      quantity: 50,
      status: 'converted',
      notes: 'Regular monthly order',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      customer_id: customers[2].id,
      product_id: products[2].id,
      quantity: 5,
      status: 'pending',
      notes: 'First time buyer inquiry',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO inquiries (id, customer_id, product_id, quantity, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  inquiries.forEach(inquiry => {
    stmt.run(
      inquiry.id, inquiry.customer_id, inquiry.product_id, inquiry.quantity,
      inquiry.status, inquiry.notes, inquiry.created_at, inquiry.updated_at
    );
  });

  logger.info(`Seeded ${inquiries.length} inquiries`);
}

function seedContactPersons(customers) {
  logger.info('Seeding contact persons...');
  
  const contacts = [
    {
      id: uuidv4(),
      customer_id: customers[0].id,
      name: 'Maria Santos',
      position: 'Purchasing Manager',
      birthday: '1985-06-15',
      telephone: '(02) 8123-4567',
      mobile: '+63 917 123 4567',
      email: 'maria.santos@abccorp.com',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      customer_id: customers[1].id,
      name: 'Roberto Cruz',
      position: 'Operations Director',
      birthday: '1978-03-22',
      telephone: '(02) 8234-5678',
      mobile: '+63 918 234 5678',
      email: 'roberto.cruz@xyztrading.com',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    },
    {
      id: uuidv4(),
      customer_id: customers[2].id,
      name: 'Anna Reyes',
      position: 'Owner',
      birthday: '1990-11-08',
      telephone: null,
      mobile: '+63 919 345 6789',
      email: 'anna@smallshop.com',
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO contact_persons (id, customer_id, name, position, birthday, telephone, mobile, email, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  contacts.forEach(contact => {
    stmt.run(
      contact.id, contact.customer_id, contact.name, contact.position,
      contact.birthday, contact.telephone, contact.mobile, contact.email,
      contact.created_at, contact.updated_at
    );
  });

  logger.info(`Seeded ${contacts.length} contact persons`);
}

// Main seeding function
function seedDatabase() {
  try {
    logger.info('🌱 Starting database seeding...');
    
    // Check if database is already seeded
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    if (customerCount.count > 0) {
      logger.warn('Database already contains data. Skipping seed.');
      logger.info('To re-seed, delete the database file and run this script again.');
      return;
    }

    // Seed in order (respecting foreign key relationships)
    const customers = seedCustomers();
    const products = seedProducts();
    seedPrices(products);
    seedSuppliers(products);
    seedInquiries(customers, products);
    seedContactPersons(customers);
    
    logger.info('✅ Database seeding completed successfully!');
    logger.info('Sample data has been added to the database.');
    
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if executed directly
seedDatabase();
