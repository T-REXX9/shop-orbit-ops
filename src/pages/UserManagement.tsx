/**
 * User Management Page
 * Admin interface for managing user accounts
 */

import { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { UserListItem, RoleListItem, CreateUserRequest, UpdateUserRequest } from '@/types/api';

const { Search } = Input;

export default function UserManagement() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', searchText, statusFilter, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchText) params.append('search', searchText);
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role_id', roleFilter);
      
      const response = await apiFetch<{ success: boolean; data: { users: UserListItem[] } }>(
        `/api/v1/users?${params.toString()}`
      );
      return response.data.users;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fetch roles for dropdowns
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: RoleListItem[] }>('/api/v1/roles');
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (values: CreateUserRequest) => {
      return await apiFetch('/api/v1/users', {
        method: 'POST',
        body: values,
      });
    },
    onSuccess: () => {
      message.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create user');
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: UpdateUserRequest }) => {
      return await apiFetch(`/api/v1/users/${id}`, {
        method: 'PUT',
        body: values,
      });
    },
    onSuccess: () => {
      message.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditModalOpen(false);
      form.resetFields();
      setSelectedUser(null);
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiFetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      message.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to delete user');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      return await apiFetch(`/api/v1/users/${id}/password`, {
        method: 'PUT',
        body: { password },
      });
    },
    onSuccess: () => {
      message.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
      setSelectedUser(null);
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to change password');
    },
  });

  const handleCreateUser = () => {
    form.validateFields().then((values) => {
      createUserMutation.mutate(values);
    });
  };

  const handleEditUser = (user: UserListItem) => {
    setSelectedUser(user);
    form.setFieldsValue({
      full_name: user.name,
      role_id: user.role.id,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    form.validateFields().then((values) => {
      updateUserMutation.mutate({ id: selectedUser.id, values });
    });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleChangePassword = (user: UserListItem) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChange = () => {
    if (!selectedUser) return;
    passwordForm.validateFields().then((values) => {
      changePasswordMutation.mutate({ id: selectedUser.id, password: values.password });
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: any) => <Tag color="blue">{role.name}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserListItem) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditUser(record)}
          >
            Edit
          </Button>
          <Button
            icon={<LockOutlined />}
            size="small"
            onClick={() => handleChangePassword(record)}
          >
            Password
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>User Management</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create User
          </Button>
        </div>

        <Space style={{ marginBottom: '16px' }} wrap>
          <Search
            placeholder="Search by name or email"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={setSearchText}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={setStatusFilter}
          >
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
            <Select.Option value="suspended">Suspended</Select.Option>
          </Select>
          <Select
            placeholder="Filter by role"
            allowClear
            style={{ width: 200 }}
            onChange={setRoleFilter}
          >
            {rolesData?.map((role) => (
              <Select.Option key={role.id} value={role.id}>
                {role.name}
              </Select.Option>
            ))}
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={usersData}
          rowKey="id"
          loading={usersLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={isCreateModalOpen}
        onOk={handleCreateUser}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createUserMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password placeholder="Minimum 8 characters" />
          </Form.Item>
          <Form.Item
            name="role_id"
            label="Role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select placeholder="Select role">
              {rolesData?.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isEditModalOpen}
        onOk={handleUpdateUser}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
          setSelectedUser(null);
        }}
        confirmLoading={updateUserMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Full name is required' }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item
            name="role_id"
            label="Role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select placeholder="Select role">
              {rolesData?.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="suspended">Suspended</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={isPasswordModalOpen}
        onOk={handlePasswordChange}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          passwordForm.resetFields();
          setSelectedUser(null);
        }}
        confirmLoading={changePasswordMutation.isPending}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password placeholder="Minimum 8 characters" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
