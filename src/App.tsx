import { ConfigProvider } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { initializeMockData } from "./utils/mockData";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Inquiries from "./pages/Inquiries";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";

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

function App() {
  return (
    <ConfigProvider theme={theme}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
            <Route path="/crm" element={
              <ProtectedRoute>
                <AppLayout>
                  <CRM />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/inquiries" element={
              <ProtectedRoute>
                <AppLayout>
                  <Inquiries />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <AppLayout>
                  <Orders />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <AppLayout>
                  <Inventory />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/invoices" element={
              <ProtectedRoute>
                <AppLayout>
                  <Invoices />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
