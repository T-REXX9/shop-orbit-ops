import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getData } from '@/utils/mockData';
import { useInquiries } from '@/features/inquiries/hooks/useInquiries';
import { InquiryTable } from '@/features/inquiries/components/InquiryTable';
import { InquiryForm } from '@/features/inquiries/components/InquiryForm';
import type { Inquiry, Customer, Product } from '@/types';

const { Title } = Typography;

const Inquiries: React.FC = () => {
  const { inquiries, addInquiry, updateInquiry, deleteInquiry } = useInquiries();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setCustomers(getData<Customer>('erp_customers'));
    setProducts(getData<Product>('erp_products'));
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
      onOk: () => deleteInquiry(id),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingInquiry) {
        updateInquiry(editingInquiry.id, values);
      } else {
        addInquiry(values);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Inquiry Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Inquiry
        </Button>
      </div>
      <InquiryTable inquiries={inquiries} onEdit={handleEdit} onDelete={handleDelete} />
      
      <Modal
        title={editingInquiry ? 'Edit Inquiry' : 'Add Inquiry'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <InquiryForm form={form} customers={customers} products={products} />
      </Modal>
    </div>
  );
};

export default Inquiries;
