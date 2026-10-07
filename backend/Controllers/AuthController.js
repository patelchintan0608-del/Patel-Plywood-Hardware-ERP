import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../Models/User.js';
import Employee from '../Models/Employee.js';
import { getPermissionsForRole } from '../config/permissions.js';

// Helper to generate JWT token with role and permissions
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions || getPermissionsForRole(user.role),
    },
    process.env.JWT_SECRET || 'furniture_erp_secret_key_2026',
    { expiresIn: '24h' }
  );
};

// @desc    Register new admin user
// @route   POST /api/auth/register
// @access  Public
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const assignedRole = role || 'admin';

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const userPermissions = getPermissionsForRole(assignedRole);

    const newUser = new User({
      name: name.trim(),
      email: trimmedEmail,
      password,
      role: assignedRole,
      permissions: userPermissions,
      status: 'active',
    });

    await newUser.save();

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Auth user / employee & get token
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Look up user in User collection
    let account = await User.findOne({ email: trimmedEmail });
    let isEmployeeCollection = false;

    // 2. Fallback to Employee collection
    if (!account) {
      account = await Employee.findOne({
        $or: [{ email: trimmedEmail }, { username: trimmedEmail }, { employeeId: email.trim() }],
      });
      isEmployeeCollection = true;
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Account not found.',
      });
    }

    // 3. Check account status
    const statusVal = account.status ? account.status.toLowerCase() : 'active';
    if (statusVal === 'deactivated' || statusVal === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive or deactivated. Please contact Administrator.',
      });
    }

    // 4. Verify password with bcrypt
    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    // 5. Determine Role & Permissions
    let role = account.role || (isEmployeeCollection ? 'quotation_employee' : 'admin');
    let permissions = account.permissions;

    if (
      trimmedEmail === 'patelchintan0608@gmail.com' ||
      trimmedEmail === 'admin@patelplywood.com' ||
      role.toLowerCase().includes('admin') ||
      role.toLowerCase().includes('administrator')
    ) {
      role = 'admin';
      permissions = ['*'];
    } else if (!permissions || (Array.isArray(permissions) && permissions.length === 0)) {
      permissions = getPermissionsForRole(role);
    }

    // Update last login
    account.lastLogin = new Date();
    await account.save().catch(() => null);

    // 6. Generate Token
    const token = generateToken({
      _id: account._id,
      email: account.email,
      role,
      name: account.name || 'ERP Admin',
      permissions,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: account._id,
        employeeId: account.employeeId || `EMP-${account._id.toString().slice(-5)}`,
        name: account.name || account.fullName || 'ERP User',
        email: account.email,
        role: role,
        department: account.department || 'Sales',
        permissions: permissions,
        avatar: account.avatar || account.photo || account.profilePhoto || (trimmedEmail === 'rp2568@gmail.com' ? '/RP_profile.jpg' : ''),
        status: account.status || 'active',
        lastLogin: account.lastLogin,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
    });
  }
};

// @desc    Admin Creates Employee Account
// @route   POST /api/auth/create-employee
// @access  Private/Admin
export const createEmployeeAccount = async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId, mobile } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this email address already exists.',
      });
    }

    // Determine auto-generated permissions for the selected role
    const permissions = getPermissionsForRole(role);

    // Generate unique employee ID if not supplied
    let finalEmpId = employeeId;
    if (!finalEmpId) {
      const count = await User.countDocuments();
      finalEmpId = `EMP${String(count + 1).padStart(5, '0')}`;
    }

    // Create User record
    const newUser = new User({
      employeeId: finalEmpId,
      name: name.trim(),
      email: trimmedEmail,
      password: password, // Will be hashed by User pre-save hook
      role: role,
      department: department || '',
      permissions: permissions,
      status: 'active',
    });

    await newUser.save();

    // Also sync to Employee collection so employee list is complete
    const existingEmp = await Employee.findOne({ email: trimmedEmail });
    if (!existingEmp) {
      const newEmp = new Employee({
        employeeId: finalEmpId,
        name: name.trim(),
        email: trimmedEmail,
        password: password,
        phone: mobile || '9876543210',
        role: role,
        department: department || (role.includes('quotation') ? 'Sales' : role.includes('delivery') ? 'Logistics' : 'General'),
        designation: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        status: 'Active',
      });
      await newEmp.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Employee account created successfully!',
      user: {
        id: newUser._id,
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Create Employee Account Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating employee account',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    const user = req.user;
    const permissions = user.permissions && user.permissions.length > 0
      ? user.permissions
      : getPermissionsForRole(user.role);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: permissions,
        avatar: user.avatar || user.photo || user.profilePhoto || (user.email === 'rp2568@gmail.com' ? '/RP_profile.jpg' : ''),
        status: user.status || 'active',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message,
    });
  }
};

// @desc    Get all users for Admin
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching users',
    });
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status || (user.status === 'active' ? 'inactive' : 'active');
    await user.save();

    // Also update Employee collection if exists
    await Employee.findOneAndUpdate(
      { email: user.email },
      { status: user.status === 'active' ? 'Active' : 'Deactivated' }
    );

    return res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error updating user status',
    });
  }
};

// @desc    Logout user / clear session
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};

export const login = loginAdmin;
export const createEmployee = createEmployeeAccount;
export const logout = logoutUser;

