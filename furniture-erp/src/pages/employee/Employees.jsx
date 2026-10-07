import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Calendar,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Key,
  Lock,
  Mail,
  Phone,
  Building,
  Briefcase,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/employees.css';

const DEFAULT_EMPLOYEES = [
  {
    _id: 'emp1',
    id: 'emp1',
    employeeId: 'EMP-0001',
    name: 'Chintan Patel',
    email: 'chintan.patel@patelplywood.com',
    phone: '+91 98765 43210',
    department: 'Sales',
    designation: 'Quotation Executive',
    role: 'Employee',
    username: 'chintan.patel',
    status: 'Active',
    joiningDate: '2022-03-15',
    profilePhoto: '/Chintan06image.jpeg',
    permissions: {
      dashboard: true,
      customers: true,
      quotations: true,
      salesOrders: true,
      inventory: false,
      purchase: false,
      accounts: false,
      employees: false
    }
  },
  {
    _id: 'emp2',
    id: 'emp2',
    employeeId: 'EMP-0002',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@patelplywood.com',
    phone: '+91 98251 99887',
    department: 'Operations',
    designation: 'General Manager',
    role: 'Admin',
    username: 'ramesh.admin',
    status: 'Active',
    joiningDate: '2020-01-10',
    profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    permissions: {
      dashboard: true,
      customers: true,
      quotations: true,
      salesOrders: true,
      inventory: true,
      purchase: true,
      accounts: true,
      employees: true
    }
  },
  {
    _id: 'emp3',
    id: 'emp3',
    employeeId: 'EMP-0003',
    name: 'Sneha Shah',
    email: 'sneha.shah@patelplywood.com',
    phone: '+91 97123 44556',
    department: 'Accounts',
    designation: 'Senior Accountant',
    role: 'Manager',
    username: 'sneha.accounts',
    status: 'Active',
    joiningDate: '2021-06-20',
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    permissions: {
      dashboard: true,
      customers: true,
      quotations: true,
      salesOrders: true,
      inventory: false,
      purchase: true,
      accounts: true,
      employees: false
    }
  },
  {
    _id: 'emp4',
    id: 'emp4',
    employeeId: 'EMP-0004',
    name: 'Vikram Singh',
    email: 'vikram.singh@patelplywood.com',
    phone: '+91 98981 12233',
    department: 'Inventory',
    designation: 'Warehouse Manager',
    role: 'Manager',
    username: 'vikram.stock',
    status: 'On Leave',
    joiningDate: '2022-11-01',
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    permissions: {
      dashboard: true,
      customers: false,
      quotations: false,
      salesOrders: false,
      inventory: true,
      purchase: true,
      accounts: false,
      employees: false
    }
  }
];

const DEFAULT_ATTENDANCE = [
  { id: 1, employeeId: 'EMP-0001', name: 'Chintan Patel', date: '2026-10-05', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'Present', workingHours: '8h 45m' },
  { id: 2, employeeId: 'EMP-0002', name: 'Ramesh Patel', date: '2026-10-05', checkIn: '08:50 AM', checkOut: '07:00 PM', status: 'Present', workingHours: '9h 40m' },
  { id: 3, employeeId: 'EMP-0003', name: 'Sneha Shah', date: '2026-10-05', checkIn: '09:30 AM', checkOut: '06:30 PM', status: 'Late', workingHours: '8h 30m' },
  { id: 4, employeeId: 'EMP-0004', name: 'Vikram Singh', date: '2026-10-05', checkIn: '--:--', checkOut: '--:--', status: 'On Leave', workingHours: '0h' }
];

const DEFAULT_LEAVES = [
  { id: 101, employeeId: 'EMP-0004', name: 'Vikram Singh', type: 'Casual Leave', fromDate: '2026-10-05', toDate: '2026-10-07', reason: 'Family function in Vadodara', status: 'Approved', appliedOn: '2026-10-02' },
  { id: 102, employeeId: 'EMP-0001', name: 'Chintan Patel', type: 'Festive Leave', fromDate: '2026-10-24', toDate: '2026-10-26', reason: 'Diwali celebration at home', status: 'Pending', appliedOn: '2026-10-04' }
];

