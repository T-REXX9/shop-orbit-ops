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
    Modal.confirm({
      title: 'Delete Inquiry',
      content: 'Are you sure you want to delete this inquiry?',
      onOk: () => {
        // TODO: Implement DELETE API call
        message.info('Delete functionality will be implemented with mutations');
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // TODO: Implement POST/PUT API calls
      message.info('Create/Update functionality will be implemented with mutations');
      setIsModalOpen(false);
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
            <Select loading={customersLoading}>
              {customers.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.customer_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="productId" label="Product" rules={[{ required: true }]}>
            <Select loading={productsLoading}>
              {products.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.description}</Select.Option>
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
