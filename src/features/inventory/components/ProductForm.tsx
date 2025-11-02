import React from 'react';
import { Form, Input, InputNumber } from 'antd';

interface ProductFormProps {
  form: any;
}

export const ProductForm: React.FC<ProductFormProps> = ({ form }) => {
  return (
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
  );
};
