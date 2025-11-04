-- Shop Orbit ERP Database Schema
-- SQLite Database Schema for Customers, Products, Inquiries, and related tables

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    since TEXT,
    address TEXT,
    delivery_address TEXT,
    area TEXT,
    tin TEXT,
    team TEXT,
    salesman TEXT,
    province TEXT,
    city TEXT,
    refer_by TEXT,
    price_group TEXT,
    business_line TEXT,
    terms TEXT,
    transaction_type TEXT,
    vat_type TEXT,
    vat_percentage REAL CHECK (vat_percentage IS NULL OR (vat_percentage >= 0 AND vat_percentage <= 100)),
    dealership_terms TEXT,
    dealership_since TEXT,
    dealership_quota REAL CHECK (dealership_quota IS NULL OR dealership_quota >= 0),
    credit_limit REAL CHECK (credit_limit IS NULL OR credit_limit >= 0),
    status TEXT NOT NULL,
    comment TEXT,
    debt_type TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ============================================================================
-- CONTACT PERSONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_persons (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT,
    birthday TEXT,
    telephone TEXT,
    mobile TEXT,
    email TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================================================
-- CUSTOMER IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_images (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_name TEXT,
    image_type TEXT,
    image_size INTEGER,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    part_no TEXT NOT NULL UNIQUE,
    item_code TEXT,
    category TEXT NOT NULL,
    original_pn_no TEXT,
    oem_no TEXT,
    description TEXT,
    descriptive_inquiry TEXT,
    application TEXT,
    brand TEXT,
    size TEXT,
    no_of_holes INTEGER CHECK (no_of_holes IS NULL OR no_of_holes >= 0),
    no_of_cylinder INTEGER CHECK (no_of_cylinder IS NULL OR no_of_cylinder >= 0),
    barcode TEXT UNIQUE,
    reorder_quantity INTEGER CHECK (reorder_quantity IS NULL OR reorder_quantity >= 0),
    replenish_quantity INTEGER CHECK (replenish_quantity IS NULL OR replenish_quantity >= 0),
    no_of_pieces_per_box INTEGER CHECK (no_of_pieces_per_box IS NULL OR no_of_pieces_per_box >= 0),
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- ============================================================================
-- SUPPLIER COG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_cog (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    cost REAL NOT NULL CHECK (cost >= 0),
    is_primary INTEGER NOT NULL DEFAULT 0,
    apply_to_all_part_no INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================================
-- PRODUCT PRICE LISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_price_lists (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    price_group TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(product_id, price_group)
);

-- ============================================================================
-- INQUIRIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'converted', 'rejected')),
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Inquiry indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_product_id ON inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);

-- Contact person indexes
CREATE INDEX IF NOT EXISTS idx_contact_persons_customer_id ON contact_persons(customer_id);

-- Customer image indexes
CREATE INDEX IF NOT EXISTS idx_customer_images_customer_id ON customer_images(customer_id);

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_salesman ON customers(salesman);
CREATE INDEX IF NOT EXISTS idx_customers_team ON customers(team);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_price_group ON customers(price_group);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_part_no ON products(part_no);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Supplier COG indexes
CREATE INDEX IF NOT EXISTS idx_supplier_cog_product_id ON supplier_cog(product_id);

-- Product price lists indexes
CREATE INDEX IF NOT EXISTS idx_product_price_lists_product_id ON product_price_lists(product_id);
CREATE INDEX IF NOT EXISTS idx_product_price_lists_price_group ON product_price_lists(price_group);
