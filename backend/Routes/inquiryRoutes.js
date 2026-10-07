import express from "express";
import Inquiry from "../Models/Inquiry.js";
import Lead from "../Models/Lead.js";

const router = express.Router();

// Helper to format Inquiry ID: INQ-00001
const generateNextInquiryId = async () => {
  const count = await Inquiry.countDocuments();
  return `INQ-${String(count + 1).padStart(5, "0")}`;
};

// Helper to format Lead ID: LD-00001
const generateNextLeadId = async () => {
  const count = await Lead.countDocuments();
  return `LD-${String(count + 1).padStart(5, "0")}`;
};

// Get all Inquiries
router.get("/", async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Inquiry by ID
router.get("/:id", async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new Inquiry
router.post("/", async (req, res) => {
  try {
    const { inquiryId, customerName, companyName, phone, email, source, product, category, quantity, estimatedBudget, requirement, priority, assignedTo, status, expectedDate, remarks } = req.body;

    const finalInquiryId = inquiryId || (await generateNextInquiryId());

    const newInquiry = new Inquiry({
      inquiryId: finalInquiryId,
      customerName,
      companyName: companyName || customerName,
      phone,
      email: email || "",
      source: source || "Website",
      product: product || "Furniture Item",
      category: category || "Furniture",
      quantity: Number(quantity || 1),
      estimatedBudget: Number(estimatedBudget || 0),
      requirement: requirement || "",
      priority: priority || "Medium",
      assignedTo: assignedTo || "Sales Executive",
      status: status || "New",
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      remarks: remarks || "",
    });

    const savedInquiry = await newInquiry.save();
    res.status(201).json({ success: true, data: savedInquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update Inquiry
router.put("/:id", async (req, res) => {
  try {
    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedInquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, data: updatedInquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Convert Inquiry to Lead
router.post("/:id/convert-to-lead", async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    if (inquiry.convertedToLead && inquiry.convertedLeadId) {
      const existingLead = await Lead.findById(inquiry.convertedLeadId);
      if (existingLead) {
        return res.json({
          success: true,
          message: "Inquiry was already converted to Lead",
          data: existingLead,
        });
      }
    }

    const leadId = await generateNextLeadId();

    const newLead = new Lead({
      leadId,
      leadName: inquiry.companyName || inquiry.customerName,
      contactPerson: inquiry.customerName,
      companyName: inquiry.companyName || inquiry.customerName,
      phone: inquiry.phone,
      email: inquiry.email,
      source: inquiry.source || "Website",
      productInterest: inquiry.product || "Furniture Order",
      category: inquiry.category || "Furniture",
      estimatedValue: inquiry.estimatedBudget || 0,
      assignedTo: inquiry.assignedTo || "Sales Executive",
      priority: inquiry.priority || "Medium",
      status: "Qualified",
      expectedClosingDate: inquiry.expectedDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: inquiry.requirement ? `Converted from Inquiry ${inquiry.inquiryId}: ${inquiry.requirement}` : `Converted from Inquiry ${inquiry.inquiryId}`,
      inquiryId: inquiry.inquiryId,
      activityTimeline: [
        {
          date: new Date(),
          title: "Converted from Inquiry",
          description: `Lead created from Inquiry ${inquiry.inquiryId} (${inquiry.product}).`,
          author: "System",
        },
      ],
    });

    const savedLead = await newLead.save();

    inquiry.status = "Converted to Lead";
    inquiry.convertedToLead = true;
    inquiry.convertedLeadId = savedLead._id.toString();
    await inquiry.save();

    res.status(201).json({
      success: true,
      message: `Successfully converted Inquiry ${inquiry.inquiryId} to Lead ${savedLead.leadId}!`,
      data: savedLead,
      inquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Inquiry
router.delete("/:id", async (req, res) => {
  try {
    const deletedInquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!deletedInquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
