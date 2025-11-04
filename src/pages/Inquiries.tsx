<<<<<<< Local
import React, { useState } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, Input, Space, Tag, Typography, message, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useInquiries, useCustomers, useProducts } from '@/hooks/useApi';
import type { Inquiry } from '@/types/api';
import { apiFetch } from '@/lib/api';

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
      onOk: async () => {
        try {
          await apiFetch(`/api/v1/inquiries/${id}`, {
            method: 'DELETE',
          });
          message.success('Inquiry deleted successfully');
          refetchInquiries();
        } catch (error) {
          console.error('Error:', error);
          message.error(error instanceof Error ? error.message : 'Failed to delete inquiry');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingInquiry) {
        // Update existing inquiry
        await apiFetch(`/api/v1/inquiries/${editingInquiry.id}`, {
          method: 'PUT',
          body: values,
        });
        message.success('Inquiry updated successfully');
      } else {
        // Create new inquiry
        await apiFetch('/api/v1/inquiries', {
          method: 'POST',
          body: values,
        });
        message.success('Inquiry created successfully');
      }
      
      setIsModalOpen(false);
      refetchInquiries();
    } catch (error) {
      console.error('Error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save inquiry');
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
        <Spin size="large">
          <div style={{ paddingTop: 50 }}>Loading inquiries...</div>
        </Spin>
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
        afterOpenChange={(open) => {
          if (open && !editingInquiry) {
            form.resetFields();
          }
        }}
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
=======
import React, { useState } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, Input, Space, Tag, Typography, message, Empty, Spin, Card, Row, Col, Tooltip, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useInquiries, useCustomers, useProducts } from '@/hooks/useApi';
import type { Inquiry } from '@/types/api';
import { apiFetch } from '@/lib/api';

const { Title } = Typography;
const { TextArea } = Input;

