import mongoose from "mongoose";
import dotenv from "dotenv";
import Customer from "./Models/customer.js";
import Product from "./Models/product.js";
import Quotation from "./Models/Quotation.js";
import Order from "./Models/order.js";
import Inquiry from "./Models/Inquiry.js";
import Lead from "./Models/Lead.js";
import Admin from "./Models/Admin.js";
import User from "./Models/User.js";
import Employee from "./Models/Employee.js";

dotenv.config();

const initialSeedProducts = [
  { sku: "SUN-001", productName: "Glossy Sunmica 1.0mm", name: "Glossy Sunmica 1.0mm", category: "Sunmica", price: 1250, unitPrice: 1250, unit: "Sheet (8x4 ft)", stockQuantity: 82, stock: 82, quantity: 82, reservedQuantity: 10, reserved: 10, finish: "Glossy Royal Teak", status: "In Stock", description: "High-gloss laminated decorative sheet for luxury furniture." },
  { sku: "SUN-002", productName: "Matte Finish Sunmica 1.0mm", name: "Matte Finish Sunmica 1.0mm", category: "Sunmica", price: 1350, unitPrice: 1350, unit: "Sheet (8x4 ft)", stockQuantity: 45, stock: 45, quantity: 45, reservedQuantity: 5, reserved: 5, finish: "Matte Walnut", status: "In Stock", description: "Anti-fingerprint matte laminate sheet." },
  { sku: "SUN-003", productName: "Textured Sunmica 1.2mm", name: "Textured Sunmica 1.2mm", category: "Sunmica", price: 1550, unitPrice: 1550, unit: "Sheet (8x4 ft)", stockQuantity: 8, stock: 8, quantity: 8, reservedQuantity: 4, reserved: 4, finish: "Textured Natural Oak", status: "Low Stock", description: "Deep textured wood-grain laminate." },
  { sku: "PLY-001", productName: "Plywood 18mm Marine BWP", name: "Plywood 18mm Marine BWP", category: "Plywood", price: 2850, unitPrice: 2850, unit: "Sheet (8x4 ft)", stockQuantity: 32, stock: 32, quantity: 32, reservedQuantity: 8, reserved: 8, thickness: "18mm", status: "In Stock", description: "100% Boiling Waterproof Gurjan Plywood." },
  { sku: "MDF-001", productName: "MDF Board High Density 12mm", name: "MDF Board High Density 12mm", category: "MDF", price: 1450, unitPrice: 1450, unit: "Sheet (8x4 ft)", stockQuantity: 0, stock: 0, quantity: 0, reservedQuantity: 0, reserved: 0, thickness: "12mm", status: "Out of Stock", description: "Smooth exterior grade medium density fiberboard." },
  { sku: "HDW-001", productName: "Soft-Close Cabinet Hinges (SS 304)", name: "Soft-Close Cabinet Hinges (SS 304)", category: "Hardware", price: 480, unitPrice: 480, unit: "Pair", stockQuantity: 145, stock: 145, quantity: 145, reservedQuantity: 20, reserved: 20, finish: "Stainless Steel", status: "In Stock", description: "Hydraulic 3D soft-closing cabinet hinges." }
];

