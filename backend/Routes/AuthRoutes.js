import express from "express";
import {
  registerAdmin,
  loginAdmin,
  createEmployeeAccount,
  getAdminProfile,
  getAllUsers,
  toggleUserStatus,
  logoutUser,
} from "../Controllers/AuthController.js";
import { protect, requireAdmin } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutUser);
router.post("/create-employee", protect, requireAdmin, createEmployeeAccount);
router.post("/create-account", protect, requireAdmin, createEmployeeAccount);
router.get("/me", protect, getAdminProfile);
router.get("/users", protect, requireAdmin, getAllUsers);
router.put("/users/:id/status", protect, requireAdmin, toggleUserStatus);

export default router;