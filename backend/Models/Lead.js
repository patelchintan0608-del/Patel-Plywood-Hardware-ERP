import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    followUpDate: {
      type: Date,
      required: true,
    },
    followUpTime: {
      type: String,
      default: "10:00 AM",
    },
    followUpType: {
      type: String,
      enum: [
        "Phone Call",
        "WhatsApp",
        "Email",
        "Meeting",
        "Site Visit",
        "Product Demo",
      ],
      default: "Phone Call",
    },
    assignedEmployee: {
      type: String,
      default: "Sales Executive",
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    author: {
      type: String,
      default: "System",
    },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
    },
    leadName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
    },
    contactPerson: {
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
    productInterest: {
      type: String,
    },
    category: {
      type: String,
      default: "Furniture",
    },
    estimatedValue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Proposal / Quotation",
        "Negotiation",
        "Won",
        "Lost",
        "Not Interested",
        "On Hold",
        "Invalid",
      ],
      default: "New",
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
    expectedClosingDate: {
      type: Date,
    },
    nextFollowUp: {
      type: Date,
    },
    notes: {
      type: String,
    },
    inquiryId: {
      type: String,
    },
    convertedToCustomer: {
      type: Boolean,
      default: false,
    },
    convertedCustomerId: {
      type: String,
    },
    followUps: [followUpSchema],
    activityTimeline: [activitySchema],
  },
  {
    timestamps: true,
  }
);

leadSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

export default Lead;
