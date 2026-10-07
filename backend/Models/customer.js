import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },

    phone: {
      type: String,
      required: true,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    gstNumber: {
      type: String,
    },

    customerType: {
      type: String,
    },

    status: {
      type: String,
      default: "Active",
    },

    outstandingBalance: {
      type: Number,
      default: 0,
    },

    creditLimit: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;