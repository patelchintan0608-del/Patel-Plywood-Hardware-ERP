import mongoose from "mongoose";

const dispatchSchema = new mongoose.Schema(
  {
    dispatchNumber: {
      type: String,
      required: true,
      unique: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    orderNumber: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      default: "Client Site Address",
    },

    dispatchDate: {
      type: Date,
      default: Date.now,
    },

    estimatedArrival: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Preparing", "Dispatched", "In Transit", "Out for Delivery", "Delivered", "Failed", "Cancelled"],
      default: "Dispatched",
    },

    driver: {
      type: String,
      default: "Logistics Driver (+91 98765 01920)",
    },

    vehicleNo: {
      type: String,
      default: "GA-01-TRK-7740",
    },

    totalItems: {
      type: Number,
      default: 1,
    }
  },
  {
    timestamps: true,
  }
);

const Dispatch = mongoose.models.Dispatch || mongoose.model("Dispatch", dispatchSchema);

export default Dispatch;
