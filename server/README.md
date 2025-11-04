# Shop Orbit ERP - Backend Server

Complete backend implementation for Shop Orbit ERP system with SQLite database and RESTful API.

## 🚀 Features

- **Complete CRUD Operations** for Inquiries, Customers, Products, Suppliers, and Prices
- **SQLite Database** with full schema and relationships
- **RESTful API** following REST best practices
- **Multi-tier Pricing** system with 10 price groups
- **Supplier Cost Management** with multiple suppliers per product
- **Image Upload** support for customer documents
- **Data Validation** at both service and route layers
- **Error Handling** with standardized error responses
- **MySQL Migration Ready** with database abstraction layer
- **Modular Architecture** with reusable components

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp ../.env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_PATH=./database.sqlite
   CORS_ORIGIN=http://localhost:5173
   LOG_LEVEL=debug
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

## 🗄️ Database Setup

### Initialize Database

Create the database schema:

```bash
npm run init-db
```

This will create:
- All database tables
- Indexes for performance
- Foreign key constraints

### Seed Sample Data (Optional)

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 3 sample customers
- 3 sample products
- Price lists for all price groups
- Supplier cost data
- Sample inquiries
- Contact persons

## 🏃 Running the Server

### Development Mode

Start the server with auto-reload:

```bash
npm run dev
```

### Production Mode

Start the server:

```bash
npm start
```

The server will be available at: `http://localhost:3001`

## 📡 API Endpoints

### Base URL

```
http://localhost:3001/api/v1
```

### Health Check

```
GET /health
```

### Inquiries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inquiries` | Get all inquiries with filters |
| GET | `/inquiries/:id` | Get single inquiry |
| POST | `/inquiries` | Create new inquiry |
| PUT | `/inquiries/:id` | Update inquiry |
| DELETE | `/inquiries/:id` | Delete inquiry |
| POST | `/inquiries/:id/convert` | Convert to order |
| POST | `/inquiries/:id/reject` | Reject inquiry |
| GET | `/inquiries/stats` | Get statistics |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get all customers with filters |
| GET | `/customers/search?q=term` | Search customers |
| GET | `/customers/:id` | Get single customer with details |
| POST | `/customers` | Create new customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| GET | `/customers/stats` | Get statistics |

### Contact Persons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/:customerId/contacts` | Get contacts for customer |
| POST | `/customers/:customerId/contacts` | Add contact to customer |
| GET | `/contacts/:id` | Get single contact |
| PUT | `/contacts/:id` | Update contact |
| DELETE | `/contacts/:id` | Delete contact |
| GET | `/contacts/search?q=term` | Search contacts |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products with filters |
| GET | `/products/search?q=term` | Search products |
| GET | `/products/:id` | Get single product with details |
| GET | `/products/part/:partNo` | Get product by part number |
| GET | `/products/:id/price/:priceGroup` | Get price for price group |
| POST | `/products` | Create new product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/products/stats` | Get statistics |

### Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/:productId/suppliers` | Get suppliers for product |
| POST | `/products/:productId/suppliers` | Add supplier to product |
| GET | `/suppliers/:id` | Get single supplier |
| PUT | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Delete supplier |
| POST | `/suppliers/:id/set-primary` | Set as primary supplier |
| GET | `/suppliers/stats` | Get statistics |

### Prices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/:productId/prices` | Get all prices for product |
| PUT | `/products/:productId/prices` | Update prices for product |
| GET | `/prices/groups` | Get valid price groups |
| PUT | `/prices/bulk` | Bulk update prices |
| POST | `/prices/adjust` | Adjust prices by percentage |
| POST | `/prices/copy` | Copy prices between groups |
| GET | `/prices/stats` | Get statistics |
| DELETE | `/prices/:id` | Delete price |

### Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/:customerId/images` | Get images for customer |
| POST | `/customers/:customerId/images` | Upload image (multipart/form-data) |
| GET | `/images/:id` | Get single image |
| PUT | `/images/:id` | Update image metadata |
| DELETE | `/images/:id` | Delete image |
| GET | `/images/stats` | Get statistics |

## 📊 Database Schema

### Tables

- **customers** - Customer master data (26 fields)
- **contact_persons** - Customer contacts
- **customer_images** - Customer document uploads
- **products** - Product master data (18 fields)
- **supplier_cog** - Supplier cost of goods
- **product_price_lists** - Multi-tier pricing (10 price groups)
- **inquiries** - Sales inquiries

