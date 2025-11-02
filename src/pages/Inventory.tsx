import React, { useState } from 'react';
import { Button, Modal, Form, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useInventory } from '@/features/inventory/hooks/useInventory';
import { ProductTable } from '@/features/inventory/components/ProductTable';
import { ProductForm } from '@/features/inventory/components/ProductForm';
import type { Product } from '@/types';

const { Title } = Typography;

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

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
      onOk: () => deleteProduct(id),
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        updateProduct(editingProduct.id, values);
      } else {
        addProduct(values);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Inventory Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Product
        </Button>
      </div>
      <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
      
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <ProductForm form={form} />
      </Modal>
    </div>
  );
};

export default Inventory;