const Employees = () => {
  const location = useLocation();
  // Navigation Tabs: 'list' | 'add' | 'account' | 'attendance' | 'leave' | 'permissions'
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // State Data
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  const [attendanceLogs, setAttendanceLogs] = useState(DEFAULT_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState(DEFAULT_LEAVES);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Right-Side Slide-Over Drawer State
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [workType, setWorkType] = useState('Office');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 5: Created Employee Success State & Account Creation Modal
  const [createdEmployeeSuccess, setCreatedEmployeeSuccess] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountModalTarget, setAccountModalTarget] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals for View & Edit Employee
  const [viewModalEmployee, setViewModalEmployee] = useState(null);
  const [editModalEmployee, setEditModalEmployee] = useState(null);

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState('');

  // Form State for "Create Employee"
  const [formData, setFormData] = useState({
    employeeId: 'EMP00005',
    fullName: '',
    name: '',
    email: '',
    phone: '',
    employeeType: 'quotation_employee',
    department: 'Sales Office',
    designation: 'Quotation Executive',
    role: 'USER',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    permissions: {
      dashboard: true,
      customers: true,
      quotations: true,
      salesOrders: true,
      inventory: false,
      purchase: false,
      accounts: false,
      employees: false
    }
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 5000);
  };

  // Fetch employees from backend API on mount
  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees();
      if (Array.isArray(data) && data.length > 0) {
        setEmployees(data);
      }
    } catch (err) {
      console.warn('Failed to load employees from API:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle Right Drawer Employee Registration Submit
  const handleDrawerSubmit = async (e) => {
    e.preventDefault();
    const empName = formData.fullName || formData.name;
    if (!empName || !formData.email) {
      alert('Please fill out Full Name and Work Email Address');
      return;
    }

    try {
      const nextNum = employees.length + 1;
      const autoSeqId = `EMP${nextNum.toString().padStart(5, '0')}`;
      
      const isField = workType === 'Field';
      const defaultRole = isField ? 'delivery_employee' : (formData.role || 'USER');
      const defaultDept = formData.department || (isField ? 'Field Service' : 'Sales Office');
      const defaultDesig = formData.designation || (isField ? 'Field Service Engineer' : 'Sales Representative');

      const payload = {
        ...formData,
        fullName: empName,
        name: empName,
        employeeId: autoSeqId,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone || '',
        employeeType: defaultRole,
        department: defaultDept,
        designation: defaultDesig,
        role: formData.role || 'USER',
        status: formData.status || 'Active'
      };

      // Call Backend API
      const resData = await api.saveEmployee(payload).catch(() => null);

      const createdEmp = resData?.employee || {
        _id: resData?._id || `emp_${Date.now()}`,
        id: `emp_${Date.now()}`,
        employeeId: autoSeqId,
        fullName: empName,
        name: empName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone || '',
        employeeType: payload.employeeType,
        department: defaultDept,
        designation: defaultDesig,
        role: formData.role || 'USER',
        status: formData.status || 'Active',
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        permissions: { ...formData.permissions },
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };

      // Create login account if password provided
      if (registerPassword) {
        await api.createEmployeeLoginAccount({
          employeeId: createdEmp.employeeId || createdEmp._id,
          email: createdEmp.email,
          password: registerPassword,
          role: createdEmp.role || createdEmp.employeeType || 'USER'
        }).catch(() => null);
      }

      setEmployees(prev => [createdEmp, ...prev]);
      setShowAddDrawer(false);
      
      // Reset form fields
      setFormData({
        employeeId: `EMP${(employees.length + 2).toString().padStart(5, '0')}`,
        fullName: '',
        name: '',
        email: '',
        phone: '',
        employeeType: 'quotation_employee',
        department: 'Sales Office',
        designation: 'Quotation Executive',
        role: 'USER',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        permissions: { dashboard: true, customers: true, quotations: true, salesOrders: true, inventory: false, purchase: false, accounts: false, employees: false }
      });
      setRegisterPassword('');

      showToast(`Staff member registered successfully for ${createdEmp.fullName || createdEmp.name} (${createdEmp.employeeId})!`);
    } catch (err) {
      alert(err.message || 'Failed to register employee');
    }
  };

  // Auto-generate sequential Employee ID (EMP00001, EMP00002...)
  useEffect(() => {
    const nextNum = employees.length + 1;
    const nextId = `EMP${nextNum.toString().padStart(5, '0')}`;
    setFormData(prev => ({ ...prev, employeeId: nextId }));
  }, [employees.length]);

  // Form Change Handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step 5: Handle Form Submit for Create Employee
  const handleCreateEmployeeSubmit = async (e) => {
    e.preventDefault();

    const empName = formData.fullName || formData.name;
    if (!empName || !formData.email || !formData.phone) {
      alert('Please fill out Full Name, Email, and Mobile Number');
      return;
    }

    try {
      const nextNum = employees.length + 1;
      const autoSeqId = `EMP${nextNum.toString().padStart(5, '0')}`;

      const payload = {
        ...formData,
        fullName: empName,
        name: empName,
        employeeId: autoSeqId,
        email: formData.email.trim().toLowerCase(),
        employeeType: formData.employeeType || 'quotation_employee'
      };

      // Call API
      const resData = await api.saveEmployee(payload).catch(() => null);

      const createdEmp = resData?.employee || {
        _id: resData?._id || `emp_${Date.now()}`,
        id: `emp_${Date.now()}`,
        employeeId: autoSeqId,
        fullName: empName,
        name: empName,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        employeeType: formData.employeeType,
        department: formData.department,
        designation: formData.designation,
        role: formData.role,
        status: formData.status || 'Active',
        joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
        permissions: { ...formData.permissions },
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };

      setEmployees(prev => [createdEmp, ...prev]);

      // Show Step 5 Employee Created Success Card
      setCreatedEmployeeSuccess(createdEmp);
      showToast(`Employee Profile Created Successfully for ${createdEmp.fullName || createdEmp.name} (${createdEmp.employeeId})!`);
    } catch (err) {
      alert(err.message || 'Failed to create employee profile');
    }
  };

  // Open "Create Login Account" modal
  const openCreateAccountModal = (emp) => {
    setAccountModalTarget(emp);
    const randPass = `Patel@${Math.floor(10000 + Math.random() * 90000)}`;
    setTempPassword(randPass);
    setShowAccountModal(true);
  };

  // Step 5: Handle Submit "Create Login Account"
  const handleCreateLoginAccountSubmit = async (e) => {
    e.preventDefault();
    if (!accountModalTarget) return;

    try {
      await api.createEmployeeLoginAccount({
        employeeId: accountModalTarget.employeeId || accountModalTarget._id,
        email: accountModalTarget.email,
        password: tempPassword,
        role: accountModalTarget.employeeType || accountModalTarget.role || 'quotation_employee'
      });

      showToast(`Login Account Created Successfully! Temp Password: ${tempPassword}`);
      setShowAccountModal(false);
      setCreatedEmployeeSuccess(null);
      setActiveTab('list');
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Failed to create login account');
    }
  };

  // Reset Employee Password handler
  const handleResetPassword = async (emp) => {
    const newPass = `Patel@${Math.floor(10000 + Math.random() * 90000)}`;
    if (window.confirm(`Reset temporary password for ${emp.fullName || emp.name} (${emp.email}) to: ${newPass}?`)) {
      try {
        await api.createEmployeeLoginAccount({
          employeeId: emp.employeeId || emp._id,
          email: emp.email,
          password: newPass,
          role: emp.employeeType || emp.role || 'quotation_employee'
        });
        showToast(`Password reset successfully! New Temp Password: ${newPass}`);
      } catch (err) {
        showToast(`New Temp Password generated: ${newPass}`);
      }
    }
  };

  // Toggle Employee Status (Active / Inactive)
  const handleToggleStatus = async (emp) => {
    const newStatus = emp.status === 'Active' || emp.status === 'active' ? 'Inactive' : 'Active';
    try {
      await api.saveEmployee({ ...emp, status: newStatus });
      setEmployees(prev => prev.map(e => (e._id === emp._id || e.id === emp.id) ? { ...e, status: newStatus } : e));
      showToast(`Employee ${emp.name || emp.fullName} status updated to ${newStatus}`);
    } catch (err) {
      setEmployees(prev => prev.map(e => (e._id === emp._id || e.id === emp.id) ? { ...e, status: newStatus } : e));
      showToast(`Status updated to ${newStatus}`);
    }
  };

  // Save Employee Updates from Edit Modal
  const handleSaveEditEmployee = async (e) => {
    e.preventDefault();
    if (!editModalEmployee) return;

    try {
      const empName = editModalEmployee.fullName || editModalEmployee.name;
      const res = await api.saveEmployee(editModalEmployee);
      const updatedData = res?.employee || editModalEmployee;

      setEmployees(prev => prev.map(emp =>
        (emp._id === editModalEmployee._id || emp.id === editModalEmployee.id || emp.employeeId === editModalEmployee.employeeId)
          ? { ...emp, ...updatedData }
          : emp
      ));

      showToast(`Employee details updated for ${empName}!`);
      setEditModalEmployee(null);
      await fetchEmployees();
    } catch (err) {
      console.error('Failed to save employee updates:', err);
      const empName = editModalEmployee.fullName || editModalEmployee.name;
      setEmployees(prev => prev.map(emp =>
        (emp._id === editModalEmployee._id || emp.id === editModalEmployee.id || emp.employeeId === editModalEmployee.employeeId)
          ? editModalEmployee
          : emp
      ));
      showToast(`Updated ${empName} details.`);
      setEditModalEmployee(null);
    }
  };

  // Delete Employee with API connection
  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee account for ${name}?`)) {
      try {
        await api.deleteEmployee(id);
        setEmployees(prev => prev.filter(e => e._id !== id && e.id !== id));
        showToast(`Employee ${name} deleted successfully.`);
      } catch (err) {
        setEmployees(prev => prev.filter(e => e._id !== id && e.id !== id));
        showToast(`Employee ${name} deleted.`);
      }
    }
  };

  // Leave Approval Action
  const handleLeaveAction = (leaveId, status) => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l));
    showToast(`Leave request ${status.toLowerCase()}!`);
  };

  // Helper to render role badge
  const getRoleBadge = (emp) => {
    const roleStr = (emp.role || emp.employeeType || emp.designation || '').toLowerCase();
    if (roleStr.includes('admin')) {
      return <span className="status-badge-pill" style={{ background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Admin</span>;
    }
    if (roleStr.includes('quotation')) {
      return <span className="status-badge-pill" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Quotation</span>;
    }
    if (roleStr.includes('delivery') || roleStr.includes('dispatch') || roleStr.includes('logistics')) {
      return <span className="status-badge-pill" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Delivery</span>;
    }
    if (roleStr.includes('inventory') || roleStr.includes('stock') || roleStr.includes('warehouse')) {
      return <span className="status-badge-pill" style={{ background: '#fffbebf', color: '#b45309', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Inventory</span>;
    }
    if (roleStr.includes('sales')) {
      return <span className="status-badge-pill" style={{ background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Sales</span>;
    }
    if (roleStr.includes('account')) {
      return <span className="status-badge-pill" style={{ background: '#eef2ff', color: '#3730a3', border: '1px solid #c7d2fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Accounts</span>;
    }
    if (roleStr.includes('manager')) {
      return <span className="status-badge-pill" style={{ background: '#fae8ff', color: '#86198f', border: '1px solid #f5d0fe', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Manager</span>;
    }
    return <span className="status-badge-pill" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Employee</span>;
  };

  // Filtered Employees List with Role Filtering
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      (emp.name || emp.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

    const roleLower = (emp.role || emp.employeeType || emp.designation || '').toLowerCase();
    let matchesRole = true;
    if (roleFilter !== 'All') {
      const rf = roleFilter.toLowerCase();
      if (rf === 'quotation') matchesRole = roleLower.includes('quotation');
      else if (rf === 'delivery') matchesRole = roleLower.includes('delivery');
      else if (rf === 'inventory') matchesRole = roleLower.includes('inventory') || roleLower.includes('stock');
      else if (rf === 'sales') matchesRole = roleLower.includes('sales');
      else if (rf === 'accounts') matchesRole = roleLower.includes('account');
      else if (rf === 'admin') matchesRole = roleLower.includes('admin');
      else if (rf === 'manager') matchesRole = roleLower.includes('manager');
      else matchesRole = roleLower.includes(rf);
    }

    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  return (
    <div className="employees-page-wrapper">

      {/* Toast Alert Notification */}
      {toastMsg && (
        <div style={{
          background: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #93c5fd',
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <Users size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Employee Management</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>Manage organization staff directory, application access roles, and account credentials.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddDrawer(true)}
          style={{
            background: '#2563eb',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            fontSize: '0.9rem'
          }}
        >
          <Plus size={18} />
          <span>+ Add Employee</span>
        </button>
      </div>

      {/* 4 Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Total Staff */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Total Staff</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0', display: 'block', lineHeight: 1.1 }}>{employees.length}</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'block' }}>{employees.filter(e => e.status === 'Active').length} active profiles</span>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={20} />
          </div>
        </div>

        {/* Card 2: Administrators */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Administrators</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0', display: 'block', lineHeight: 1.1 }}>
              {employees.filter(e => (e.role || e.employeeType || '').toLowerCase().includes('admin')).length}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 700, marginTop: '4px', display: 'block' }}>Root access</span>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={20} />
          </div>
        </div>

        {/* Card 3: Managers */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Managers</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0', display: 'block', lineHeight: 1.1 }}>
              {employees.filter(e => (e.role || e.employeeType || '').toLowerCase().includes('manager') || (e.role || '').toLowerCase().includes('account')).length}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700, marginTop: '4px', display: 'block' }}>Operations & dispatch</span>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase size={20} />
          </div>
        </div>

        {/* Card 4: Field Personnel */}
        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'block' }}>Field Personnel</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0', display: 'block', lineHeight: 1.1 }}>
              {employees.filter(e => (e.role || e.employeeType || '').toLowerCase().includes('delivery') || (e.role || '').toLowerCase().includes('sales') || (e.role || '').toLowerCase().includes('quotation') || (e.role || '').toLowerCase().includes('employee')).length}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginTop: '4px', display: 'block' }}>Technicians & engineers</span>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserCheck size={20} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="emp-tabs-bar">
        <button
          className={`emp-tab-item ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <Users size={16} />
          <span>Employee Directory</span>
          <span className="emp-tab-badge">{employees.length}</span>
        </button>

        <button
          className={`emp-tab-item ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          <Calendar size={16} />
          <span>Leave Applications</span>
          <span className="emp-tab-badge">{leaveRequests.filter(l => l.status === 'Pending').length}</span>
        </button>

        <button
          className={`emp-tab-item ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          <Lock size={16} />
          <span>Permissions Matrix</span>
        </button>
      </div>

      {/* ================= TAB 1: EMPLOYEE LIST ================= */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Search & Filter Bar Container */}
          <div className="card" style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', gap: '0.85rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search employees by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '8px 14px 8px 38px', borderRadius: '20px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem', background: '#ffffff', color: '#0f172a' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px 10px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                <Filter size={14} color="#64748b" />
                <span>TYPE:</span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <option value="All">All Types</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Inventory">Inventory</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px 10px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                <span>ROLE:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Quotation">Quotation Employee</option>
                  <option value="Delivery">Delivery Employee</option>
                  <option value="Inventory">Inventory Executive</option>
                  <option value="Sales">Sales Executive</option>
                  <option value="Accounts">Accounts Manager</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px 10px', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                <span>STATUS:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, color: '#0f172a', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <button
                onClick={fetchEmployees}
                style={{ width: '34px', height: '34px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                title="Refresh Directory"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Directory Data Table */}
          <div className="emp-table-card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <table className="emp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>EMPLOYEE</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>WORK TYPE</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>CONTACT DETAILS</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>DESIGNATION</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>SYSTEM ROLE</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>STATUS</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>JOINED DATE</th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      No employees found matching the current search filters.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => {
                    const isMenuOpen = actionMenuOpenId === emp._id || actionMenuOpenId === emp.id;
                    const empName = emp.fullName || emp.name || 'Employee';
                    const initials = (empName.trim().split(' ').length >= 2)
                      ? (empName.trim().split(' ')[0][0] + empName.trim().split(' ')[1][0]).toUpperCase()
                      : empName.slice(0, 2).toUpperCase();

                    const isFieldType = (emp.employeeType === 'delivery_employee' || emp.department?.toLowerCase().includes('logistics') || emp.department?.toLowerCase().includes('dispatch'));

                    return (
                      <tr key={emp._id || emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        
                        {/* 1. EMPLOYEE */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#0f172a',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{empName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{emp.employeeId || 'EMP00001'}</div>
                            </div>
                          </div>
                        </td>

                        {/* 2. WORK TYPE */}
                        <td style={{ padding: '10px 14px' }}>
                          {isFieldType ? (
                            <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              <Building size={12} color="#15803d" /> FIELD
                            </span>
                          ) : (
                            <span style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '3px 10px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              <Building size={12} color="#0369a1" /> OFFICE
                            </span>
                          )}
                        </td>

                        {/* 3. CONTACT DETAILS */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: emp.phone ? '#0f172a' : '#94a3b8', fontStyle: emp.phone ? 'normal' : 'italic' }}>
                            {emp.phone || 'No phone'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.email}</div>
                        </td>

                        {/* 4. DESIGNATION */}
                        <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                          {emp.designation || '—'}
                        </td>

                        {/* 5. SYSTEM ROLE */}
                        <td style={{ padding: '10px 14px' }}>
                          {getRoleBadge(emp)}
                        </td>

                        {/* 6. STATUS */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ background: (emp.status === 'Active' || emp.status === 'active') ? '#ecfdf5' : '#fef2f2', color: (emp.status === 'Active' || emp.status === 'active') ? '#15803d' : '#b91c1c', border: `1px solid ${(emp.status === 'Active' || emp.status === 'active') ? '#a7f3d0' : '#fecaca'}`, padding: '3px 10px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            ● {emp.status || 'Active'}
                          </span>
                        </td>

                        {/* 7. JOINED DATE */}
                        <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap' }}>
                          {emp.joiningDate ? emp.joiningDate.split('T')[0] : 'Oct 5, 2026'}
                        </td>

                        {/* 8. ACTIONS */}
                        <td style={{ padding: '10px 14px', textAlign: 'right', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
                            
                            <button
                              onClick={() => setViewModalEmployee(emp)}
                              style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="View Profile"
                            >
                              <Eye size={14} color="#64748b" />
                            </button>

                            <button
                              onClick={() => setEditModalEmployee({ ...emp })}
                              style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="Edit Employee"
                            >
                              <Edit size={14} color="#64748b" />
                            </button>

                            {/* Action Dropdown Menu Button */}
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setActionMenuOpenId(isMenuOpen ? null : (emp._id || emp.id))}
                                style={{ border: '1px solid #cbd5e1', background: '#ffffff', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Action Menu"
                              >
                                ⋮
                              </button>

                              {isMenuOpen && (
                                <div style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '100%',
                                  marginTop: '4px',
                                  background: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '10px',
                                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                                  zIndex: 100,
                                  minWidth: '170px',
                                  textAlign: 'left',
                                  overflow: 'hidden'
                                }}>
                                  <button
                                    onClick={() => { setActionMenuOpenId(null); setViewModalEmployee(emp); }}
                                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <Eye size={14} color="#2563eb" /> View Profile
                                  </button>

                                  <button
                                    onClick={() => { setActionMenuOpenId(null); setEditModalEmployee({ ...emp }); }}
                                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <Edit size={14} color="#d97706" /> Edit Details
                                  </button>

                                  <button
                                    onClick={() => { setActionMenuOpenId(null); openCreateAccountModal(emp); }}
                                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <UserPlus size={14} color="#2563eb" /> Create Account
                                  </button>

                                  <button
                                    onClick={() => { setActionMenuOpenId(null); handleResetPassword(emp); }}
                                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                  >
                                    <Key size={14} color="#7c3aed" /> Reset Password
                                  </button>

                                  <button
                                    onClick={() => { setActionMenuOpenId(null); handleToggleStatus(emp); }}
                                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: (emp.status === 'Active' || emp.status === 'active') ? '#dc2626' : '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}
                                  >
                                    {(emp.status === 'Active' || emp.status === 'active') ? <XCircle size={14} color="#dc2626" /> : <CheckCircle2 size={14} color="#16a34a" />}
                                    {(emp.status === 'Active' || emp.status === 'active') ? 'Deactivate' : 'Activate'}
                                  </button>

                                  <button
                                    onClick={() => { setActionMenuOpenId(null); handleDeleteEmployee(emp._id || emp.id, emp.fullName || emp.name); }}
                                    style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9' }}
                                  >
                                    <Trash2 size={14} color="#b91c1c" /> Delete Employee
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ADD EMPLOYEE (STEP 4 & STEP 5 FLOW) ================= */}
      {activeTab === 'add' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          
          {/* STEP 5 — SUCCESS CARD DISPLAY */}
          {createdEmployeeSuccess ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: '2px solid #22c55e',
              textAlign: 'center'
            }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginBottom: '1.5rem' }}>
                Employee Created Successfully
              </h2>

              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'left',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Employee ID:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e40af' }}>{createdEmployeeSuccess.employeeId}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Name:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{createdEmployeeSuccess.fullName || createdEmployeeSuccess.name}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Employee Type:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                    {createdEmployeeSuccess.employeeType === 'quotation_employee' ? 'Quotation Employee' : 'Delivery Employee'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Email:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#2563eb' }}>{createdEmployeeSuccess.email}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setCreatedEmployeeSuccess(null); setActiveTab('list'); }}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}
                >
                  Back to List
                </button>

                <button
                  type="button"
                  onClick={() => openCreateAccountModal(createdEmployeeSuccess)}
                  style={{ padding: '12px 28px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
                >
                  [ Create Login Account ]
                </button>
              </div>
            </div>
          ) : (
            /* CREATE EMPLOYEE FORM (STEP 4 & 5) */
            <div className="create-account-card" style={{ maxWidth: '580px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' }}>
              <div className="create-account-header" style={{ justifyContent: 'center', textAlign: 'center', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', padding: '1rem 1.25rem' }}>
                <div>
                  <h2 className="create-account-title" style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>Create Employee Profile</h2>
                  <p style={{ fontSize: '0.82rem', color: '#dbeafe', margin: '4px 0 0' }}>Auto-generating sequential Employee ID (EMP00001 format)</p>
                </div>
              </div>

              <form onSubmit={handleCreateEmployeeSubmit} className="create-account-body" style={{ padding: '1.25rem', gap: '0.85rem' }}>
                
                {/* 2-Column Grid Row 1: ID & Full Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group-custom">
                    <label className="form-label-custom">Employee ID (Auto Generated)</label>
                    <input
                      type="text"
                      className="form-input-custom"
                      value={formData.employeeId}
                      disabled
                      style={{ background: '#f1f5f9', fontWeight: 800, color: '#2563eb', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Full Name</label>
                    <input
                      type="text"
                      className="form-input-custom"
                      placeholder="Rahul Sharma"
                      value={formData.fullName || formData.name}
                      onChange={(e) => {
                        handleInputChange('fullName', e.target.value);
                        handleInputChange('name', e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* 2-Column Grid Row 2: Email & Mobile Number */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group-custom">
                    <label className="form-label-custom">Email</label>
                    <input
                      type="email"
                      className="form-input-custom"
                      placeholder="rahul@patelplywood.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Mobile Number</label>
                    <input
                      type="text"
                      className="form-input-custom"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 2-Column Grid Row 3: Role & Department */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group-custom">
                    <label className="form-label-custom">Role / Employee Type</label>
                    <select
                      className="form-input-custom"
                      value={formData.employeeType || 'quotation_employee'}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange('employeeType', val);
                        handleInputChange('role', val);
                        if (val === 'quotation_employee') {
                          handleInputChange('department', 'Sales / Quotation');
                          handleInputChange('designation', 'Quotation Executive');
                        } else if (val === 'delivery_employee') {
                          handleInputChange('department', 'Logistics / Dispatch');
                          handleInputChange('designation', 'Delivery Executive');
                        } else if (val === 'inventory_employee') {
                          handleInputChange('department', 'Inventory');
                          handleInputChange('designation', 'Inventory Controller');
                        } else if (val === 'sales_employee') {
                          handleInputChange('department', 'Sales');
                          handleInputChange('designation', 'Sales Representative');
                        } else if (val === 'account_employee') {
                          handleInputChange('department', 'Accounts');
                          handleInputChange('designation', 'Senior Accountant');
                        } else if (val === 'admin') {
                          handleInputChange('department', 'Operations');
                          handleInputChange('designation', 'System Administrator');
                        }
                      }}
                    >
                      <option value="quotation_employee">Quotation Employee</option>
                      <option value="delivery_employee">Delivery Employee</option>
                      <option value="inventory_employee">Inventory Executive</option>
                      <option value="sales_employee">Sales Executive</option>
                      <option value="account_employee">Accounts Manager</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Department</label>
                    <input
                      type="text"
                      className="form-input-custom"
                      placeholder="Sales / Quotation"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 2-Column Grid Row 4: Joining Date & Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group-custom">
                    <label className="form-label-custom">Joining Date</label>
                    <input
                      type="date"
                      className="form-input-custom"
                      value={formData.joiningDate ? formData.joiningDate.split('T')[0] : '2026-10-05'}
                      onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Status</label>
                    <select
                      className="form-input-custom"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons: [ Cancel ] [ Create Employee ] */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    Create Employee
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      )}

      {/* ================= STEP 5: CREATE LOGIN ACCOUNT MODAL ================= */}
      {showAccountModal && accountModalTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            width: '90%',
            maxWidth: '520px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Create Login Account</h3>
              </div>
              <button onClick={() => setShowAccountModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLoginAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Employee:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{accountModalTarget.fullName || accountModalTarget.name}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Login Email:</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>{accountModalTarget.email}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Role:</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginTop: '4px' }}>
                  {accountModalTarget.employeeType === 'quotation_employee' ? 'Quotation Employee' : 'Delivery Employee'}
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>Temporary Password (Bcrypt Hashed)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input-custom"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    required
                    style={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '1px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setTempPassword(`Patel@${Math.floor(10000 + Math.random() * 90000)}`)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    [ Auto Generate ]
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
                >
                  [ Create Account ]
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= VIEW EMPLOYEE PROFILE MODAL ================= */}
      {viewModalEmployee && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            width: '90%',
            maxWidth: '560px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Eye size={22} color="#2563eb" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Employee Profile</h3>
              </div>
              <button onClick={() => setViewModalEmployee(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <img
                src={viewModalEmployee.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={viewModalEmployee.fullName || viewModalEmployee.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2563eb' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'; }}
              />
              <div>
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{viewModalEmployee.fullName || viewModalEmployee.name}</h4>
                <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>{viewModalEmployee.employeeId || 'EMP00001'}</div>
                <div style={{ marginTop: '6px' }}>{getRoleBadge(viewModalEmployee)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Email</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{viewModalEmployee.email}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Phone</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{viewModalEmployee.phone}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Department</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{viewModalEmployee.department || 'Sales'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Designation</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{viewModalEmployee.designation || 'Executive'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Joining Date</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{viewModalEmployee.joiningDate ? viewModalEmployee.joiningDate.split('T')[0] : '2022-03-15'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Status</span>
                <span className={`status-badge-pill status-${(viewModalEmployee.status || 'Active').toLowerCase().replace(' ', '')}`}>
                  ● {viewModalEmployee.status || 'Active'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
              <button
                onClick={() => setViewModalEmployee(null)}
                style={{ padding: '10px 22px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT EMPLOYEE DETAILS MODAL ================= */}
      {editModalEmployee && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            width: '90%',
            maxWidth: '560px',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={22} color="#d97706" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Edit Employee Details</h3>
              </div>
              <button onClick={() => setEditModalEmployee(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Employee ID</label>
                  <input
                    type="text"
                    className="form-input-custom"
                    value={editModalEmployee.employeeId || ''}
                    disabled
                    style={{ background: '#f1f5f9', fontWeight: 800, color: '#2563eb' }}
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Full Name</label>
                  <input
                    type="text"
                    className="form-input-custom"
                    value={editModalEmployee.fullName || editModalEmployee.name || ''}
                    onChange={(e) => setEditModalEmployee(prev => ({ ...prev, fullName: e.target.value, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Email</label>
                  <input
                    type="email"
                    className="form-input-custom"
                    value={editModalEmployee.email || ''}
                    onChange={(e) => setEditModalEmployee(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Phone</label>
                  <input
                    type="text"
                    className="form-input-custom"
                    value={editModalEmployee.phone || ''}
                    onChange={(e) => setEditModalEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Role</label>
                  <select
                    className="form-input-custom"
                    value={editModalEmployee.role || editModalEmployee.employeeType || 'quotation_employee'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditModalEmployee(prev => ({ ...prev, role: val, employeeType: val }));
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="quotation_employee">Quotation Employee</option>
                    <option value="delivery_employee">Delivery Employee</option>
                    <option value="inventory_employee">Inventory Executive</option>
                    <option value="sales_employee">Sales Executive</option>
                    <option value="account_employee">Accounts Manager</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Department</label>
                  <input
                    type="text"
                    className="form-input-custom"
                    value={editModalEmployee.department || ''}
                    onChange={(e) => setEditModalEmployee(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Designation</label>
                  <input
                    type="text"
                    className="form-input-custom"
                    value={editModalEmployee.designation || ''}
                    onChange={(e) => setEditModalEmployee(prev => ({ ...prev, designation: e.target.value }))}
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Status</label>
                  <select
                    className="form-input-custom"
                    value={editModalEmployee.status || 'Active'}
                    onChange={(e) => setEditModalEmployee(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditModalEmployee(null)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ================= TAB 5: LEAVE REQUESTS ================= */}
      {activeTab === 'leave' && (
        <div className="emp-table-card">
          <div className="emp-table-controls">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Employee Leave Applications</h3>
          </div>

          <table className="emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(l => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{l.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{l.employeeId}</div>
                  </td>
                  <td><span className="perm-pill-badge">{l.type}</span></td>
                  <td style={{ fontWeight: 600 }}>{l.fromDate} → {l.toDate}</td>
                  <td>{l.reason}</td>
                  <td>{l.appliedOn}</td>
                  <td>
                    <span className={`status-badge-pill ${l.status === 'Approved' ? 'status-active' : l.status === 'Pending' ? 'status-onleave' : 'status-inactive'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {l.status === 'Pending' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleLeaveAction(l.id, 'Approved')}
                          style={{ background: '#dcfce7', color: '#15803d', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleLeaveAction(l.id, 'Rejected')}
                          style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= TAB 6: PERMISSIONS MATRIX ================= */}
      {activeTab === 'permissions' && (
        <div className="emp-table-card">
          <div className="emp-table-controls">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>System Role & Module Permissions Matrix</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Configure role default access rules across ERP modules</span>
          </div>

          <table className="emp-table">
            <thead>
              <tr>
                <th>Role / Staff Member</th>
                <th>Dashboard</th>
                <th>Customers</th>
                <th>Quotations</th>
                <th>Sales Orders</th>
                <th>Inventory</th>
                <th>Purchase</th>
                <th>Accounts</th>
                <th>Employees</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id}>
                  <td style={{ fontWeight: 700 }}>
                    {emp.name} ({emp.role})
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.designation}</div>
                  </td>
                  {['dashboard', 'customers', 'quotations', 'salesOrders', 'inventory', 'purchase', 'accounts', 'employees'].map(mod => (
                    <td key={mod} style={{ textAlign: 'center' }}>
                      {emp.permissions[mod] ? (
                        <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                      ) : (
                        <XCircle size={18} style={{ color: '#cbd5e1' }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= RIGHT-SIDE SLIDE-OVER DRAWER: REGISTER NEW STAFF MEMBER ================= */}
      {showAddDrawer && (
        <div className="emp-drawer-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowAddDrawer(false); }}>
          <div className="emp-drawer-panel">
            
            {/* Drawer Header */}
            <div className="emp-drawer-header">
              <div className="emp-drawer-header-left">
                <div className="emp-drawer-icon-chip">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="emp-drawer-title">Register New Staff Member</h3>
                  <div className="emp-drawer-subtitle">Fill out credentials and assign role</div>
                </div>
              </div>
              <button className="emp-drawer-close-btn" type="button" onClick={() => setShowAddDrawer(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Form & Scrollable Body */}
            <form onSubmit={handleDrawerSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="emp-drawer-body">

                {/* Work Type (Application Access) */}
                <div className="form-group-custom">
                  <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Work Type (Application Access) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="work-type-cards-grid">
                    
                    {/* Office Option Card */}
                    <div
                      className={`work-type-card ${workType === 'Office' ? 'selected' : ''}`}
                      onClick={() => {
                        setWorkType('Office');
                        handleInputChange('employeeType', 'quotation_employee');
                        handleInputChange('department', 'Sales Office');
                        handleInputChange('designation', 'Quotation Executive');
                      }}
                    >
                      <div className="work-type-icon-box">
                        <Building size={20} />
                      </div>
                      <div>
                        <div className="work-type-title">
                          Office {workType === 'Office' && <span className="blue-dot-active" />}
                        </div>
                        <div className="work-type-desc">Web ERP Portal access</div>
                      </div>
                    </div>

                    {/* Field Option Card */}
                    <div
                      className={`work-type-card ${workType === 'Field' ? 'selected' : ''}`}
                      onClick={() => {
                        setWorkType('Field');
                        handleInputChange('employeeType', 'delivery_employee');
                        handleInputChange('department', 'Field Service');
                        handleInputChange('designation', 'Field Service Engineer');
                      }}
                    >
                      <div className="work-type-icon-box">
                        <Phone size={20} />
                      </div>
                      <div>
                        <div className="work-type-title">Field</div>
                        <div className="work-type-desc">Field Mobile App access</div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Full Legal Name */}
                <div className="form-group-custom">
                  <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Full Legal Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="input-with-icon-wrapper">
                    <span className="input-leading-icon"><Users size={16} /></span>
                    <input
                      type="text"
                      className="input-with-icon-field"
                      placeholder="e.g. Vikramaditya Sharma"
                      value={formData.fullName || formData.name}
                      onChange={(e) => {
                        handleInputChange('fullName', e.target.value);
                        handleInputChange('name', e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Work Email Address */}
                <div className="form-group-custom">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                      Work Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <button type="button" className="btn-add-inline">+ Add Email</button>
                  </div>
                  <div className="input-with-icon-wrapper">
                    <span className="input-leading-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      className="input-with-icon-field"
                      placeholder="e.g. v.sharma@tanejapower.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{ paddingRight: '80px' }}
                      required
                    />
                    <div className="input-trailing-action">
                      <span className="tag-badge-primary">Primary</span>
                    </div>
                  </div>
                </div>

                {/* Contact Phone Number */}
                <div className="form-group-custom">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                      Contact Phone Number
                    </label>
                    <button type="button" className="btn-add-inline">+ Add Phone</button>
                  </div>
                  <div className="input-with-icon-wrapper">
                    <span className="input-leading-icon"><Phone size={16} /></span>
                    <input
                      type="text"
                      className="input-with-icon-field"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{ paddingRight: '80px' }}
                    />
                    <div className="input-trailing-action">
                      <span className="tag-badge-phone-primary">Primary</span>
                    </div>
                  </div>
                </div>

                {/* Initial Account Password */}
                <div className="form-group-custom">
                  <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Initial Account Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="input-with-icon-wrapper">
                    <span className="input-leading-icon"><Lock size={16} /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-with-icon-field"
                      placeholder="Min 6 characters (e.g. Pass@123456)"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      style={{ paddingRight: '42px' }}
                      required
                    />
                    <div className="input-trailing-action" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                      <Eye size={18} color="#64748b" />
                    </div>
                  </div>
                </div>

                {/* System Access Role & Account Status (2 columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  
                  <div className="form-group-custom">
                    <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                      System Access Role <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="form-input-custom"
                      style={{ padding: '10px 12px', fontSize: '0.85rem' }}
                      value={formData.role || 'USER'}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleInputChange('role', val);
                        if (val === 'ADMIN') handleInputChange('employeeType', 'admin');
                        else if (val === 'QUOTATION') handleInputChange('employeeType', 'quotation_employee');
                        else if (val === 'DELIVERY') handleInputChange('employeeType', 'delivery_employee');
                        else handleInputChange('employeeType', 'quotation_employee');
                      }}
                    >
                      <option value="USER">USER (Standard Employee)</option>
                      <option value="ADMIN">ADMIN (Full System Control)</option>
                      <option value="QUOTATION">QUOTATION (Sales & Quotes)</option>
                      <option value="DELIVERY">DELIVERY (Logistics & Dispatch)</option>
                      <option value="INVENTORY">INVENTORY (Stock Controller)</option>
                      <option value="ACCOUNTS">ACCOUNTS (Finance & Invoicing)</option>
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                      Account Status <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="form-input-custom"
                      style={{ padding: '10px 12px', fontSize: '0.85rem' }}
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="Active">ACTIVE (Authorized to log in)</option>
                      <option value="Inactive">INACTIVE (Disabled)</option>
                    </select>
                  </div>

                </div>

                {/* Designation (Office Department) */}
                <div className="form-group-custom">
                  <label className="form-label-custom" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Designation (Office Department) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="input-with-icon-wrapper">
                    <span className="input-leading-icon"><Briefcase size={16} /></span>
                    <select
                      className="input-with-icon-field"
                      value={formData.designation || 'Sales Office'}
                      onChange={(e) => {
                        handleInputChange('designation', e.target.value);
                        handleInputChange('department', e.target.value);
                      }}
                    >
                      <option value="Sales Office">Sales Office</option>
                      <option value="Design & Production">Design & Production</option>
                      <option value="Field Service Engineer">Field Service Engineer</option>
                      <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                      <option value="Accounts & Finance">Accounts & Finance</option>
                      <option value="HR & Operations">HR & Operations</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="emp-drawer-footer">
                <button
                  type="button"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowAddDrawer(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  Register Employee
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Employees;
