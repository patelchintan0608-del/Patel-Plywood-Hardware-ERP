import express from "express";
import Delivery from "../Models/dilivery.js";
import Order from "../Models/order.js";
import mongoose from "mongoose";

const router = express.Router();

// GET all deliveries (Auto-creates from Sales Orders if database is empty)
router.get("/", async (req, res) => {
  try {
    let deliveries = await Delivery.find().sort({ createdAt: -1 });

    // Auto-sync deliveries from Sales Orders if none exist yet
    if (deliveries.length === 0) {
      const orders = await Order.find();
      if (orders.length > 0) {
        const initialDeliveries = orders.map((o, idx) => ({
          deliveryNumber: String(1 + idx).padStart(5, '0'),
          orderId: o._id,
          orderNumber: o.orderNumber || String(1 + idx).padStart(5, '0'),
          customerId: o.customerId,
          customerName: o.customerName || "Customer",
          destination: "Client Site Address, Main St",
          dispatchDate: o.orderDate || new Date(),
          estimatedArrival: o.deliveryDueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: o.status === "Delivered" ? "Delivered" : "Dispatched",
          driver: "Logistics Driver (+91 98765 01920)",
          vehicleNo: "GA-01-TRK-7740",
          totalItems: (o.items && o.items.length) || 1,
        }));

        deliveries = await Delivery.insertMany(initialDeliveries);
      }
    }

    res.status(200).json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    console.error("Fetch deliveries error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE delivery from Sales Order
router.post("/from-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    let order;

    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }
    if (!order) {
      order = await Order.findOne({
        $or: [{ orderNumber: orderId }, { _id: orderId }]
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales Order not found",
      });
    }

    // Check if delivery already exists for this order
    let delivery = await Delivery.findOne({
      $or: [{ orderId: order._id }, { orderNumber: order.orderNumber }]
    });

    if (!delivery) {
      const count = await Delivery.countDocuments();
      const deliveryNumber = String(count + 1).padStart(5, '0');

      delivery = await Delivery.create({
        deliveryNumber,
        orderId: order._id,
        orderNumber: order.orderNumber || "00001",
        customerId: order.customerId,
        customerName: order.customerName,
        destination: req.body.destination || "Client Site Address, Main St",
        dispatchDate: req.body.dispatchDate || new Date(),
        estimatedArrival: req.body.estimatedArrival || order.deliveryDueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: req.body.status || "Dispatched",
        driver: req.body.driver || "Logistics Driver (+91 98765 01920)",
        vehicleNo: req.body.vehicleNo || "GA-01-TRK-7740",
        totalItems: (order.items && order.items.length) || 1,
      });
    } else {
      if (req.body.status) delivery.status = req.body.status;
      if (req.body.destination) delivery.destination = req.body.destination;
      if (req.body.driver) delivery.driver = req.body.driver;
      if (req.body.vehicleNo) delivery.vehicleNo = req.body.vehicleNo;
      if (req.body.estimatedArrival) delivery.estimatedArrival = req.body.estimatedArrival;
      await delivery.save();
    }

    res.status(200).json({
      success: true,
      message: "Delivery record created/updated successfully from Sales Order",
      data: delivery,
    });
  } catch (error) {
    console.error("Create delivery from order error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET single delivery
router.get("/:id", async (req, res) => {
  try {
    let delivery;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      delivery = await Delivery.findById(req.params.id);
    }
    if (!delivery) {
      delivery = await Delivery.findOne({
        $or: [{ deliveryNumber: req.params.id }, { _id: req.params.id }]
      });
    }

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    res.status(200).json({
      success: true,
      data: delivery,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE delivery
router.post("/", async (req, res) => {
  try {
    const deliveryData = { ...req.body };
    if (deliveryData.orderId && !mongoose.Types.ObjectId.isValid(deliveryData.orderId)) {
      delete deliveryData.orderId;
    }
    if (deliveryData.customerId && !mongoose.Types.ObjectId.isValid(deliveryData.customerId)) {
      delete deliveryData.customerId;
    }

    if (!deliveryData.deliveryNumber) {
      const count = await Delivery.countDocuments();
      deliveryData.deliveryNumber = String(count + 1).padStart(5, '0');
    }
    const delivery = await Delivery.create(deliveryData);

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: delivery,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE delivery
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.orderId && !mongoose.Types.ObjectId.isValid(updateData.orderId)) {
      delete updateData.orderId;
    }
    if (updateData.customerId && !mongoose.Types.ObjectId.isValid(updateData.customerId)) {
      delete updateData.customerId;
    }

    let delivery;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      delivery = await Delivery.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    }
    if (!delivery) {
      delivery = await Delivery.findOneAndUpdate(
        { $or: [{ deliveryNumber: req.params.id }, { _id: req.params.id }] },
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery updated successfully",
      data: delivery,
    });
  } catch (error) {
    console.error("Update delivery error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE delivery
router.delete("/:id", async (req, res) => {
  try {
    let delivery;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      delivery = await Delivery.findByIdAndDelete(req.params.id);
    }
    if (!delivery) {
      delivery = await Delivery.findOneAndDelete({
        $or: [{ deliveryNumber: req.params.id }, { _id: req.params.id }]
      });
    }

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Delivery deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
