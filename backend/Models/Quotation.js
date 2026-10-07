import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      default: () => `QN-0001`,
    },

    customerId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    quotationDate: {
      type: Date,
      default: Date.now,
    },

    validUntil: {
      type: Date,
    },

    items: [
      {
        productName: {
          type: String,
        },
        name: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        qty: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number,
          default: 0,
        },
        unitPrice: {
          type: Number,
          default: 0,
        },
        woodType: String,
        finish: String,
        total: {
          type: Number,
          default: 0,
        },
      },
    ],

    subtotal: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Pending", "Declined", "Expired", "Converted"],
      default: "Pending",
    },

    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

quotationSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Quotation = mongoose.models.Quotation ? mongoose.model("Quotation") : mongoose.model("Quotation", quotationSchema);

export default Quotation;