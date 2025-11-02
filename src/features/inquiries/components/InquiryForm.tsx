import React from 'react';
import { Form, Select, InputNumber, Input } from 'antd';
import type { Customer, Product } from '@/types';

const { TextArea } = Input;

interface InquiryFormProps {
  form: any;
  customers: Customer[];
  products: Product[];
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ form, customers, products }) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item name="customerId" label="Customer" rules={[{ required: true }]}>
        <Select
          showSearch
          optionFilterProp="children"
          onChange={(value) => {
            const customer = customers.find(c => c.id === value);
            form.setFieldsValue({ customerName: customer?.name });
          }}
        >
          {customers.map(customer => (
            <Select.Option key={customer.id} value={customer.id}>
              {customer.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="customerName" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="productId" label="Product" rules={[{ required: true }]}>
        <Select
          showSearch
          optionFilterProp="children"
          onChange={(value) => {
            const product = products.find(p => p.id === value);
            form.setFieldsValue({ productName: product?.name });
          }}
        >
          {products.map(product => (
            <Select.Option key={product.id} value={product.id}>
              {product.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="productName" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select>
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="quoted">Quoted</Select.Option>
          <Select.Option value="converted">Converted</Select.Option>
          <Select.Option value="rejected">Rejected</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="notes" label="Notes">
        <TextArea rows={4} />
      </Form.Item>
    </Form>
  );
};
