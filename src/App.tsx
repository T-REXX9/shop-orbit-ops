import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { initializeMockData } from "./utils/mockData";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useEffect } from 'react';

// Initialize mock data on app load
initializeMockData();

const theme = {
  token: {
    colorPrimary: '#0A66C2',
    colorBgBase: '#F8FAFC',
    colorTextBase: '#0F172A',
    colorBorder: '#E2E8F0',
    colorBgContainer: '#FFFFFF',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#DC2626',
    colorInfo: '#3B82F6',
  },
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <ConfigProvider theme={theme}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