const initialSeedInquiries = [
  {
    inquiryId: "INQ-00001",
    inquiryDate: new Date("2026-10-01"),
    customerName: "Rahul Patel",
    companyName: "Rahul Furniture",
    phone: "9876543210",
    email: "rahul@gmail.com",
    source: "Website",
    product: "Conference Table",
    category: "Office Furniture",
    quantity: 5,
    estimatedBudget: 150000,
    requirement: "Custom wooden conference table with cable routing",
    priority: "High",
    assignedTo: "Sales Executive",
    status: "New",
    expectedDate: new Date("2026-10-15"),
    remarks: "Customer requested pricing & catalog",
  },
  {
    inquiryId: "INQ-00002",
    inquiryDate: new Date("2026-10-02"),
    customerName: "Priya Sharma",
    companyName: "Urban Living Interiors",
    phone: "9823456789",
    email: "priya@urbanliving.com",
    source: "Instagram",
    product: "Modular Sofa Set",
    category: "Furniture",
    quantity: 3,
    estimatedBudget: 220000,
    requirement: "Premium velvet finish L-shaped modular sofas",
    priority: "High",
    assignedTo: "Amit Sharma",
    status: "Contacted",
    expectedDate: new Date("2026-10-18"),
    remarks: "Call done, shared design portfolio",
  },
  {
    inquiryId: "INQ-00003",
    inquiryDate: new Date("2026-10-02"),
    customerName: "Vikram Mehta",
    companyName: "Apex Corporate Solutions",
    phone: "9711223344",
    email: "vikram@apex.in",
    source: "WhatsApp",
    product: "Ergonomic Office Chairs",
    category: "Office Furniture",
    quantity: 20,
    estimatedBudget: 180000,
    requirement: "High-back mesh chairs for corporate office",
    priority: "Medium",
    assignedTo: "Neha Gupta",
    status: "Under Review",
    expectedDate: new Date("2026-10-20"),
    remarks: "Checking sample availability in warehouse",
  },
  {
    inquiryId: "INQ-00004",
    inquiryDate: new Date("2026-09-28"),
    customerName: "Rajesh Shah",
    companyName: "Shah Furniture World",
    phone: "9898001122",
    email: "rajesh@shahfurniture.com",
    source: "Referral",
    product: "BWP Marine Plywood 18mm",
    category: "Plywood",
    quantity: 50,
    estimatedBudget: 142500,
    requirement: "Bulk supply for commercial project",
    priority: "High",
    assignedTo: "Sales Executive",
    status: "Converted to Lead",
    convertedToLead: true,
    expectedDate: new Date("2026-10-12"),
    remarks: "Converted to Lead LD-00001",
  },
];

