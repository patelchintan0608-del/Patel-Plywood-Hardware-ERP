import Order from "../Models/order.js";
import Quotation from "../Models/Quotation.js";
import Customer from "../Models/customer.js";
import Product from "../Models/product.js";
import Stock from "../Models/stock.js";
import mongoose from "mongoose";

export const createSalesOrderFromQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;

    let quotation;
    if (mongoose.Types.ObjectId.isValid(quotationId)) {
      quotation = await Quotation.findById(quotationId);
    }
    if (!quotation) {
      quotation = await Quotation.findOne({
        $or: [{ quotationNumber: quotationId }, { _id: quotationId }]
      });
    }

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    if (quotation.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted quotations can create Sales Orders",
      });
    }

    const existingOrder = await Order.findOne({
      $or: [{ quotationId: quotation._id }, { quotationId: String(quotation._id) }]
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Sales Order already exists for this quotation",
        order: existingOrder,
        data: existingOrder
      });
    }

    // Resolve Customer ObjectId
    let validCustomerId;
    if (quotation.customerId && mongoose.Types.ObjectId.isValid(String(quotation.customerId))) {
      validCustomerId = new mongoose.Types.ObjectId(String(quotation.customerId));
    } else {
      const cust = await Customer.findOne({
        $or: [
          { companyName: quotation.customerName },
          { customerName: quotation.customerName }
        ]
      });
      if (cust) {
        validCustomerId = cust._id;
      } else {
        const firstCust = await Customer.findOne();
        validCustomerId = firstCust ? firstCust._id : new mongoose.Types.ObjectId();
      }
    }

    // Resolve Product ObjectId for items
    const defaultProduct = await Product.findOne();
    const fallbackProductId = defaultProduct ? defaultProduct._id : new mongoose.Types.ObjectId();

    let hasShortage = false;

    // Process each item to check stock availability, reserve available stock, & calculate shortages
    const processedItems = [];

    for (const rawItem of quotation.items || []) {
      const reqQty = Number(rawItem.quantity || rawItem.qty || 1);
      const unitPrice = Number(rawItem.unitPrice || rawItem.price || 0);
      const total = Number(rawItem.total || (reqQty * unitPrice));
      const prodName = rawItem.productName || rawItem.name || "Custom Furniture Item";

      let itemProductId = fallbackProductId;
      if (rawItem.productId && mongoose.Types.ObjectId.isValid(String(rawItem.productId))) {
        itemProductId = new mongoose.Types.ObjectId(String(rawItem.productId));
      }

      // Find matching product in database
      let p = await Product.findById(itemProductId);
      if (!p && prodName) {
        p = await Product.findOne({
          $or: [
            { productName: new RegExp(`^${prodName.trim()}$`, "i") },
            { name: new RegExp(`^${prodName.trim()}$`, "i") }
          ]
        });
      }

      let physicalStock = 0;
      let reservedStock = 0;

      if (p) {
        physicalStock = Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0);
        reservedStock = Number(p.reservedQuantity ?? p.reserved ?? 0);
      }

      const availableStock = Math.max(0, physicalStock - reservedStock);
      const allocatedReserved = Math.min(reqQty, availableStock);
      const shortagePending = reqQty - allocatedReserved;

      if (shortagePending > 0) {
        hasShortage = true;
      }

      // Reserve available stock on Product record
      if (p && allocatedReserved > 0) {
        p.reservedQuantity = (p.reservedQuantity || 0) + allocatedReserved;
        p.reserved = (p.reserved || 0) + allocatedReserved;
        await p.save();

        // Sync Stock collection if exists
        await Stock.updateOne(
          { $or: [{ _id: p._id }, { sku: p.sku }, { productName: p.productName }] },
          { $inc: { reservedQuantity: allocatedReserved, reserved: allocatedReserved } }
        ).catch(() => {});
      }

      processedItems.push({
        productId: p ? p._id : itemProductId,
        productName: prodName,
        quantity: reqQty,
        orderedQty: reqQty,
        reservedQty: allocatedReserved,
        pendingQty: shortagePending,
        deliveredQty: 0,
        unitPrice: unitPrice,
        total: total,
      });
    }

    if (processedItems.length === 0) {
      processedItems.push({
        productId: fallbackProductId,
        productName: "Custom Order Furniture",
        quantity: 1,
        orderedQty: 1,
        reservedQty: 0,
        pendingQty: 1,
        deliveredQty: 0,
        unitPrice: Number(quotation.grandTotal || quotation.subtotal || 0),
        total: Number(quotation.grandTotal || quotation.subtotal || 0),
      });
      hasShortage = true;
    }

    const count = await Order.countDocuments();
    const orderNumber = String(count + 1).padStart(5, '0');
    const initialStatus = hasShortage ? "Partially Available" : "Ready for Delivery";

    const order = await Order.create({
      orderNumber,
      quotationId: quotation._id,
      customerId: validCustomerId,
      customerName: quotation.customerName || "Customer",
      items: processedItems,
      subtotal: Number(quotation.subtotal || 0),
      tax: Number(quotation.tax || 0),
      totalAmount: Number(quotation.grandTotal || quotation.totalAmount || quotation.subtotal || 0),
      status: initialStatus,
    });

    res.status(201).json({
      success: true,
      message: hasShortage
        ? "Sales Order created with partial stock reserved & pending procurement requirement"
        : "Sales Order created successfully with 100% stock reserved",
      order,
      data: order
    });

  } catch (error) {
    console.error("Create Sales Order from quotation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Sales Order",
      error: error.message,
    });
  }
};

