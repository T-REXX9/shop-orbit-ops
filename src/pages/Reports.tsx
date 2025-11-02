import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Select, Table } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, ShoppingOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import { getData } from '@/utils/mockData';
import type { Order, Invoice, Customer, Product } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const Reports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    setOrders(getData<Order>('erp_orders'));
    setInvoices(getData<Invoice>('erp_invoices'));
    setCustomers(getData<Customer>('erp_customers'));
    setProducts(getData<Product>('erp_products'));
  }, []);

  const totalRevenue = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const totalCustomers = customers.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const salesByProduct = products.map(product => {
    const orderItems = orders
      .flatMap(o => o.items)
      .filter(item => item.productId === product.id);
    const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const revenue = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    return {
      product: product.name,
      quantity: totalSold,
      revenue: revenue,
      stock: product.stock,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const columns: ColumnsType<typeof salesByProduct[0]> = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Quantity Sold',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Reports & Analytics</Title>
        <Select value={period} onChange={setPeriod} style={{ width: 150 }}>
          <Select.Option value="all">All Time</Select.Option>
          <Select.Option value="month">This Month</Select.Option>
          <Select.Option value="week">This Week</Select.Option>
        </Select>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#22C55E' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#0A66C2' }}
            />
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: 8 }}>
              {completedOrders} completed
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3B82F6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Alerts"
              value={lowStockProducts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: lowStockProducts > 0 ? '#DC2626' : '#22C55E' }}
              suffix={lowStockProducts > 0 ? <ArrowDownOutlined /> : null}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Sales by Product">
        <Table 
          columns={columns} 
          dataSource={salesByProduct} 
          rowKey="product"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Reports;
