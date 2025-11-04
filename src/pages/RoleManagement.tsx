/**
 * Role Management Page
 * Admin interface for managing roles and permissions
 */

import { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Popconfirm, Card, Checkbox, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { RoleListItem, RoleWithPermissions, PermissionGroup, CreateRoleRequest } from '@/types/api';

const { TextArea } = Input;
const { Panel } = Collapse;

export default function RoleManagement() {
  const [form] = Form.useForm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: RoleListItem[] }>('/api/v1/roles');
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fetch permissions
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: PermissionGroup[] }>(
        '/api/v1/roles/permissions/all'
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (values: CreateRoleRequest) => {
      return await apiFetch('/api/v1/roles', {
        method: 'POST',
        body: values,
      });
    },
    onSuccess: () => {
      message.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateModalOpen(false);
      form.resetFields();
      setSelectedPermissions([]);
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create role');
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      return await apiFetch(`/api/v1/roles/${id}`, {
        method: 'PUT',
        body: values,
      });
    },
    onSuccess: () => {
      message.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsEditModalOpen(false);
      form.resetFields();
      setSelectedRole(null);
      setSelectedPermissions([]);
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update role');
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiFetch(`/api/v1/roles/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      message.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to delete role');
    },
  });

  const handleCreateRole = () => {
    form.validateFields().then((values) => {
      if (selectedPermissions.length === 0) {
        message.error('Please select at least one permission');
        return;
      }
      createRoleMutation.mutate({
        ...values,
        permission_ids: selectedPermissions,
      });
    });
  };

  const handleEditRole = async (role: RoleListItem) => {
    try {
      // Fetch full role data with permissions
      const response = await apiFetch<{ success: boolean; data: RoleWithPermissions }>(
        `/api/v1/roles/${role.id}`
      );
      const roleData = response.data;
      
      setSelectedRole(roleData);
      form.setFieldsValue({
        role_name: roleData.name,
        description: roleData.description,
      });
      setSelectedPermissions(roleData.permissions.map(p => p.id));
      setIsEditModalOpen(true);
    } catch (error: any) {
      message.error('Failed to load role data');
    }
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;
    
    form.validateFields().then((values) => {
      if (selectedPermissions.length === 0) {
        message.error('Please select at least one permission');
        return;
      }
      updateRoleMutation.mutate({
        id: selectedRole.id,
        values: {
          ...values,
          permission_ids: selectedPermissions,
        },
      });
    });
  };

  const handleDeleteRole = (roleId: string) => {
    deleteRoleMutation.mutate(roleId);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        return [...prev, permissionId];
      } else {
        return prev.filter(id => id !== permissionId);
      }
    });
  };

  const handleResourceToggle = (resourcePermissions: any[], checked: boolean) => {
    const permissionIds = resourcePermissions.map(p => p.id);
    setSelectedPermissions(prev => {
      if (checked) {
        return [...new Set([...prev, ...permissionIds])];
      } else {
        return prev.filter(id => !permissionIds.includes(id));
      }
    });
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: RoleListItem) => (
        <Space>
          <span>{name}</span>
          {record.isSystemRole && <Tag color="gold">System</Tag>}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissionCount',
      key: 'permissionCount',
      render: (count: number) => <Tag color="blue">{count} permissions</Tag>,
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => <Tag color="green">{count} users</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RoleListItem) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditRole(record)}
            disabled={record.isSystemRole}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Role"
            description={`Are you sure you want to delete this role? ${
              record.userCount > 0 ? `This role has ${record.userCount} assigned users.` : ''
            }`}
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.isSystemRole || record.userCount > 0}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              disabled={record.isSystemRole || record.userCount > 0}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderPermissionCheckboxes = () => {
    if (!permissionsData) return null;

    return (
      <Collapse defaultActiveKey={permissionsData.map((_, idx) => idx.toString())}>
        {permissionsData.map((group, idx) => {
          const allSelected = group.permissions.every(p => selectedPermissions.includes(p.id));
          const someSelected = group.permissions.some(p => selectedPermissions.includes(p.id));

          return (
            <Panel
              key={idx.toString()}
              header={
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={(e) => handleResourceToggle(group.permissions, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <strong>{group.resource.charAt(0).toUpperCase() + group.resource.slice(1)}</strong>
                </Checkbox>
              }
            >
              <Space direction="vertical" style={{ width: '100%', paddingLeft: '24px' }}>
                {group.permissions.map((permission) => (
                  <Checkbox
                    key={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                  >
                    {permission.description || permission.key}
                  </Checkbox>
                ))}
              </Space>
            </Panel>
          );
        })}
      </Collapse>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Role Management</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedPermissions([]);
              setIsCreateModalOpen(true);
            }}
          >
            Create Role
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={rolesData}
          rowKey="id"
          loading={rolesLoading}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      {/* Create Role Modal */}
      <Modal
        title="Create New Role"
        open={isCreateModalOpen}
        onOk={handleCreateRole}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
          setSelectedPermissions([]);
        }}
        confirmLoading={createRoleMutation.isPending}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role_name"
            label="Role Name"
            rules={[{ required: true, message: 'Role name is required' }]}
          >
            <Input placeholder="e.g., Sales Manager" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Brief description of this role" />
          </Form.Item>
          <Form.Item label="Permissions" required>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '12px', borderRadius: '4px' }}>
              {renderPermissionCheckboxes()}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        title="Edit Role"
        open={isEditModalOpen}
        onOk={handleUpdateRole}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
          setSelectedRole(null);
          setSelectedPermissions([]);
        }}
        confirmLoading={updateRoleMutation.isPending}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="role_name"
            label="Role Name"
            rules={[{ required: true, message: 'Role name is required' }]}
          >
            <Input placeholder="e.g., Sales Manager" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Brief description of this role" />
          </Form.Item>
          <Form.Item label="Permissions" required>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #d9d9d9', padding: '12px', borderRadius: '4px' }}>
              {renderPermissionCheckboxes()}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
