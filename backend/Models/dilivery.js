import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    deliveryNumber: {
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

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
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
    },

    notes: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Delivery = mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);

export default Delivery;
