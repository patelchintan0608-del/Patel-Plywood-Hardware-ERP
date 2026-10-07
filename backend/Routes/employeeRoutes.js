import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  updateEmployeeRole,
  resetEmployeePassword,
  deleteEmployee
} from '../Controllers/EmployeeController.js';
import { protect } from '../Middleware/authMiddleware.js';
import adminOnly from '../Middleware/adminMiddleware.js';

const router = express.Router();

// Require Authentication and Admin role for all employee management endpoints
router.use(protect);
router.use(adminOnly);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.patch('/:id/status', updateEmployeeStatus);
router.patch('/:id/role', updateEmployeeRole);
router.patch('/:id/reset-password', resetEmployeePassword);
router.delete('/:id', deleteEmployee);

export default router;
