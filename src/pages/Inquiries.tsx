<<<<<<< Local
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, Input, Space, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getData, addItem, updateItem, deleteItem, Inquiry, Customer, Product } from '@/utils/mockData';

const { Title } = Typography;
const { TextArea } = Input;

const Inquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [form] = Form.useForm();

  const loadData = () => {
    setInquiries(getData<Inquiry>('erp_inquiries'));
    setCustomers(getData<Customer>('erp_customers'));
    setProducts(getData<Product>('erp_products'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setEditingInquiry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Inquiry) => {
    setEditingInquiry(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Inquiry',
      content: 'Are you sure you want to delete this inquiry?',
      onOk: () => {
        deleteItem('erp_inquiries', id);
        loadData();
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const customer = customers.find(c => c.id === values.customerId);
      const product = products.find(p => p.id === values.productId);
      
      if (editingInquiry) {
        updateItem('erp_inquiries', editingInquiry.id, {
          ...values,
          customerName: customer?.name || '',
          productName: product?.name || '',
        });
      } else {
        const newInquiry: Inquiry = {
          ...values,
          id: Date.now().toString(),
          customerName: customer?.name || '',
          productName: product?.name || '',
          createdAt: new Date().toISOString(),
        };
        addItem('erp_inquiries', newInquiry);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<Inquiry> = [
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap = { pending: 'blue', converted: 'green', rejected: 'red' };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Inquiries</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Inquiry
        </Button>
      </div>
      <Table columns={columns} dataSource={inquiries} rowKey="id" />
      
      <Modal
        title={editingInquiry ? 'Edit Inquiry' : 'Add Inquiry'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="Customer" rules={[{ required: true }]}>
            <Select>
              {customers.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="productId" label="Product" rules={[{ required: true }]}>
            <Select>
              {products.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="converted">Converted</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inquiries;
=======
import React, { useState } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, Input, Space, Tag, Typography, message, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useInquiries, useCustomers, useProducts } from '@/hooks/useApi';
import type { Inquiry } from '@/types/api';

const { Title } = Typography;
const { TextArea } = Input;

const Inquiries: React.FC = () => {
  // Fetch data using TanStack Query hooks
  const { data: inquiries = [], isLoading: inquiriesLoading, error: inquiriesError, refetch: refetchInquiries } = useInquiries();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [form] = Form.useForm();

  // Show error toast if data fetch fails
  React.useEffect(() => {
    if (inquiriesError) {
      message.error({
        content: `Failed to load inquiries: ${inquiriesError.message}`,
        duration: 5,
        onClick: () => message.destroy(),
      });
    }
  }, [inquiriesError]);

  const handleAdd = () => {
    form.resetFields();
    setEditingInquiry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Inquiry) => {
    setEditingInquiry(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({  title: 'Delete Inquiry',
      content: 'Are you sure you want to delete this inquiry?',
      onOk: () => {
        // TODO: Implement DELETE API call
        message.info('Delete functionality will be implemented with mutations');
        // For now, keeping mock behavior commented out:
        // deleteItem('erp_inquiries', id);
        // refetchInquiries();
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // TODO: Implement POST/PUT API calls
      message.info('Create/Update functionality will be implemented with mutations');
      setIsModalOpen(false);
      
      // For now, keeping mock behavior commented out:
      // const customer = customers.find(c => c.id === values.customerId);
      // const product = products.find(p => p.id === values.productId);
      // if (editingInquiry) {
      //   updateItem('erp_inquiries', editingInquiry.id, {...values});
      // } else {
      //   addItem('erp_inquiries', {...values, id: Date.now().toString()});
      // }
      // refetchInquiries();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<Inquiry> = [
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap = { pending: 'blue', converted: 'green', rejected: 'red' };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  // Render loading state
  if (inquiriesLoading || customersLoading || productsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading inquiries..." />
      </div>
    );
  }

  // Render error state with retry button
  if (inquiriesError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          description={
            <span>
              Failed to load inquiries: {inquiriesError.message}<br />
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => refetchInquiries()}
                style={{ marginTop: 16 }}
              >
                Retry
              </Button>
            </span>
          }
        />
      </div>
    );
  }

  // Render empty state
  if (!inquiries || inquiries.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>Inquiries</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Inquiry
          </Button>
        </div>
        <Empty
          description="No inquiries found. Create your first inquiry to get started."
          style={{ marginTop: 50 }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add First Inquiry
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Inquiries</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Inquiry
        </Button>
      </div>
      <Table columns={columns} dataSource={inquiries} rowKey="id" />
      
      <Modal
        title={editingInquiry ? 'Edit Inquiry' : 'Add Inquiry'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="Customer" rules={[{ required: true }]}>
            <Select>
              {customers.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="productId" label="Product" rules={[{ required: true }]}>
            <Select>
              {products.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="converted">Converted</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inquiries;
>>>>>>> Remote
