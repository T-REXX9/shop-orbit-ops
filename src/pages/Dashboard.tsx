import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table } from 'antd';
import { 
  ShoppingCartOutlined, 
  InboxOutlined, 
  FileTextOutlined,
  WarningOutlined 
} from '@ant-design/icons';
import { getData } from '@/utils/mockData';
import type { Order, Inquiry, Product } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingInquiries: 0,
    totalRevenue: 0,
    lowStockItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const orders = getData<Order>('erp_orders');
    const inquiries = getData<Inquiry>('erp_inquiries');
    const products = getData<Product>('erp_products');

    const revenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const lowStock = products.filter(p => p.stock < 20).length;
    const pending = inquiries.filter(i => i.status === 'pending').length;

    setStats({
      totalOrders: orders.length,
      pendingInquiries: pending,
      totalRevenue: revenue,
      lowStockItems: lowStock,
    });

    setRecentOrders(orders.slice(-5).reverse());
  }, []);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: '4px',
          background: status === 'delivered' ? '#22C55E20' : '#F59E0B20',
          color: status === 'delivered' ? '#22C55E' : '#F59E0B',
        }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#0A66C2' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Inquiries"
              value={stats.pendingInquiries}
              prefix={<InboxOutlined style={{ color: '#F59E0B' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Low Stock Alerts"
              value={stats.lowStockItems}
              prefix={<WarningOutlined style={{ color: '#DC2626' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Orders">
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
