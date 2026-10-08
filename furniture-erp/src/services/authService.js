import axios from 'axios';
import { AUTH_API_URL as API_URL } from '../config/apiConfig';

// Helper to get stored token
export const getToken = () => {
  return (
    localStorage.getItem('erp_token') ||
    localStorage.getItem('erpToken') ||
    sessionStorage.getItem('erp_token') ||
    sessionStorage.getItem('erpToken')
  );
};

// Helper to get stored user data
export const getCurrentUser = () => {
  const userStr =
    localStorage.getItem('erp_user') ||
    localStorage.getItem('erpAdmin') ||
    sessionStorage.getItem('erp_user') ||
    sessionStorage.getItem('erpAdmin');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

// Helper for Permission check on frontend
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  if (!user) return false;

  const role = (user.role || '').toLowerCase();
  const email = (user.email || '').toLowerCase();
  const permissions = user.permissions || [];

  // Admin or wildcard has unrestricted permissions
  if (
    role === 'admin' ||
    role === 'superadmin' ||
    role === 'administrator' ||
    email === 'patelchintan0608@gmail.com' ||
    email === 'admin@patelplywood.com' ||
    email === 'chintan.patel@patelplywood.com' ||
    permissions.includes('*')
  ) {
    return true;
  }

  if (!permission) return true;

  // Check direct permission
  return permissions.includes(permission);
};

// Helper for Role check on frontend
export const hasRole = (...roles) => {
  const user = getCurrentUser();
  if (!user) return false;
  const userRole = (user.role || '').toLowerCase();
  return roles.some((r) => r.toLowerCase() === userRole);
};

// Helper to determine role-based dashboard route
export const getDashboardRouteForUser = (user) => {
  if (!user) return '/login';
  const role = (user.role || '').toLowerCase();
  const email = (user.email || '').toLowerCase();

  // Admin users ALWAYS route to Main Admin Dashboard ("/")
  if (
    role === 'admin' ||
    role === 'superadmin' ||
    role === 'administrator' ||
    email === 'patelchintan0608@gmail.com' ||
    email === 'admin@patelplywood.com' ||
    email === 'chintan.patel@patelplywood.com'
  ) {
    return '/';
  }

  const empType = (user.employeeType || '').toLowerCase();

  if (role === 'quotation_employee' || empType === 'quotation_employee') {
    return '/quotation-dashboard';
  }
  if (role === 'delivery_employee' || empType === 'delivery_employee') {
    return '/delivery-dashboard';
  }
  return '/';
};

// Helper to check if token exists and is valid
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const payload = JSON.parse(atob(payloadBase64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      logout();
      return false;
    }
    return true;
  } catch (e) {
    return true;
  }
};

// Register service call
export const register = async (name, email, password, role = 'admin') => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
      role
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('erp_token', response.data.token);
      localStorage.setItem('erpToken', response.data.token);
      localStorage.setItem('erp_user', JSON.stringify(response.data.user));
      localStorage.setItem('erpAdmin', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to register account.';
    throw new Error(message);
  }
};

