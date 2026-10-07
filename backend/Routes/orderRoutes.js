import express from "express";
import Order from "../Models/order.js";
import { createSalesOrderFromQuotation } from "../Controllers/orderController.js";
import mongoose from "mongoose";

const router = express.Router();

// GET all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE ORDER FROM QUOTATION
router.post("/from-quotation/:quotationId", createSalesOrderFromQuotation);

// GET single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customerId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE order
router.post("/", async (req, res) => {
  try {
    const orderData = { ...req.body };
    if (!orderData.orderNumber) {
      const count = await Order.countDocuments();
      orderData.orderNumber = String(count + 1).padStart(5, '0');
    }

    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items = orderData.items.map(item => {
        const cleanItem = { ...item };
        if (cleanItem.productId && !mongoose.Types.ObjectId.isValid(cleanItem.productId)) {
          delete cleanItem.productId;
        }
        return cleanItem;
      });
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE order
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sales order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;