const initialSeedLeads = [
  {
    leadId: "LD-00001",
    leadName: "Rahul Furniture",
    contactPerson: "Rahul Patel",
    companyName: "Rahul Furniture",
    phone: "9876543210",
    email: "rahul@example.com",
    source: "Website",
    productInterest: "Modular Sofa",
    category: "Furniture",
    estimatedValue: 85000,
    assignedTo: "Sales Executive",
    status: "Qualified",
    priority: "High",
    expectedClosingDate: new Date("2026-10-15"),
    notes: "Interested in custom design with royal teak finish.",
    inquiryId: "INQ-00001",
    followUps: [
      {
        followUpDate: new Date("2026-10-05T11:30:00"),
        followUpTime: "11:30 AM",
        followUpType: "Phone Call",
        assignedEmployee: "Amit",
        remarks: "Discuss sofa customization and fabric options",
        status: "Pending",
      },
      {
        followUpDate: new Date("2026-10-02T15:00:00"),
        followUpTime: "03:00 PM",
        followUpType: "WhatsApp",
        assignedEmployee: "Sales Executive",
        remarks: "Sent catalog and color options PDF",
        status: "Completed",
      },
    ],
    activityTimeline: [
      { date: new Date("2026-10-01"), title: "Lead Created", description: "Lead created from Website inquiry", author: "System" },
      { date: new Date("2026-10-02"), title: "Customer Contacted", description: "Initial call done by Amit. Customer requested quotation.", author: "Amit" },
      { date: new Date("2026-10-03"), title: "Customer Requested Quotation", description: "Custom dimensions received.", author: "Rahul Patel" },
      { date: new Date("2026-10-04"), title: "Quotation Created", description: "Quotation QN-0001 created for ₹85,000", author: "Sales" },
    ],
  },
  {
    leadId: "LD-00002",
    leadName: "Modern Workspaces Ltd",
    contactPerson: "Anil Verma",
    companyName: "Modern Workspaces Ltd",
    phone: "9819876543",
    email: "anil@modernworkplaces.com",
    source: "Walk-in",
    productInterest: "Executive Office Desks",
    category: "Office Furniture",
    estimatedValue: 340000,
    assignedTo: "Neha Gupta",
    status: "Proposal / Quotation",
    priority: "High",
    expectedClosingDate: new Date("2026-10-20"),
    notes: "Visited showroom. Quotation sent for 10 executive desks.",
    followUps: [
      {
        followUpDate: new Date("2026-10-06T14:00:00"),
        followUpTime: "02:00 PM",
        followUpType: "Site Visit",
        assignedEmployee: "Neha Gupta",
        remarks: "Site measurement for executive cabins",
        status: "Pending",
      },
    ],
    activityTimeline: [
      { date: new Date("2026-09-29"), title: "Walk-in Visit", description: "Customer visited main showroom.", author: "Neha Gupta" },
      { date: new Date("2026-10-01"), title: "Proposal Sent", description: "Detailed design proposal submitted.", author: "Neha Gupta" },
    ],
  },
  {
    leadId: "LD-00003",
    leadName: "Elite Wooden Decor",
    contactPerson: "Sunil Trivedi",
    companyName: "Elite Wooden Decor",
    phone: "9920112233",
    email: "sunil@elitedecor.com",
    source: "Google",
    productInterest: "Glossy Sunmica 1.0mm",
    category: "Sunmica",
    estimatedValue: 120000,
    assignedTo: "Amit Sharma",
    status: "Negotiation",
    priority: "Medium",
    expectedClosingDate: new Date("2026-10-18"),
    notes: "Negotiating 5% bulk discount for 100 sheets.",
    followUps: [
      {
        followUpDate: new Date("2026-10-07T10:30:00"),
        followUpTime: "10:30 AM",
        followUpType: "Phone Call",
        assignedEmployee: "Amit Sharma",
        remarks: "Final discount confirmation call",
        status: "Pending",
      },
    ],
    activityTimeline: [
      { date: new Date("2026-09-25"), title: "Inquiry Received", description: "Google Search lead", author: "System" },
      { date: new Date("2026-09-28"), title: "Sample Delivered", description: "Laminate swatch book sent", author: "Logistics" },
    ],
  },
  {
    leadId: "LD-00004",
    leadName: "Royal Residency Suites",
    contactPerson: "Kavita Shah",
    companyName: "Royal Residency Suites",
    phone: "9765432109",
    email: "kavita@royalresidency.com",
    source: "Exhibition",
    productInterest: "Teak Finish Bedroom Sets",
    category: "Furniture",
    estimatedValue: 650000,
    assignedTo: "Sales Executive",
    status: "Won",
    priority: "High",
    expectedClosingDate: new Date("2026-10-01"),
    convertedToCustomer: true,
    convertedCustomerId: "CUS-00001",
    notes: "Contract signed! Converted to Customer.",
    followUps: [],
    activityTimeline: [
      { date: new Date("2026-09-15"), title: "Met at Trade Fair", description: "Exhibition stall inquiry", author: "Sales" },
      { date: new Date("2026-09-28"), title: "Contract Finalized", description: "Payment terms agreed: 50% advance", author: "Sales" },
      { date: new Date("2026-10-01"), title: "Converted to Customer", description: "Created Customer CUS-00001", author: "System" },
    ],
  },
  {
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
    notes: "Inquired for 250 sheets of 19mm Commercial Teak Plywood via website inquiry form.",
    followUps: [
      {
        followUpDate: new Date("2026-10-08T11:00:00"),
        followUpTime: "11:00 AM",
        followUpType: "Phone Call",
        assignedEmployee: "Sales Executive",
        remarks: "Schedule intro call & send product catalog",
        status: "Pending",
      }
    ],
    activityTimeline: [
      { date: new Date("2026-10-06"), title: "Lead Received", description: "Website inquiry for Commercial Teak Plywood", author: "System" }
    ]
  },
  {
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
    notes: "Initial phone call completed. Shared product specifications and price list.",
    followUps: [
      {
        followUpDate: new Date("2026-10-07T14:30:00"),
        followUpTime: "02:30 PM",
        followUpType: "WhatsApp",
        assignedEmployee: "Amit Sharma",
        remarks: "Follow up on sample box delivery",
        status: "Pending",
      }
    ],
    activityTimeline: [
      { date: new Date("2026-10-05"), title: "Lead Received", description: "WhatsApp chat inquiry", author: "System" },
      { date: new Date("2026-10-06"), title: "Initial Contact Made", description: "Discussed requirement for 150 sheets BWR Marine Plywood", author: "Amit Sharma" }
    ]
  },
];

