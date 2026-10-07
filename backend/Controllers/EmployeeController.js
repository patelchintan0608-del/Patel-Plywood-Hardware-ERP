import mongoose from 'mongoose';
import Employee from '../Models/Employee.js';
import User from '../Models/User.js';
import { getPermissionsForRole } from '../config/permissions.js';

// Helper to build flexible query matching Mongo _id, custom string id, or employeeId
const getQueryForId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { id: id }, { employeeId: id }] };
  }
  return { $or: [{ id: id }, { employeeId: id }] };
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.error("Get Employees Error:", error);
    return res.status(500).json({ success: false, message: 'Failed to fetch employees', error: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne(getQueryForId(id));
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch employee details', error: error.message });
  }
};

// @desc    Create new employee profile with auto sequential ID & login account
// @route   POST /api/employees
// @access  Private/Admin
export const createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      password,
      employeeType,
      role,
      department,
      designation,
      joiningDate,
      status
    } = req.body;

    const empName = fullName || name;
    if (!empName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Full Name, Email, and Phone number are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check for existing employee by email
    const existingEmp = await Employee.findOne({ email: trimmedEmail });
    if (existingEmp) {
      return res.status(400).json({ success: false, message: `An employee with email ${trimmedEmail} already exists` });
    }

    // Generate auto sequential Employee ID (EMP00001, EMP00002...)
    const count = await Employee.countDocuments();
    const nextSeq = count + 1;
    const autoId = `EMP${nextSeq.toString().padStart(5, '0')}`;

    const assignedRole = role || employeeType || 'quotation_employee';
    const permissions = getPermissionsForRole(assignedRole);

    const newEmp = new Employee({
      employeeId: req.body.employeeId || autoId,
      fullName: empName,
      name: empName,
      email: trimmedEmail,
      phone,
      password: password || 'Patel@12345',
      employeeType: assignedRole,
      department: department || (assignedRole.includes('delivery') ? 'Logistics / Dispatch' : 'Sales / Quotation'),
      designation: designation || (assignedRole.includes('delivery') ? 'Delivery Executive' : 'Quotation Executive'),
      role: assignedRole,
      joiningDate: joiningDate || Date.now(),
      status: status ? status.toLowerCase() : 'active'
    });

    await newEmp.save();

    // Also sync/create User account in User collection
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (!existingUser) {
      const newUser = new User({
        employeeId: newEmp.employeeId,
        name: empName,
        email: trimmedEmail,
        password: password || 'Patel@12345',
        role: assignedRole,
        department: newEmp.department,
        permissions: permissions,
        status: newEmp.status === 'active' || newEmp.status === 'Active' ? 'active' : 'inactive',
      });
      await newUser.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Employee Profile Created Successfully',
      employee: newEmp,
      employeeId: newEmp.employeeId,
      fullName: newEmp.fullName,
      employeeType: newEmp.employeeType,
      email: newEmp.email
    });
  } catch (error) {
    console.error('Create Employee Error:', error);
    return res.status(400).json({ success: false, message: 'Failed to create employee', error: error.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private/Admin
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.fullName && !updates.name) updates.name = updates.fullName;
    if (updates.name && !updates.fullName) updates.fullName = updates.name;

    if (updates.role || updates.employeeType) {
      const newRole = updates.role || updates.employeeType;
      updates.role = newRole;
      updates.employeeType = newRole;
      updates.permissions = getPermissionsForRole(newRole);
    }

    const query = getQueryForId(id);
    let updatedEmp = await Employee.findOneAndUpdate(query, updates, { new: true });

    if (!updatedEmp && updates.email) {
      updatedEmp = await Employee.findOneAndUpdate({ email: updates.email.trim().toLowerCase() }, updates, { new: true });
    }

    if (!updatedEmp) {
      const newEmp = new Employee({
        ...updates,
        employeeId: updates.employeeId || id
      });
      await newEmp.save();
      updatedEmp = newEmp;
    }

    // Sync with User collection in database
    const userEmail = updatedEmp.email || updates.email;
    if (userEmail) {
      await User.findOneAndUpdate(
        { email: userEmail.trim().toLowerCase() },
        {
          name: updatedEmp.name || updatedEmp.fullName,
          role: updatedEmp.role || updatedEmp.employeeType,
          department: updatedEmp.department,
          permissions: getPermissionsForRole(updatedEmp.role || updatedEmp.employeeType),
          status: (updatedEmp.status || '').toLowerCase() === 'active' ? 'active' : 'inactive'
        }
      );
    }

    return res.status(200).json({ success: true, message: 'Employee updated successfully', employee: updatedEmp });
  } catch (error) {
    console.error('Update Employee Error:', error);
    return res.status(400).json({ success: false, message: 'Failed to update employee', error: error.message });
  }
};

// @desc    Update employee status (Active / Inactive)
// @route   PATCH /api/employees/:id/status
// @access  Private/Admin
export const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const normStatus = status ? status.toLowerCase() : 'active';
    const statusVal = normStatus === 'active' ? 'Active' : 'Inactive';

    const updatedEmp = await Employee.findOneAndUpdate(
      getQueryForId(id),
      { status: statusVal },
      { new: true }
    );

    if (updatedEmp && updatedEmp.email) {
      await User.findOneAndUpdate(
        { email: updatedEmp.email.toLowerCase() },
        { status: normStatus }
      );
    }

    return res.status(200).json({ success: true, message: `Employee status updated to ${statusVal}`, employee: updatedEmp });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Failed to update employee status', error: error.message });
  }
};

// @desc    Update employee role & reassign permissions
// @route   PATCH /api/employees/:id/role
// @access  Private/Admin
export const updateEmployeeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const permissions = getPermissionsForRole(role);

    const updatedEmp = await Employee.findOneAndUpdate(
      getQueryForId(id),
      { role, employeeType: role, permissions },
      { new: true }
    );

    if (updatedEmp && updatedEmp.email) {
      await User.findOneAndUpdate(
        { email: updatedEmp.email.toLowerCase() },
        { role, permissions }
      );
    }

    return res.status(200).json({
      success: true,
      message: `Employee role updated to ${role}`,
      employee: updatedEmp,
      permissions
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Failed to update employee role', error: error.message });
  }
};

// @desc    Reset employee password
// @route   PATCH /api/employees/:id/reset-password
// @access  Private/Admin
export const resetEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 6 characters' });
    }

    const employee = await Employee.findOne(getQueryForId(id));
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin password cannot be reset here' });
    }

    employee.password = password;
    await employee.save();

    const userDoc = await User.findOne({ email: employee.email });
    if (userDoc) {
      userDoc.password = password;
      await userDoc.save();
    }

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

// @desc    Delete employee profile and login account
// @route   DELETE /api/employees/:id
// @access  Private/Admin
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employee.findOne(getQueryForId(id));

    if (emp && emp.email) {
      await User.deleteOne({ email: emp.email });
    }

    await Employee.findOneAndDelete(getQueryForId(id));

    return res.status(200).json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete employee', error: error.message });
  }
};