### Price Groups

- Regular: AAA, AAB, ACC, ADD, BAA, BBB, BCC, BDD
- VIP: VIP1, VIP2

## 🏗️ Architecture

### Layer Structure

```
server/
├── src/
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── database/        # Data access layer
│   ├── middleware/      # Express middleware
│   └── utils/           # Helper utilities
├── uploads/             # File storage
└── database.sqlite      # SQLite database
```

### Reusable Components

- **BaseService** - Inherited by all services for common CRUD
- **QueryBuilder** - Database-agnostic query abstraction
- **Error Handler** - Centralized error management
- **Response Formatter** - Standardized API responses
- **Logger** - Configurable logging utility

## 🔄 MySQL Migration

The backend is designed for easy migration to MySQL. See `server/database/MYSQL_MIGRATION.md` for detailed instructions.

### Key Features for MySQL Compatibility

- Parameterized queries with `?` placeholders
- UUID primary keys (not AUTOINCREMENT)
- Standard SQL syntax
- Database abstraction layer
- Transaction support

## 🧪 Testing

### Manual API Testing

Use tools like Postman, Insomnia, or curl:

```bash
# Health check
curl http://localhost:3001/health

# Get all inquiries
curl http://localhost:3001/api/v1/inquiries

# Create customer
curl -X POST http://localhost:3001/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test Customer","status":"active"}'
```

### Testing Image Uploads

```bash
curl -X POST http://localhost:3001/api/v1/customers/{customerId}/images \
  -F "image=@/path/to/image.jpg" \
  -F "description=Sample image"
```

## 📝 API Request Examples

### Create Inquiry

```json
POST /api/v1/inquiries
{
  "customer_id": "uuid-here",
  "product_id": "uuid-here",
  "quantity": 10,
  "status": "pending",
  "notes": "Urgent order"
}
```

### Update Product Prices

```json
PUT /api/v1/products/{productId}/prices
{
  "regular_aaa": 1000,
  "regular_aab": 950,
  "vip1": 850,
  "vip2": 800
}
```

### Create Customer with Contacts

```json
POST /api/v1/customers
{
  "customer_name": "ABC Corporation",
  "status": "active",
  "price_group": "regular_aaa",
  "credit_limit": 500000
}
```

Then add contacts:

```json
POST /api/v1/customers/{customerId}/contacts
{
  "name": "John Doe",
  "position": "Manager",
  "mobile": "+63 917 123 4567",
  "email": "john@abc.com"
}
```

## 🔒 Security Features

- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- File upload size limits (5MB)
- Image type validation (JPEG, PNG, GIF only)
- CORS configuration
- Error message sanitization in production

## 📦 Dependencies

### Production

- **express** - Web framework
- **better-sqlite3** - SQLite database driver
- **uuid** - Unique ID generation
- **cors** - CORS middleware
- **dotenv** - Environment configuration
- **multer** - File upload handling
- **sharp** - Image processing

### Development

- **nodemon** - Auto-reload during development

## 🐛 Troubleshooting

### Database Lock Error

If you encounter "database is locked":
- Ensure no other process is accessing the database
- Check that only one server instance is running

### Port Already in Use

If port 3001 is in use:
- Change PORT in `.env` file
- Or stop the conflicting process

### CORS Errors

If frontend can't connect:
- Verify CORS_ORIGIN in `.env` matches frontend URL
- Check that server is running

### File Upload Fails

If image upload fails:
- Check MAX_FILE_SIZE in `.env`
- Ensure uploads directory has write permissions
- Verify image format (JPEG, PNG, GIF only)

## 📚 Additional Documentation

- **MySQL Migration Guide**: `server/database/MYSQL_MIGRATION.md`
- **Design Document**: `.qoder/quests/backend-implementation.md`
- **API Schema**: See database/schema.sql

## 🤝 Contributing

When adding new features:

1. Extend BaseService for new entities
2. Use QueryBuilder for database operations
3. Follow existing naming conventions
4. Add validation in service layer
5. Create RESTful routes
6. Update this README

## 📄 License

MIT

## 👥 Support

For issues or questions:
- Check the troubleshooting section
- Review the design document
- Check server logs (console output)

---

**Built with ❤️ for Shop Orbit ERP**
