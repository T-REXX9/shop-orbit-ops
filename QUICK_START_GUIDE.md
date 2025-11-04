# Quick Start Guide - Sales Inquiry Management

## 🚀 Getting Started

### Servers Running
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001

### Sample Data Available
The system has been seeded with:
- 3 Customers (ABC Corporation, XYZ Trading Inc., Small Shop Co.)
- 3 Products (Brake Pads, Oil Filter, Spark Plugs)
- 3 Sample Inquiries

## 📖 User Guide

### Viewing Inquiries

1. **Access the Inquiries Page**
   - Navigate to the Inquiries section
   - You'll see a table with all inquiries

2. **Understanding the Table Columns**
   - **Customer**: Customer name
   - **Product**: Product part number
   - **Quantity**: Requested quantity
   - **Status**: Current status (Pending, Converted, Rejected)
   - **Notes**: Additional information
   - **Created**: When the inquiry was created
   - **Actions**: Buttons for View, Edit, Convert, Reject, Delete

### Filtering Inquiries

1. **Filter by Status**
   - Click the Status dropdown in the filter panel
   - Select: Pending, Converted, or Rejected
   - The table updates automatically

2. **Filter by Customer**
   - Click the Customer dropdown
   - Type to search or select from list
   - The table updates automatically

3. **Clear Filters**
   - Click "Clear Filters" button to reset all filters

### Creating a New Inquiry

1. Click the **"Add Inquiry"** button (top right)
2. Fill in the form:
   - **Customer** (required): Select from dropdown
   - **Product** (required): Select from dropdown  
   - **Quantity** (required): Enter a number (minimum 1)
   - **Status** (required): Select status
   - **Notes** (optional): Add any additional information (max 1000 characters)
3. Click **"OK"** to save
4. Success message will appear
5. The inquiry list will refresh automatically

### Editing an Inquiry

1. Click the **Edit** button (pencil icon) on any inquiry row
2. The form opens with existing data pre-filled
3. Modify any fields
4. Click **"OK"** to save changes
5. Success message will appear
6. The inquiry list will refresh automatically

### Viewing Inquiry Details

1. Click the **View** button (eye icon) on any inquiry row
2. A modal opens showing all inquiry information:
   - Inquiry ID
   - Customer details
   - Product details
   - Quantity, Status, Notes
   - Created and Updated timestamps
3. Click **"Close"** when done

### Converting an Inquiry to Order

1. Click the **Convert** button (green checkmark) on a pending inquiry
2. A confirmation dialog appears
3. Click **"Convert"** to confirm
4. The inquiry status changes to "Converted"
5. Success message will appear
6. The Convert button becomes disabled for that inquiry

**Note**: Already converted inquiries show a disabled Convert button

### Rejecting an Inquiry

1. Click the **Reject** button (red X) on a pending inquiry
2. A modal opens asking for rejection reason
3. Optionally add rejection notes (max 1000 characters)
4. Click **"Reject"** to confirm
5. The inquiry status changes to "Rejected"
6. Success message will appear
7. The Reject button becomes disabled for that inquiry

**Note**: Already rejected inquiries show a disabled Reject button

### Deleting an Inquiry

1. Click the **Delete** button (trash icon) on any inquiry row
2. A confirmation dialog appears showing the customer name
3. Click **"Delete"** to confirm (this action cannot be undone)
4. The inquiry is permanently removed
5. Success message will appear
6. The inquiry list will refresh automatically

## 🎯 Tips & Best Practices

### Sorting
- Click any column header to sort by that column
- Click again to reverse the sort order
- Available for: Customer, Product, Quantity, Status, Created

### Pagination
- Use the pagination controls at the bottom of the table
- Change page size using the dropdown (10, 20, 50, 100 items per page)
- Navigate between pages using the arrow buttons

### Search in Dropdowns
- Customer and Product dropdowns are searchable
- Start typing to filter the options
- Great for large lists of customers or products

### Status Colors
- 🔵 **Blue** = Pending (awaiting action)
- 🟢 **Green** = Converted (turned into order)
- 🔴 **Red** = Rejected (declined)

### Keyboard Shortcuts
- **ESC** key closes any open modal
- **Enter** key submits forms (when focused on a form field)

## ⚠️ Common Scenarios

### Creating Your First Inquiry
If you see the empty state:
1. Click "Add First Inquiry" or "Add Inquiry"
2. Fill in all required fields
3. Start with a simple inquiry to test the system

### No Customers or Products Available
If dropdowns are empty:
1. Check that the database has been seeded
2. Run: `cd server && npm run seed`
3. Verify backend is running on port 3001

### Inquiry List Not Updating
If changes don't appear:
1. Check for error messages in the browser console
2. Verify backend server is running
3. Try clicking the refresh button or reloading the page

### Form Validation Errors
Red error messages appear when:
- Required fields are empty
- Quantity is less than 1
- Notes exceed 1000 characters

Fix the errors and try submitting again.

## 🔧 Troubleshooting

### Frontend Not Loading
```bash
# Navigate to project root
cd C:\Users\melso\.qoder\worktree\shop-orbit-ops\qoder\sales-inquiry-management-1762279475

# Ensure dependencies are installed
npm install

# Start frontend
npm run dev
```

### Backend Not Running
```bash
# Navigate to server directory
cd C:\Users\melso\.qoder\worktree\shop-orbit-ops\qoder\sales-inquiry-management-1762279475\server

# Ensure dependencies are installed
npm install

# Start backend
npm run dev
```

### Database Not Initialized
```bash
cd server

# Initialize database
npm run init-db

# Seed with sample data
npm run seed
```

## 📞 API Reference

For developers who want to integrate with the API:

### Base URL
`http://localhost:3001/api/v1`

### Endpoints
- `GET /inquiries` - List all inquiries (with optional filters)
- `GET /inquiries/:id` - Get single inquiry
- `POST /inquiries` - Create new inquiry
- `PUT /inquiries/:id` - Update inquiry
- `DELETE /inquiries/:id` - Delete inquiry
- `POST /inquiries/:id/convert` - Convert to order
- `POST /inquiries/:id/reject` - Reject inquiry

### Example Request Bodies

**Create Inquiry**:
```json
{
  "customer_id": "uuid-here",
  "product_id": "uuid-here",
  "quantity": 100,
  "status": "pending",
  "notes": "Customer needs quick delivery"
}
```

**Reject Inquiry**:
```json
{
  "notes": "Out of stock"
}
```

## ✅ Feature Checklist

Use this to verify all features are working:

- [ ] View all inquiries in table
- [ ] Filter by status
- [ ] Filter by customer
- [ ] Clear filters
- [ ] Sort by any column
- [ ] Navigate pages
- [ ] Create new inquiry
- [ ] Edit existing inquiry
- [ ] View inquiry details
- [ ] Convert inquiry to order
- [ ] Reject inquiry
- [ ] Delete inquiry
- [ ] See success messages
- [ ] See error messages (try invalid data)
- [ ] Use searchable dropdowns

## 🎓 Next Steps

Now that you're familiar with basic operations, you can:

1. **Customize** the inquiry statuses or fields
2. **Integrate** with order management system
3. **Add** email notifications for status changes
4. **Export** inquiry data to Excel/CSV
5. **Generate** reports on inquiry conversion rates
6. **Implement** bulk operations

Happy inquiry management! 🎉
