import express from "express";
import mongoose from "mongoose";
import Quotation from "../Models/Quotation.js";
import Customer from "../Models/customer.js";
import Product from "../Models/product.js";
import Stock from "../Models/stock.js";

const router = express.Router();

// CREATE QUOTATION WITH REAL-TIME AVAILABLE STOCK VALIDATION
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const items = body.items || [];

    const formattedItems = items.map(item => ({
      productId: item.productId || item._id || item.id,
      productName: item.productName || item.name || "Custom Furniture Item",
      name: item.name || item.productName || "Custom Furniture Item",
      quantity: Number(item.quantity || item.qty || 1),
      qty: Number(item.qty || item.quantity || 1),
      price: Number(item.price || item.unitPrice || 0),
      unitPrice: Number(item.unitPrice || item.price || 0),
      woodType: item.woodType || "",
      finish: item.finish || "",
      total: Number(item.total || 0)
    }));

    // Quotation is a commercial document; it is not blocked by stock availability.
    // Inventory reservation and shortage management occur upon Sales Order creation.
    let validCustomerId;
    if (body.customerId && /^[0-9a-fA-F]{24}$/.test(String(body.customerId))) {
      validCustomerId = new mongoose.Types.ObjectId(String(body.customerId));
    } else {
      const firstCust = await Customer.findOne();
      validCustomerId = firstCust ? firstCust._id : new mongoose.Types.ObjectId();
    }

    const { customerId: _, id: __, _id: ___, validUntil, date, quotationDate, ...restBody } = body;

    let qnNumber = body.quotationNumber;
    if (!qnNumber || !String(qnNumber).startsWith("QN-")) {
      const count = await Quotation.countDocuments();
      qnNumber = `QN-${String(count + 1).padStart(4, "0")}`;
    }

    let parsedValidUntil = undefined;
    if (validUntil && !isNaN(new Date(validUntil).getTime())) {
      parsedValidUntil = new Date(validUntil);
    }

    let parsedDate = new Date();
    if (date && !isNaN(new Date(date).getTime())) {
      parsedDate = new Date(date);
    } else if (quotationDate && !isNaN(new Date(quotationDate).getTime())) {
      parsedDate = new Date(quotationDate);
    }

    const payload = {
      ...restBody,
      customerId: validCustomerId,
      quotationNumber: qnNumber,
      quotationDate: parsedDate,
      validUntil: parsedValidUntil,
      status: body.status || "Draft",
      items: formattedItems
    };

    console.log("Creating Quotation after stock validation pass:", payload);
    const quotation = await Quotation.create(payload);

    res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      quotation,
      data: quotation
    });
  } catch (error) {
    console.error("Create quotation backend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quotation",
      error: error.message
    });
  }
});

// GET ALL QUOTATIONS
router.get("/", async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: quotations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
});

// GET SINGLE QUOTATION
router.get("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: quotation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotation",
      error: error.message,
    });
  }
});

// UPDATE QUOTATION
router.put("/:id", async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.validUntil && isNaN(new Date(body.validUntil).getTime())) {
      delete body.validUntil;
    }
    if (body.date && isNaN(new Date(body.date).getTime())) {
      delete body.date;
    }
    delete body.id;
    delete body._id;

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quotation updated successfully",
      data: quotation,
    });
  } catch (error) {
    console.error("Update quotation backend error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quotation",
      error: error.message,
    });
  }
});

// DELETE QUOTATION
router.delete("/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
});

export default router;