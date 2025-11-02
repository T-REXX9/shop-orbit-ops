import React, { useState } from 'react';
import { Button, Modal, Form, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCustomers } from '@/features/crm/hooks/useCustomers';
import { CustomerTable } from '@/features/crm/components/CustomerTable';
import { CustomerForm } from '@/features/crm/components/CustomerForm';
import type { Customer } from '@/types';

const { Title } = Typography;

const CRM: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

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
      onOk: () => deleteCustomer(id),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        updateCustomer(editingCustomer.id, values);
      } else {
        addCustomer({ ...values, createdAt: new Date().toISOString() });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Customer Relationship Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Customer
        </Button>
      </div>
      <CustomerTable customers={customers} onEdit={handleEdit} onDelete={handleDelete} />
      
      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <CustomerForm form={form} />
      </Modal>
    </div>
  );
};

export default CRM;
