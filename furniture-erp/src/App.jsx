import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ERPLayout from './layouts/ERPLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PermissionGuard from './components/PermissionGuard';

import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';

import Dashboard from './pages/Dashboard';
import MyProfile from './pages/employee/MyProfile';
import Employees from './pages/employee/Employees';
import QuotationDashboard from './pages/employee/QuotationDashboard';
import DeliveryDashboard from './pages/employee/DeliveryDashboard';
import Customers from './pages/customers/Customers';
import AddCustomer from './pages/customers/AddCustomer';
import EditCustomer from './pages/customers/EditCustomer';
import CustomerDetails from './pages/customers/CustomerDetails';

import Quotations from './pages/quotations/Quotations';
import CreateQuotation from './pages/quotations/CreateQuotation';
import EditQuotation from './pages/quotations/EditQuotation';
import QuotationDetails from './pages/quotations/QuotationDetails';
import QuotationPreview from './pages/quotations/QuotationPreview';

import SalesOrders from './pages/orders/SalesOrders';
import Products from './pages/products/Products';
import StocksOverview from './pages/inventory/StocksOverview';
import Deliveries from './pages/delivery/Deliveries';
import Settings from './pages/settings/Settings';
import Reports from './pages/reports/Reports';

import Inquiries from './pages/inquiry/Inquiries';
import Leads from './pages/leads/Leads';
import LeadDetails from './pages/leads/LeadDetails';
import FollowUps from './pages/leads/FollowUps';

import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Admin Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ERPLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="quotation-dashboard" element={<QuotationDashboard />} />
                <Route path="delivery-dashboard" element={<DeliveryDashboard />} />
                <Route path="my-profile" element={<MyProfile />} />

                {/* Employees Management */}
                <Route
                  path="employees"
                  element={
                    <PermissionGuard permission="employees.create">
                      <Employees />
                    </PermissionGuard>
                  }
                />
                <Route path="employees/add" element={<Employees />} />
                <Route path="employees/attendance" element={<Employees />} />
                <Route path="employees/leave" element={<Employees />} />
                <Route path="employees/permissions" element={<Employees />} />

                {/* Inquiry & CRM */}
                <Route path="inquiries" element={<Inquiries />} />
                <Route path="leads" element={<Leads />} />
                <Route path="leads/:id" element={<LeadDetails />} />
                <Route path="followups" element={<FollowUps />} />

                {/* Customers */}
                <Route
                  path="customers"
                  element={
                    <PermissionGuard permission="customers.view">
                      <Customers />
                    </PermissionGuard>
                  }
                />
                <Route path="customers/add" element={<AddCustomer />} />
                <Route path="customers/edit/:id" element={<EditCustomer />} />
                <Route path="customers/:id" element={<CustomerDetails />} />

                {/* Quotations */}
                <Route
                  path="quotations"
                  element={
                    <PermissionGuard permission="quotations.view">
                      <Quotations />
                    </PermissionGuard>
                  }
                />
                <Route path="quotations/create" element={<CreateQuotation />} />
                <Route path="quotations/edit/:id" element={<EditQuotation />} />
                <Route path="quotations/:id" element={<QuotationDetails />} />
                <Route path="quotations/preview/:id" element={<QuotationPreview />} />

                {/* Sales Orders */}
                <Route
                  path="orders"
                  element={
                    <PermissionGuard permission="salesOrders.view">
                      <SalesOrders />
                    </PermissionGuard>
                  }
                />

                {/* Products Catalog */}
                <Route path="products" element={<Products />} />
                <Route path="products/:categorySlug" element={<Products />} />

                {/* Stocks Overview */}
                <Route
                  path="stocks"
                  element={
                    <PermissionGuard permission="inventory.view">
                      <StocksOverview />
                    </PermissionGuard>
                  }
                />

                {/* Dispatch & Delivery */}
                <Route
                  path="deliveries"
                  element={
                    <PermissionGuard permission="delivery.view">
                      <Deliveries />
                    </PermissionGuard>
                  }
                />

                {/* Reports & Analytics */}
                <Route path="reports" element={<Reports />} />

                {/* Settings */}
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