export const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(initialSeedProducts);
      console.log("✅ Seeded initial stock items into MongoDB database!");
    }

    const inquiryCount = await Inquiry.countDocuments();
    if (inquiryCount === 0) {
      await Inquiry.insertMany(initialSeedInquiries);
      console.log("✅ Seeded initial inquiries into MongoDB database!");
    }

    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      await Lead.insertMany(initialSeedLeads);
      console.log("✅ Seeded initial leads into MongoDB database!");
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultAdmin = new Admin({
        name: "Chintan Patel",
        email: "patelchintan0608@gmail.com",
        password: "Admin@12345",
        role: "admin",
        status: "active"
      });
      await defaultAdmin.save();

      const secondaryAdmin = new Admin({
        name: "Patel Plywood Admin",
        email: "admin@patelplywood.com",
        password: "Admin@12345",
        role: "admin",
        status: "active"
      });
      await secondaryAdmin.save();
      console.log("✅ Seeded default Admin users into MongoDB database!");
    } else {
      const existingUser = await Admin.findOne({ email: "patelchintan0608@gmail.com" });
      if (!existingUser) {
        const newAdmin = new Admin({
          name: "Chintan Patel",
          email: "patelchintan0608@gmail.com",
          password: "Admin@12345",
          role: "admin",
          status: "active"
        });
        await newAdmin.save();
        console.log("✅ Created Admin user (patelchintan0608@gmail.com)!");
      }

      const existingSecondary = await Admin.findOne({ email: "admin@patelplywood.com" });
      if (!existingSecondary) {
        const secondaryAdmin = new Admin({
          name: "Patel Plywood Admin",
          email: "admin@patelplywood.com",
          password: "Admin@12345",
          role: "admin",
          status: "active"
        });
        await secondaryAdmin.save();
        console.log("✅ Created Admin user (admin@patelplywood.com)!");
      }
    }

    // Seed Sales & Quotation Employee rp2568@gmail.com
    const rpPermissions = [
      "customers.view",
      "customers.create",
      "customers.edit",
      "quotations.view",
      "quotations.create",
      "quotations.edit",
      "salesOrders.view",
      "salesOrders.create",
      "leads.view",
      "leads.create"
    ];

    let rpUser = await User.findOne({ email: "rp2568@gmail.com" });
    if (!rpUser) {
      rpUser = new User({
        employeeId: "EMP-2568",
        name: "Rahul Patel",
        email: "rp2568@gmail.com",
        password: "Patel@76281",
        role: "sales_employee",
        department: "Sales & Marketing",
        permissions: rpPermissions,
        avatar: "/RP_profile.jpg",
        status: "active"
      });
      await rpUser.save();
      console.log("✅ Seeded Employee User (rp2568@gmail.com) with Sales & Customer permissions!");
    } else {
      rpUser.password = "Patel@76281";
      rpUser.permissions = rpPermissions;
      rpUser.role = "sales_employee";
      rpUser.avatar = "/RP_profile.jpg";
      await rpUser.save();
      console.log("✅ Updated Employee User (rp2568@gmail.com) permissions & photo!");
    }

    let rpEmp = await Employee.findOne({ email: "rp2568@gmail.com" });
    if (!rpEmp) {
      rpEmp = new Employee({
        employeeId: "EMP-2568",
        fullName: "Rahul Patel",
        name: "Rahul Patel",
        email: "rp2568@gmail.com",
        phone: "9876543210",
        employeeType: "quotation_employee",
        department: "Sales",
        designation: "Sales Executive",
        role: "sales_employee",
        username: "rp2568",
        password: "Patel@76281",
        avatar: "/RP_profile.jpg",
        status: "active",
        permissions: {
          dashboard: true,
          customers: true,
          quotations: true,
          salesOrders: true,
          inventory: false,
          purchase: false,
          accounts: false,
          employees: false
        }
      });
      await rpEmp.save();
      console.log("✅ Seeded Employee Record (rp2568@gmail.com) into Employee collection!");
    }
  } catch (err) {
    console.error("Seed database error:", err);
  }
};
