export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'inactive';
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
  status: 'pending' | 'quoted' | 'converted' | 'rejected';
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate?: string;
  deliveryDate?: string;
  salesPerson?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  customerId?: string;
  customerName: string;
  items?: OrderItem[];
  amount?: number;
  subtotal?: number;
  tax?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate?: string;
  createdAt: string;
  dueDate: string;
  paidDate?: string;
}