// AUTO-ALLOCATE INCOMING STOCK TO PENDING SALES ORDERS (FIFO)
export const reallocatePendingOrdersForStock = async (targetProduct) => {
  try {
    const orders = await Order.find({
      status: { $in: ["Partially Available", "Stock Shortage", "Pending"] }
    }).sort({ createdAt: 1 });

    for (const order of orders) {
      let orderUpdated = false;
      let allFulfilled = true;

      for (const item of order.items) {
        if ((item.pendingQty || 0) > 0) {
          let p = null;
          if (item.productId && mongoose.Types.ObjectId.isValid(String(item.productId))) {
            p = await Product.findById(item.productId);
          }
          if (!p && item.productName) {
            p = await Product.findOne({
              $or: [
                { productName: new RegExp(`^${item.productName.trim()}$`, "i") },
                { name: new RegExp(`^${item.productName.trim()}$`, "i") }
              ]
            });
          }

          if (p) {
            const phys = Number(p.stockQuantity ?? p.stock ?? p.quantity ?? 0);
            const resv = Number(p.reservedQuantity ?? p.reserved ?? 0);
            const avail = Math.max(0, phys - resv);

            if (avail > 0) {
              const toAlloc = Math.min(item.pendingQty, avail);
              item.reservedQty = (item.reservedQty || 0) + toAlloc;
              item.pendingQty = item.pendingQty - toAlloc;

              p.reservedQuantity = (p.reservedQuantity || 0) + toAlloc;
              p.reserved = (p.reserved || 0) + toAlloc;
              await p.save();

              await Stock.updateOne(
                { $or: [{ _id: p._id }, { sku: p.sku }, { productName: p.productName }] },
                { $inc: { reservedQuantity: toAlloc, reserved: toAlloc } }
              ).catch(() => {});

              orderUpdated = true;
            }
          }
        }

        if ((item.pendingQty || 0) > 0) {
          allFulfilled = false;
        }
      }

      if (allFulfilled) {
        order.status = "Ready for Delivery";
        orderUpdated = true;
      }

      if (orderUpdated) {
        await order.save();
      }
    }
  } catch (err) {
    console.error("reallocatePendingOrdersForStock error:", err);
  }
};
