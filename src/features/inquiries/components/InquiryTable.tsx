import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Inquiry } from '@/types';

interface InquiryTableProps {
  inquiries: Inquiry[];
  onEdit: (inquiry: Inquiry) => void;
  onDelete: (id: string) => void;
}

export const InquiryTable: React.FC<InquiryTableProps> = ({ inquiries, onEdit, onDelete }) => {
  const columns: ColumnsType<Inquiry> = [
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
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
        const colors: Record<string, string> = {
          pending: 'blue',
          quoted: 'orange',
          converted: 'green',
          rejected: 'red',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => onDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={inquiries} rowKey="id" />;
};
