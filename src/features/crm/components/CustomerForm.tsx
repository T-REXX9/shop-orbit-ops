import React from 'react';
import { Form, Input, Select } from 'antd';
import type { Customer } from '@/types';

const { TextArea } = Input;

interface CustomerFormProps {
  form: any;
  initialValues?: Customer;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ form }) => {
  return (
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
      <Form.Item name="company" label="Company" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="address" label="Address">
        <TextArea rows={3} />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select>
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  );
};
