import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Space, Tag, Typography, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getData, addItem, updateItem, deleteItem, Order, Customer, Product } from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';

const { Title } = Typography;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();
  const { user } = useAuth();

  const loadData = () => {
    setOrders(getData<Order>('erp_orders'));
    setCustomers(getData<Customer>('erp_customers'));
    setProducts(getData<Product>('erp_products'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ items: [{ productId: undefined, quantity: 1 }] });
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Order) => {
    setEditingOrder(record);
    form.setFieldsValue({
      customerId: record.customerId,
      status: record.status,
      items: record.items,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Order',
      content: 'Are you sure you want to delete this order?',
      onOk: () => {
        deleteItem('erp_orders', id);
        loadData();
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const customer = customers.find(c => c.id === values.customerId);
      
      const items = values.items.map((item: any) => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || '',
          quantity: item.quantity,
          price: product?.price || 0,
        };
      });
      
      const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      
      if (editingOrder) {
        updateItem('erp_orders', editingOrder.id, {
          ...values,
          customerName: customer?.name || '',
          items,
          total,
        });
      } else {
        const newOrder: Order = {
          id: Date.now().toString(),
          customerId: values.customerId,
          customerName: customer?.name || '',
          items,
          total,
          status: values.status,
          salesPerson: user?.name || 'Unknown',
          createdAt: new Date().toISOString(),
        };
        addItem('erp_orders', newOrder);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<Order> = [
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
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: Order['items']) => items.length,
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
      render: (status: string) => {
        const colorMap = { pending: 'blue', processing: 'orange', completed: 'green', cancelled: 'red' };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Sales Person',
      dataIndex: 'salesPerson',
      key: 'salesPerson',
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
        <Title level={2}>Orders</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Create Order
        </Button>
      </div>
      <Table columns={columns} dataSource={orders} rowKey="id" />
      
      <Modal
        title={editingOrder ? 'Edit Order' : 'Create Order'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="Customer" rules={[{ required: true }]}>
            <Select>
              {customers.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="processing">Processing</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Select product' }]}
                    >
                      <Select placeholder="Product" style={{ width: 200 }}>
                        {products.map(p => (
                          <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Quantity' }]}
                    >
                      <InputNumber placeholder="Qty" min={1} />
                    </Form.Item>
                    <Button onClick={() => remove(name)}>Remove</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
