import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    inquiryId: {
      type: String,
      required: true,
      unique: true,
    },
    inquiryDate: {
      type: Date,
      default: Date.now,
    },
    customerName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    source: {
      type: String,
      enum: [
        "Website",
        "WhatsApp",
        "Instagram",
        "Facebook",
        "Google",
        "Referral",
        "Phone Call",
        "Email",
        "Exhibition",
        "Walk-in",
        "Existing Customer",
        "Advertisement",
        "Other",
      ],
      default: "Website",
    },
    product: {
      type: String,
    },
    category: {
      type: String,
      default: "Furniture",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    estimatedBudget: {
      type: Number,
      default: 0,
    },
    requirement: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedTo: {
      type: String,
      default: "Sales Executive",
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Under Review",
        "Qualified",
        "Converted to Lead",
        "On Hold",
        "Not Interested",
        "Rejected",
        "Closed",
      ],
      default: "New",
    },
    expectedDate: {
      type: Date,
    },
    remarks: {
      type: String,
    },
    convertedToLead: {
      type: Boolean,
      default: false,
    },
    convertedLeadId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

inquirySchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
