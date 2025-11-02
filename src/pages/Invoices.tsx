import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Space, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getData, addItem, updateItem, deleteItem } from '@/utils/mockData';
import type { Invoice, Order } from '@/types';
import dayjs from 'dayjs';

const { Title } = Typography;

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form] = Form.useForm();

  const loadData = () => {
    setInvoices(getData<Invoice>('erp_invoices'));
    setOrders(getData<Order>('erp_orders').filter(o => o.status === 'delivered'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Invoice) => {
    setEditingInvoice(record);
    form.setFieldsValue({
      ...record,
      dueDate: dayjs(record.dueDate),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Invoice',
      content: 'Are you sure you want to delete this invoice?',
      onOk: () => {
        deleteItem('erp_invoices', id);
        loadData();
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const order = orders.find(o => o.id === values.orderId);
      
      if (!order) return;
      
      const subtotal = order.total;
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      
      if (editingInvoice) {
        updateItem('erp_invoices', editingInvoice.id, {
          ...values,
          dueDate: values.dueDate.format('YYYY-MM-DD'),
        });
      } else {
        const newInvoice: Invoice = {
          id: Date.now().toString(),
          orderId: values.orderId,
          customerName: order.customerName,
          items: order.items,
          subtotal,
          tax,
          total,
          status: values.status,
          createdAt: new Date().toISOString(),
          dueDate: values.dueDate.format('YYYY-MM-DD'),
        };
        addItem('erp_invoices', newInvoice);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal: number) => `$${subtotal.toFixed(2)}`,
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      render: (tax: number) => `$${tax.toFixed(2)}`,
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
        const colorMap = { draft: 'blue', sent: 'orange', paid: 'green' };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<FileTextOutlined />} onClick={() => window.print()}>Print</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Invoices</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Create Invoice
        </Button>
      </div>
      <Table columns={columns} dataSource={invoices} rowKey="id" />
      
      <Modal
        title={editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="orderId" label="Order" rules={[{ required: true }]}>
            <Select disabled={!!editingInvoice}>
              {orders.map(o => (
                <Select.Option key={o.id} value={o.id}>
                  Order #{o.id} - {o.customerName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="sent">Sent</Select.Option>
              <Select.Option value="paid">Paid</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Invoices;