const Inquiries: React.FC = () => {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [customerFilter, setCustomerFilter] = useState<string | undefined>(undefined);
  
  // Fetch data using TanStack Query hooks with filters
  const { data: inquiries = [], isLoading: inquiriesLoading, error: inquiriesError, refetch: refetchInquiries } = useInquiries();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [rejectingInquiry, setRejectingInquiry] = useState<Inquiry | null>(null);
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();

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
    setEditingInquiry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: Inquiry) => {
    setEditingInquiry(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleView = async (record: Inquiry) => {
    try {
      // Fetch detailed inquiry information
      const response = await apiFetch<{ success: boolean; data: Inquiry }>(`/api/v1/inquiries/${record.id}`);
      setViewingInquiry(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to load inquiry details');
    }
  };

  const handleDelete = (id: string, customerName: string) => {
    Modal.confirm({
      title: 'Delete Inquiry',
      content: `Are you sure you want to delete the inquiry from ${customerName}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await apiFetch(`/api/v1/inquiries/${id}`, {
            method: 'DELETE',
          });
          message.success('Inquiry deleted successfully');
          refetchInquiries();
        } catch (error) {
          console.error('Error:', error);
          message.error(error instanceof Error ? error.message : 'Failed to delete inquiry');
        }
      },
    });
  };

  const handleConvert = (inquiry: Inquiry) => {
    if (inquiry.status === 'converted') {
      message.warning('This inquiry has already been converted to an order');
      return;
    }

    Modal.confirm({
      title: 'Convert to Order',
      content: `Convert inquiry from ${inquiry.customer_name} to an order?`,
      okText: 'Convert',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await apiFetch(`/api/v1/inquiries/${inquiry.id}/convert`, {
            method: 'POST',
          });
          message.success('Inquiry converted to order successfully');
          refetchInquiries();
        } catch (error) {
          console.error('Error:', error);
          message.error(error instanceof Error ? error.message : 'Failed to convert inquiry');
        }
      },
    });
  };

  const handleRejectClick = (inquiry: Inquiry) => {
    if (inquiry.status === 'rejected') {
      message.warning('This inquiry has already been rejected');
      return;
    }
    setRejectingInquiry(inquiry);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await rejectForm.validateFields();
      if (!rejectingInquiry) return;

      await apiFetch(`/api/v1/inquiries/${rejectingInquiry.id}/reject`, {
        method: 'POST',
        body: { notes: values.rejectionNotes },
      });
      message.success('Inquiry rejected successfully');
      setIsRejectModalOpen(false);
      rejectForm.resetFields();
      setRejectingInquiry(null);
      refetchInquiries();
    } catch (error) {
      console.error('Error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to reject inquiry');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Map form field names to API expected names
      const payload = {
        customer_id: values.customerId,
        product_id: values.productId,
        quantity: values.quantity,
        status: values.status,
        notes: values.notes || null,
      };
      
      if (editingInquiry) {
        // Update existing inquiry
        await apiFetch(`/api/v1/inquiries/${editingInquiry.id}`, {
          method: 'PUT',
          body: payload,
        });
        message.success('Inquiry updated successfully');
      } else {
        // Create new inquiry
        await apiFetch('/api/v1/inquiries', {
          method: 'POST',
          body: payload,
        });
        message.success('Inquiry created successfully');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingInquiry(null);
      refetchInquiries();
    } catch (error) {
      console.error('Error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save inquiry');
    }
  };

  // Apply filters to inquiries
  const filteredInquiries = React.useMemo(() => {
    return inquiries.filter(inquiry => {
      const matchesStatus = !statusFilter || inquiry.status === statusFilter;
      const matchesCustomer = !customerFilter || inquiry.customer_id === customerFilter;
      return matchesStatus && matchesCustomer;
    });
  }, [inquiries, statusFilter, customerFilter]);

  const handleClearFilters = () => {
    setStatusFilter(undefined);
    setCustomerFilter(undefined);
  };

  const columns: ColumnsType<Inquiry> = [
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      sorter: (a, b) => (a.customer_name || '').localeCompare(b.customer_name || ''),
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a, b) => (a.product_name || '').localeCompare(b.product_name || ''),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap = { pending: 'blue', converted: 'green', rejected: 'red' };
        return <Tag color={colorMap[status as keyof typeof colorMap]}>{status.toUpperCase()}</Tag>;
      },
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes: string) => notes || '-',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Convert to Order">
            <Button 
              icon={<CheckCircleOutlined />} 
              size="small"
              type="primary"
              disabled={record.status === 'converted'}
              onClick={() => handleConvert(record)} 
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button 
              icon={<CloseCircleOutlined />} 
              size="small"
              danger
              disabled={record.status === 'rejected'}
              onClick={() => handleRejectClick(record)} 
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger 
              onClick={() => handleDelete(record.id, record.customer_name)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render loading state
  if (inquiriesLoading || customersLoading || productsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large">
          <div style={{ paddingTop: 50 }}>Loading inquiries...</div>
        </Spin>
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
        
        {/* Form Modal */}
        <Modal
          title={editingInquiry ? 'Edit Inquiry' : 'Add Inquiry'}
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setEditingInquiry(null);
          }}
          afterOpenChange={(open) => {
            if (open && !editingInquiry) {
              form.resetFields();
            }
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="customerId" label="Customer" rules={[{ required: true, message: 'Customer is required' }]}>
              <Select loading={customersLoading} placeholder="Select customer" showSearch optionFilterProp="children">
                {customers.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.customer_name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="productId" label="Product" rules={[{ required: true, message: 'Product is required' }]}>
              <Select loading={productsLoading} placeholder="Select product" showSearch optionFilterProp="children">
                {products.map(p => (
                  <Select.Option key={p.id} value={p.id}>{p.part_no} - {p.description}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: 'Quantity is required' }, { type: 'number', min: 1, message: 'Quantity must be at least 1' }]}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter quantity" />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status is required' }]}>
              <Select placeholder="Select status">
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="converted">Converted</Select.Option>
                <Select.Option value="rejected">Rejected</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="notes" label="Notes" rules={[{ max: 1000, message: 'Notes must not exceed 1000 characters' }]}>
              <TextArea rows={3} placeholder="Optional notes" maxLength={1000} showCount />
            </Form.Item>
          </Form>
        </Modal>
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

      {/* Filters */}
      <Card style={{ marginBottom: 16 }} size="small">
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <FilterOutlined style={{ fontSize: 16, marginRight: 8 }} />
            <strong>Filters:</strong>
          </Col>
          <Col flex="auto">
            <Space size="middle" wrap>
              <div>
                <span style={{ marginRight: 8 }}>Status:</span>
                <Select
                  style={{ width: 150 }}
                  placeholder="All statuses"
                  allowClear
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="converted">Converted</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                </Select>
              </div>
              <div>
                <span style={{ marginRight: 8 }}>Customer:</span>
                <Select
                  style={{ width: 200 }}
                  placeholder="All customers"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  value={customerFilter}
                  onChange={setCustomerFilter}
                  loading={customersLoading}
                >
                  {customers.map(c => (
                    <Select.Option key={c.id} value={c.id}>{c.customer_name}</Select.Option>
                  ))}
                </Select>
              </div>
              {(statusFilter || customerFilter) && (
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              )}
            </Space>
          </Col>
          <Col>
            <Tag color="blue">{filteredInquiries.length} inquiries</Tag>
          </Col>
        </Row>
      </Card>

      <Table 
        columns={columns} 
        dataSource={filteredInquiries} 
        rowKey="id" 
        scroll={{ x: 1200 }}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} inquiries`,
        }}
      />
      
      {/* Form Modal */}
      <Modal
        title={editingInquiry ? 'Edit Inquiry' : 'Add Inquiry'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingInquiry(null);
        }}
        afterOpenChange={(open) => {
          if (open && !editingInquiry) {
            form.resetFields();
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="Customer" rules={[{ required: true, message: 'Customer is required' }]}>
            <Select loading={customersLoading} placeholder="Select customer" showSearch optionFilterProp="children">
              {customers.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.customer_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="productId" label="Product" rules={[{ required: true, message: 'Product is required' }]}>
            <Select loading={productsLoading} placeholder="Select product" showSearch optionFilterProp="children">
              {products.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.part_no} - {p.description}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: 'Quantity is required' }, { type: 'number', min: 1, message: 'Quantity must be at least 1' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter quantity" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Status is required' }]}>
            <Select placeholder="Select status">
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="converted">Converted</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes" rules={[{ max: 1000, message: 'Notes must not exceed 1000 characters' }]}>
            <TextArea rows={3} placeholder="Optional notes" maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail View Modal */}
      <Modal
        title="Inquiry Details"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setViewingInquiry(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsDetailModalOpen(false);
            setViewingInquiry(null);
          }}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {viewingInquiry && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Inquiry ID" span={2}>{viewingInquiry.id}</Descriptions.Item>
            <Descriptions.Item label="Customer" span={2}>
              <strong>{viewingInquiry.customer_name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Product" span={2}>
              <strong>{viewingInquiry.product_name}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">{viewingInquiry.quantity}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={viewingInquiry.status === 'pending' ? 'blue' : viewingInquiry.status === 'converted' ? 'green' : 'red'}>
                {viewingInquiry.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{viewingInquiry.notes || 'No notes'}</Descriptions.Item>
            <Descriptions.Item label="Created">{new Date(viewingInquiry.created_at).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Updated">{new Date(viewingInquiry.updated_at).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Inquiry"
        open={isRejectModalOpen}
        onOk={handleRejectSubmit}
        onCancel={() => {
          setIsRejectModalOpen(false);
          rejectForm.resetFields();
          setRejectingInquiry(null);
        }}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        {rejectingInquiry && (
          <>
            <p>Are you sure you want to reject the inquiry from <strong>{rejectingInquiry.customer_name}</strong>?</p>
            <Form form={rejectForm} layout="vertical">
              <Form.Item 
                name="rejectionNotes" 
                label="Rejection Reason (Optional)"
                rules={[{ max: 1000, message: 'Notes must not exceed 1000 characters' }]}
              >
                <TextArea rows={4} placeholder="Enter reason for rejection..." maxLength={1000} showCount />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Inquiries;
>>>>>>> Remote
