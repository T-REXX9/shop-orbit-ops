<<<<<<< Local
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  InboxOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/crm', icon: <TeamOutlined />, label: 'CRM' },
    { key: '/inquiries', icon: <InboxOutlined />, label: 'Inquiries' },
    { key: '/orders', icon: <ShoppingOutlined />, label: 'Orders' },
    { key: '/inventory', icon: <InboxOutlined />, label: 'Inventory' },
    { key: '/invoices', icon: <FileTextOutlined />, label: 'Invoices' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#1E293B',
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? '16px' : '20px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}>
          {collapsed ? 'ERP' : 'ERP System'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: '#1E293B',
            color: '#CBD5E1',
          }}
          theme="dark"
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: '18px', color: '#fff', cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Text style={{ color: '#fff' }}>{user?.name}</Text>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0A66C2' }} />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 280,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
=======
import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Badge } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  InboxOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { canView } = usePermission();

  // Define all menu items with permission requirements
  const allMenuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard', permission: 'view_dashboard' },
    { key: '/crm', icon: <TeamOutlined />, label: 'CRM', permission: 'view_crm' },
    { key: '/inquiries', icon: <InboxOutlined />, label: 'Inquiries', permission: 'view_inquiries' },
    { key: '/orders', icon: <ShoppingOutlined />, label: 'Orders', permission: 'view_orders' },
    { key: '/inventory', icon: <InboxOutlined />, label: 'Inventory', permission: 'view_inventory' },
    { key: '/invoices', icon: <FileTextOutlined />, label: 'Invoices', permission: 'view_invoices' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports', permission: 'view_reports' },
    { key: '/users', icon: <UsergroupAddOutlined />, label: 'Users', permission: 'view_users' },
    { key: '/roles', icon: <SafetyOutlined />, label: 'Roles', permission: 'view_roles' },
  ];

  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => canView(item.permission.replace('view_', '')));
  }, [user, canView]);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#1E293B',
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? '16px' : '20px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}>
          {collapsed ? 'ERP' : 'ERP System'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: '#1E293B',
            color: '#CBD5E1',
          }}
          theme="dark"
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: '18px', color: '#fff', cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ textAlign: 'right' }}>
                <Text style={{ color: '#fff', display: 'block' }}>{user?.name}</Text>
                <Text style={{ color: '#94A3B8', fontSize: '12px' }}>{user?.role?.name}</Text>
              </div>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0A66C2' }} />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 280,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
>>>>>>> Remote
