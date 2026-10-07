import express from "express";
import Stock from "../Models/stock.js";
import Product from "../Models/product.js";

const router = express.Router();

const initialSeedStocks = [
  { sku: "SUN-001", productName: "Glossy Sunmica 1.0mm", name: "Glossy Sunmica 1.0mm", category: "Sunmica", price: 1250, unitPrice: 1250, unit: "Sheet (8x4 ft)", stockQuantity: 82, stock: 82, quantity: 82, reservedQuantity: 10, reserved: 10, warehouseLocation: "Warehouse A - Rack 04", status: "In Stock", description: "High-gloss laminated decorative sheet for luxury furniture." },
  { sku: "SUN-002", productName: "Matte Finish Sunmica 1.0mm", name: "Matte Finish Sunmica 1.0mm", category: "Sunmica", price: 1350, unitPrice: 1350, unit: "Sheet (8x4 ft)", stockQuantity: 45, stock: 45, quantity: 45, reservedQuantity: 5, reserved: 5, warehouseLocation: "Warehouse A - Rack 05", status: "In Stock", description: "Anti-fingerprint matte laminate sheet." },
  { sku: "SUN-003", productName: "Textured Sunmica 1.2mm", name: "Textured Sunmica 1.2mm", category: "Sunmica", price: 1550, unitPrice: 1550, unit: "Sheet (8x4 ft)", stockQuantity: 8, stock: 8, quantity: 8, reservedQuantity: 4, reserved: 4, warehouseLocation: "Warehouse A - Rack 06", status: "Low Stock", description: "Deep textured wood-grain laminate." },
  { sku: "PLY-001", productName: "Plywood 18mm Marine BWP", name: "Plywood 18mm Marine BWP", category: "Plywood", price: 2850, unitPrice: 2850, unit: "Sheet (8x4 ft)", stockQuantity: 32, stock: 32, quantity: 32, reservedQuantity: 8, reserved: 8, warehouseLocation: "Timber Yard B - Bay 02", status: "In Stock", description: "100% Boiling Waterproof Gurjan Plywood." },
  { sku: "MDF-001", productName: "MDF Board High Density 12mm", name: "MDF Board High Density 12mm", category: "MDF", price: 1450, unitPrice: 1450, unit: "Sheet (8x4 ft)", stockQuantity: 0, stock: 0, quantity: 0, reservedQuantity: 0, reserved: 0, warehouseLocation: "Warehouse B - Section 01", status: "Out of Stock", description: "Smooth exterior grade medium density fiberboard." },
  { sku: "HDW-001", productName: "Soft-Close Cabinet Hinges (SS 304)", name: "Soft-Close Cabinet Hinges (SS 304)", category: "Hardware", price: 480, unitPrice: 480, unit: "Pair", stockQuantity: 145, stock: 145, quantity: 145, reservedQuantity: 20, reserved: 20, warehouseLocation: "Hardware Depot - Bin 12", status: "In Stock", description: "Hydraulic 3D soft-closing cabinet hinges." }
];

// GET ALL STOCKS (Merged real Products + Stocks for live accuracy)
router.get("/", async (req, res) => {
  try {
    let [stocks, products] = await Promise.all([
      Stock.find().sort({ createdAt: -1 }),
      Product.find().sort({ createdAt: -1 })
    ]);

    if (stocks.length === 0 && products.length === 0) {
      products = await Product.insertMany(initialSeedStocks);
    }

    const itemsMap = new Map();

    // Insert all Products into map
    products.forEach(p => {
      const obj = p.toObject ? p.toObject() : p;
      const key = obj.sku || obj._id.toString();
      itemsMap.set(key, { ...obj, id: obj._id.toString() });
    });

    // Merge or append Stocks
    stocks.forEach(s => {
      const obj = s.toObject ? s.toObject() : s;
      const key = obj.sku || obj._id.toString();
      const existing = itemsMap.get(key);
      if (existing) {
        itemsMap.set(key, { ...existing, ...obj, id: existing.id || obj._id.toString() });
      } else {
        itemsMap.set(key, { ...obj, id: obj._id.toString() });
      }
    });

    const combined = Array.from(itemsMap.values());
    res.status(200).json({ success: true, data: combined });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stocks", error: error.message });
  }
});

// GET SINGLE STOCK
router.get("/:id", async (req, res) => {
  try {
    let stock = await Stock.findById(req.params.id);
    if (!stock) {
      stock = await Product.findById(req.params.id);
    }
    if (!stock) return res.status(404).json({ success: false, message: "Stock item not found" });
    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

import { reallocatePendingOrdersForStock } from "../Controllers/orderController.js";

// CREATE STOCK RECORD
router.post("/", async (req, res) => {
  try {
    const stock = await Stock.create(req.body);
    // Sync to Products catalog
    await Product.create({
      ...req.body,
      productName: req.body.name || req.body.productName,
      price: req.body.unitPrice || req.body.price
    }).catch(() => {});

    // Automatically check and allocate newly available stock to pending Sales Orders
    await reallocatePendingOrdersForStock();

    res.status(201).json({ success: true, message: "Stock record created successfully", data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create stock record", error: error.message });
  }
});

// UPDATE STOCK RECORD / STOCK IN
router.put("/:id", async (req, res) => {
  try {
    let stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Also update matching Product by ID or SKU
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock && product) {
      stock = product;
    }

    if (!stock && req.body.sku) {
      stock = await Stock.findOneAndUpdate({ sku: req.body.sku }, req.body, { new: true });
      await Product.findOneAndUpdate({ sku: req.body.sku }, req.body, { new: true });
    }

    if (!stock) return res.status(404).json({ success: false, message: "Stock record not found" });

    // Automatically check and allocate newly available stock to pending Sales Orders
    await reallocatePendingOrdersForStock();

    res.status(200).json({ success: true, message: "Stock updated successfully", data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update stock", error: error.message });
  }
});

// DELETE STOCK RECORD
router.delete("/:id", async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    await Product.findByIdAndDelete(req.params.id).catch(() => {});
    res.status(200).json({ success: true, message: "Stock deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete stock", error: error.message });
  }
});

export default router;
