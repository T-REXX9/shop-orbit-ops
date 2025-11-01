import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getData, addItem, updateItem, deleteItem, Customer } from '@/utils/mockData';

const { Title } = Typography;

const CRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const loadCustomers = () => {
    setCustomers(getData<Customer>('erp_customers'));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

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
        deleteItem('erp_customers', id);
        loadCustomers();
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        updateItem('erp_customers', editingCustomer.id, values);
      } else {
        const newCustomer: Customer = {
          ...values,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        addItem('erp_customers', newCustomer);
      }
      setIsModalOpen(false);
      loadCustomers();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'customer' ? 'green' : 'blue'}>
          {type.toUpperCase()}
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
