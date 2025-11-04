import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Tag, Typography, message, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useProducts } from '@/hooks/useApi';
import type { Product } from '@/types/api';

const { Title } = Typography;

const Inventory: React.FC = () => {
  // Fetch products using TanStack Query hook
  const { data: products = [], isLoading, error, refetch } = useProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Show error toast if data fetch fails
  React.useEffect(() => {
    if (error) {
      message.error({
        content: `Failed to load products: ${error.message}`,
        duration: 5,
        onClick: () => message.destroy(),
      });
    }
  }, [error]);

  const handleAdd = () => {
    form.resetFields();
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Product',
      content: 'Are you sure you want to delete this product?',
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

  const columns: ColumnsType<Product> = [
    {
      title: 'Part No',
      dataIndex: 'part_no',
      key: 'part_no',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
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
        <Spin size="large">
          <div style={{ paddingTop: 50 }}>Loading products...</div>
        </Spin>
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
              Failed to load products: {error.message}<br />
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
  if (!products || products.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>Inventory Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Product
          </Button>
        </div>
        <Empty
          description="No products found. Add your first product to get started."
          style={{ marginTop: 50 }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add First Product
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Inventory Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Product
        </Button>
      </div>
      <Table columns={columns} dataSource={products} rowKey="id" />
      
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item name="stock" label="Stock Quantity" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="supplier" label="Supplier">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventory;
