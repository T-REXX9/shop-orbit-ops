// Mock data utilities for localStorage-based data persistence

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  type: 'lead' | 'customer';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  supplier?: string;
}

export interface Inquiry {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'converted' | 'rejected';
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  salesPerson: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  createdAt: string;
  dueDate: string;
}

// Initialize mock data if not exists
export const initializeMockData = () => {
  if (!localStorage.getItem('erp_customers')) {
    const mockCustomers: Customer[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', company: 'Acme Corp', type: 'customer', createdAt: new Date().toISOString() },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321', type: 'lead', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('erp_customers', JSON.stringify(mockCustomers));
  }

  if (!localStorage.getItem('erp_products')) {
    const mockProducts: Product[] = [
      { id: '1', name: 'Product A', sku: 'SKU001', price: 100, stock: 50, category: 'Electronics' },
      { id: '2', name: 'Product B', sku: 'SKU002', price: 200, stock: 30, category: 'Electronics' },
      { id: '3', name: 'Product C', sku: 'SKU003', price: 150, stock: 10, category: 'Accessories' },
    ];
    localStorage.setItem('erp_products', JSON.stringify(mockProducts));
  }

  if (!localStorage.getItem('erp_inquiries')) {
    localStorage.setItem('erp_inquiries', JSON.stringify([]));
  }

  if (!localStorage.getItem('erp_orders')) {
    localStorage.setItem('erp_orders', JSON.stringify([]));
  }

  if (!localStorage.getItem('erp_invoices')) {
    localStorage.setItem('erp_invoices', JSON.stringify([]));
  }
};

// Generic CRUD operations
export const getData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const addItem = <T extends { id: string }>(key: string, item: T): void => {
  const items = getData<T>(key);
  items.push(item);
  setData(key, items);
};

export const updateItem = <T extends { id: string }>(key: string, id: string, updates: Partial<T>): void => {
  const items = getData<T>(key);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    setData(key, items);
  }
};

export const deleteItem = (key: string, id: string): void => {
  const items = getData(key);
  const filtered = items.filter((item: any) => item.id !== id);
  setData(key, filtered);
};
