import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Typography, message, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCustomers } from '@/hooks/useApi';
import type { Customer } from '@/types/api';

const { Title } = Typography;

const CRM: React.FC = () => {
  // Fetch customers using TanStack Query hook
  const { data: customers = [], isLoading, error, refetch } = useCustomers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  // Show error toast if data fetch fails
  React.useEffect(() => {
    if (error) {
      message.error({
        content: `Failed to load customers: ${error.message}`,
        duration: 5,
        onClick: () => message.destroy(),
      });
    }
  }, [error]);

  const handleAdd = () => {
    form.resetFields();
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Customer) => {
    setEditingCustomer(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: 'Are you sure you want to delete this customer?',
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

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer Name',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Salesman',
      dataIndex: 'salesman',
      key: 'salesman',
    },
    {
      title: 'Province',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
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
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading customers..." />
      </div>
    );
  }

  // Render error state with retry button
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          description={
            <span>
              Failed to load customers: {error.message}<br />
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => refetch()}
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
  if (!customers || customers.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>CRM - Customers & Leads</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Customer
          </Button>
        </div>
        <Empty
          description="No customers found. Add your first customer to get started."
          style={{ marginTop: 50 }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add First Customer
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>CRM - Customers & Leads</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Customer
        </Button>
      </div>
      <Table columns={columns} dataSource={customers} rowKey="id" />
      
      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="lead">Lead</Select.Option>
              <Select.Option value="customer">Customer</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CRM;
