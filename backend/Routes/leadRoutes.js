import express from "express";
import Lead from "../Models/Lead.js";
import Customer from "../Models/customer.js";

const router = express.Router();

// Helper to format Lead ID: LD-00001
const generateNextLeadId = async () => {
  const count = await Lead.countDocuments();
  return `LD-${String(count + 1).padStart(5, "0")}`;
};

// Helper to format Customer ID: CUS-00001
const generateNextCustomerId = async () => {
  const count = await Customer.countDocuments();
  return `CUS-${String(count + 1).padStart(5, "0")}`;
};

// Get all Leads
router.get("/", async (req, res) => {
  try {
    let leads = await Lead.find().sort({ createdAt: -1 });
    
    // Auto-seed New and Contacted leads if missing
    const hasNew = leads.some(l => l.status === 'New');
    const hasContacted = leads.some(l => l.status === 'Contacted');
    
    if (!hasNew || !hasContacted) {
      if (!hasNew) {
        await Lead.create({
          leadId: "LD-00005",
          leadName: "Apex Architecture & Designs",
          contactPerson: "Chintan Shah",
          companyName: "Apex Architecture & Designs",
          phone: "9820011223",
          email: "contact@apexdesigns.in",
          source: "Website",
          productInterest: "Commercial Teak Plywood 19mm",
          category: "Plywood",
          estimatedValue: 450000,
          assignedTo: "Sales Executive",
          status: "New",
          priority: "High",
          expectedClosingDate: new Date("2026-10-25"),
          notes: "Inquired for 250 sheets of 19mm Commercial Teak Plywood via website inquiry form."
        });
      }
      if (!hasContacted) {
        await Lead.create({
          leadId: "LD-00006",
          leadName: "Global Timber & Hardware Co",
          contactPerson: "Alok Kumar",
          companyName: "Global Timber & Hardware Co",
          phone: "9876123456",
          email: "alok@globaltimber.com",
          source: "WhatsApp",
          productInterest: "BWR Grade Marine Plywood",
          category: "Plywood",
          estimatedValue: 280000,
          assignedTo: "Amit Sharma",
          status: "Contacted",
          priority: "Medium",
          expectedClosingDate: new Date("2026-10-28"),
          notes: "Initial phone call completed. Shared product specifications and price list."
        });
      }
      leads = await Lead.find().sort({ createdAt: -1 });
    }

    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Lead by ID
router.get("/:id", async (req, res) => {
  try {
    let lead;
    if (req.params.id.length === 24) {
      lead = await Lead.findById(req.params.id);
    } else {
      lead = await Lead.findOne({ leadId: req.params.id });
    }

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new Lead
router.post("/", async (req, res) => {
  try {
    const {
      leadId,
      leadName,
      companyName,
      contactPerson,
      phone,
      email,
      source,
      productInterest,
      category,
      estimatedValue,
      status,
      priority,
      assignedTo,
      expectedClosingDate,
      nextFollowUp,
      notes,
    } = req.body;

    const finalLeadId = leadId || (await generateNextLeadId());

    const newLead = new Lead({
      leadId: finalLeadId,
      leadName: leadName || companyName || "New Lead",
      companyName: companyName || leadName || "Company",
      contactPerson: contactPerson || leadName,
      phone,
      email: email || "",
      source: source || "Website",
      productInterest: productInterest || "Modular Sofa",
      category: category || "Furniture",
      estimatedValue: Number(estimatedValue || 0),
      status: status || "New",
      priority: priority || "Medium",
      assignedTo: assignedTo || "Sales Executive",
      expectedClosingDate: expectedClosingDate ? new Date(expectedClosingDate) : undefined,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined,
      notes: notes || "",
      activityTimeline: [
        {
          date: new Date(),
          title: "Lead Created",
          description: `Lead ${finalLeadId} registered in system.`,
          author: "System",
        },
      ],
    });

    const savedLead = await newLead.save();
    res.status(201).json({ success: true, data: savedLead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update Lead
router.put("/:id", async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Record activity if status changed
    const updates = { ...req.body };
    let activityLog = null;
    if (updates.status && updates.status !== existing.status) {
      activityLog = {
        date: new Date(),
        title: `Status Changed to ${updates.status}`,
        description: `Lead status updated from ${existing.status} to ${updates.status}.`,
        author: "Sales Executive",
      };
    }

    if (activityLog) {
      updates.$push = { activityTimeline: activityLog };
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedLead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Add Follow-up to Lead
router.post("/:id/followup", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const { followUpDate, followUpTime, followUpType, assignedEmployee, remarks, status } = req.body;

    const followUpItem = {
      followUpDate: followUpDate ? new Date(followUpDate) : new Date(),
      followUpTime: followUpTime || "11:30 AM",
      followUpType: followUpType || "Phone Call",
      assignedEmployee: assignedEmployee || "Sales Executive",
      remarks: remarks || "",
      status: status || "Pending",
    };

    lead.followUps.unshift(followUpItem);
    lead.nextFollowUp = followUpItem.followUpDate;

    // Add activity log
    lead.activityTimeline.unshift({
      date: new Date(),
      title: `Follow-up Scheduled: ${followUpItem.followUpType}`,
      description: `Follow-up set for ${new Date(followUpItem.followUpDate).toLocaleDateString()} ${followUpItem.followUpTime} (${remarks || 'No remarks'})`,
      author: assignedEmployee || "Sales Executive",
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: "Follow-up logged successfully",
      data: lead,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update Follow-up status
router.put("/:id/followup/:followupId", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const subDoc = lead.followUps.id(req.params.followupId);
    if (!subDoc) {
      return res.status(404).json({ success: false, message: "Follow-up record not found" });
    }

    if (req.body.status) subDoc.status = req.body.status;
    if (req.body.remarks) subDoc.remarks = req.body.remarks;

    lead.activityTimeline.unshift({
      date: new Date(),
      title: `Follow-up ${subDoc.status}`,
      description: `${subDoc.followUpType} marked as ${subDoc.status}. Remarks: ${subDoc.remarks || 'None'}`,
      author: subDoc.assignedEmployee || "System",
    });

    await lead.save();
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Convert Lead to Customer (Lead LD-00001 -> Customer CUS-00001)
router.post("/:id/convert-to-customer", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (lead.convertedToCustomer && lead.convertedCustomerId) {
      const existingCust = await Customer.findById(lead.convertedCustomerId);
      if (existingCust) {
        return res.json({
          success: true,
          message: "Lead was already converted to Customer",
          data: existingCust,
          lead,
        });
      }
    }

    const customerId = await generateNextCustomerId();

    const newCustomer = new Customer({
      customerId,
      companyName: lead.companyName || lead.leadName,
      customerName: lead.contactPerson || lead.leadName,
      phone: lead.phone,
      email: lead.email || "",
      city: "Ahmedabad",
      state: "Gujarat",
      customerType: "Commercial Retailer",
      status: "Active",
      outstandingBalance: 0,
      creditLimit: 250000,
    });

    const savedCustomer = await newCustomer.save();

    lead.status = "Won";
    lead.convertedToCustomer = true;
    lead.convertedCustomerId = savedCustomer._id.toString();

    lead.activityTimeline.unshift({
      date: new Date(),
      title: "Converted to Customer",
      description: `Customer record ${savedCustomer.customerId} (${savedCustomer.companyName}) created from Lead ${lead.leadId}.`,
      author: "System",
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: `Successfully converted Lead ${lead.leadId} to Customer ${savedCustomer.customerId}!`,
      data: savedCustomer,
      lead,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Lead
router.delete("/:id", async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);
    if (!deletedLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }
    res.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
