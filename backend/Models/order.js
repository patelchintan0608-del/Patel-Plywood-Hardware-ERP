import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },

    productName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    orderedQty: {
      type: Number,
      default: 1,
    },

    reservedQty: {
      type: Number,
      default: 0,
    },

    pendingQty: {
      type: Number,
      default: 0,
    },

    deliveredQty: {
      type: Number,
      default: 0,
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    deliveryDueDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Partially Available",
        "Stock Shortage",
        "Processing",
        "In Production",
        "Confirmed",
        "Ready for Dispatch",
        "Ready for Delivery",
        "Partially Delivered",
        "Dispatched",
        "Delivered",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order = mongoose.model("Order", orderSchema);

export default Order;