// Login service call
export const login = async (email, password, rememberMe = true) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  try {
    const response = await axios.post(`${API_URL}/login`, {
      email: cleanEmail,
      password: cleanPass
    });

    if (response.data.success && response.data.token) {
      const storage = rememberMe ? localStorage : sessionStorage;
      
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erpToken');
      localStorage.removeItem('erp_user');
      localStorage.removeItem('erpAdmin');
      sessionStorage.removeItem('erp_token');
      sessionStorage.removeItem('erpToken');
      sessionStorage.removeItem('erp_user');
      sessionStorage.removeItem('erpAdmin');

      const userData = response.data.user || response.data.admin;

      storage.setItem('erp_token', response.data.token);
      storage.setItem('erpToken', response.data.token);
      storage.setItem('erp_user', JSON.stringify(userData));
      storage.setItem('erpAdmin', JSON.stringify(userData));
    }

    return response.data;
  } catch (error) {
    // Fallback check for specified employee rp2568@gmail.com
    if (
      cleanEmail === 'rp2568@gmail.com' &&
      (cleanPass === 'Patel@76281' || cleanPass === 'patel@76281' || cleanPass === 'Patel@123')
    ) {
      const rpUser = {
        _id: 'emp_rp2568',
        employeeId: 'EMP-2568',
        name: 'Rahul Patel',
        email: 'rp2568@gmail.com',
        role: 'sales_employee',
        department: 'Sales & Marketing',
        permissions: [
          'customers.view',
          'customers.create',
          'customers.edit',
          'quotations.view',
          'quotations.create',
          'quotations.edit',
          'salesOrders.view',
          'salesOrders.create',
          'leads.view',
          'leads.create'
        ],
        avatar: '/RP_profile.jpg',
        status: 'active'
      };
      const mockToken = 'mock_jwt_rp2568_token';
      const storage = rememberMe ? localStorage : sessionStorage;

      localStorage.removeItem('erp_token');
      localStorage.removeItem('erpToken');
      localStorage.removeItem('erp_user');
      localStorage.removeItem('erpAdmin');
      sessionStorage.removeItem('erp_token');
      sessionStorage.removeItem('erpToken');
      sessionStorage.removeItem('erp_user');
      sessionStorage.removeItem('erpAdmin');

      storage.setItem('erp_token', mockToken);
      storage.setItem('erpToken', mockToken);
      storage.setItem('erp_user', JSON.stringify(rpUser));
      storage.setItem('erpAdmin', JSON.stringify(rpUser));

      return {
        success: true,
        token: mockToken,
        user: rpUser
      };
    }

    // Fallback check for specified admin credentials
    if (
      (cleanEmail === 'patelchintan0608@gmail.com' || cleanEmail === 'admin@patelplywood.com' || cleanEmail === 'admin') &&
      (cleanPass === 'Admin@12345' || cleanPass === 'admin123' || cleanPass === 'Admin@123')
    ) {
      const adminUser = {
        _id: 'admin_patelchintan0608',
        name: 'Chintan Patel',
        email: 'patelchintan0608@gmail.com',
        role: 'admin',
        department: 'Management',
        permissions: ['*']
      };
      const mockToken = 'mock_jwt_admin_token_patelchintan0608';
      const storage = rememberMe ? localStorage : sessionStorage;

      localStorage.removeItem('erp_token');
      localStorage.removeItem('erpToken');
      localStorage.removeItem('erp_user');
      localStorage.removeItem('erpAdmin');
      sessionStorage.removeItem('erp_token');
      sessionStorage.removeItem('erpToken');
      sessionStorage.removeItem('erp_user');
      sessionStorage.removeItem('erpAdmin');

      storage.setItem('erp_token', mockToken);
      storage.setItem('erpToken', mockToken);
      storage.setItem('erp_user', JSON.stringify(adminUser));
      storage.setItem('erpAdmin', JSON.stringify(adminUser));

      return {
        success: true,
        token: mockToken,
        user: adminUser
      };
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Invalid email or password.';
    throw new Error(message);
  }
};

// Create employee account call (Admin action)
export const createEmployeeAccountApi = async (employeeData) => {
  try {
    const token = getToken();
    const response = await axios.post(`${API_URL}/create-employee`, employeeData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to create employee account.';
    throw new Error(message);
  }
};

// Logout service call
export const logout = () => {
  const token = getToken();
  if (token) {
    axios.post(`${API_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  }

  localStorage.removeItem('erp_token');
  localStorage.removeItem('erpToken');
  localStorage.removeItem('erp_user');
  localStorage.removeItem('erpAdmin');
  sessionStorage.removeItem('erp_token');
  sessionStorage.removeItem('erpToken');
  sessionStorage.removeItem('erp_user');
  sessionStorage.removeItem('erpAdmin');
};

// Forgot Password service call
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to request password reset.';
    throw new Error(message);
  }
};

// Reset Password service call
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to reset password.';
    throw new Error(message);
  }
};

// Set up Axios interceptor for authorization header
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default {
  login,
  logout,
  getToken,
  getCurrentUser,
  hasPermission,
  hasRole,
  isLoggedIn,
  forgotPassword,
  resetPassword,
  createEmployeeAccountApi
};
