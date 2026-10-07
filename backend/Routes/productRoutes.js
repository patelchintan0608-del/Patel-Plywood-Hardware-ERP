import express from "express";
import Product from "../Models/product.js";

const router = express.Router();

const initialSeedProducts = [
  { sku: "SUN-001", productName: "Glossy Sunmica 1.0mm", name: "Glossy Sunmica 1.0mm", category: "Sunmica", price: 1250, unitPrice: 1250, unit: "Sheet (8x4 ft)", stockQuantity: 82, stock: 82, quantity: 82, reservedQuantity: 10, reserved: 10, finish: "Glossy Royal Teak", status: "In Stock", description: "High-gloss laminated decorative sheet for luxury furniture." },
  { sku: "SUN-002", productName: "Matte Finish Sunmica 1.0mm", name: "Matte Finish Sunmica 1.0mm", category: "Sunmica", price: 1350, unitPrice: 1350, unit: "Sheet (8x4 ft)", stockQuantity: 45, stock: 45, quantity: 45, reservedQuantity: 5, reserved: 5, finish: "Matte Walnut", status: "In Stock", description: "Anti-fingerprint matte laminate sheet." },
  { sku: "SUN-003", productName: "Textured Sunmica 1.2mm", name: "Textured Sunmica 1.2mm", category: "Sunmica", price: 1550, unitPrice: 1550, unit: "Sheet (8x4 ft)", stockQuantity: 8, stock: 8, quantity: 8, reservedQuantity: 4, reserved: 4, finish: "Textured Natural Oak", status: "Low Stock", description: "Deep textured wood-grain laminate." },
  { sku: "PLY-001", productName: "Plywood 18mm Marine BWP", name: "Plywood 18mm Marine BWP", category: "Plywood", price: 2850, unitPrice: 2850, unit: "Sheet (8x4 ft)", stockQuantity: 32, stock: 32, quantity: 32, reservedQuantity: 8, reserved: 8, thickness: "18mm", status: "In Stock", description: "100% Boiling Waterproof Gurjan Plywood." },
  { sku: "MDF-001", productName: "MDF Board High Density 12mm", name: "MDF Board High Density 12mm", category: "MDF", price: 1450, unitPrice: 1450, unit: "Sheet (8x4 ft)", stockQuantity: 0, stock: 0, quantity: 0, reservedQuantity: 0, reserved: 0, thickness: "12mm", status: "Out of Stock", description: "Smooth exterior grade medium density fiberboard." },
  { sku: "HDW-001", productName: "Soft-Close Cabinet Hinges (SS 304)", name: "Soft-Close Cabinet Hinges (SS 304)", category: "Hardware", price: 480, unitPrice: 480, unit: "Pair", stockQuantity: 145, stock: 145, quantity: 145, reservedQuantity: 20, reserved: 20, finish: "Stainless Steel", status: "In Stock", description: "Hydraulic 3D soft-closing cabinet hinges." }
];

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    let products = await Product.find().sort({ createdAt: -1 });

    if (products.length === 0) {
      products = await Product.insertMany(initialSeedProducts);
    }

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
});

// CREATE PRODUCT
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create product", error: error.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product updated successfully", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update product", error: error.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete product", error: error.message });
  }
});

export default router;
