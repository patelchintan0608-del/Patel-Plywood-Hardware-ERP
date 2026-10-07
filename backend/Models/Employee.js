import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    employeeType: {
      type: String,
      enum: ["quotation_employee", "delivery_employee", "general_employee"],
      required: true,
      default: "quotation_employee",
    },

    department: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      default: "Quotation Executive",
    },

    role: {
      type: String,
      default: "quotation_employee",
    },

    username: {
      type: String,
    },

    password: {
      type: String,
      default: "Password@123",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "Active", "Inactive", "On Leave"],
      default: "active",
      lowercase: true,
    },

    permissions: {
      dashboard: { type: Boolean, default: true },
      customers: { type: Boolean, default: true },
      quotations: { type: Boolean, default: true },
      salesOrders: { type: Boolean, default: true },
      inventory: { type: Boolean, default: false },
      purchase: { type: Boolean, default: false },
      accounts: { type: Boolean, default: false },
      employees: { type: Boolean, default: false },
    },

    attendanceLogs: [
      {
        date: { type: String },
        checkIn: { type: String },
        checkOut: { type: String },
        status: { type: String, default: "Present" },
        workingHours: { type: String },
      },
    ],

    leaveRequests: [
      {
        leaveId: { type: String },
        type: { type: String },
        fromDate: { type: String },
        toDate: { type: String },
        reason: { type: String },
        status: { type: String, default: "Pending" },
        appliedOn: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure name sync & password hash
employeeSchema.pre("save", async function () {
  if (!this.name && this.fullName) {
    this.name = this.fullName;
  }
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0];
  }
  if (this.isModified("password")) {
    if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
});

// Compare Password method
employeeSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return bcrypt.compare(password, this.password);
  }
  return this.password === password;
};

employeeSchema.methods.matchPassword = async function (password) {
  return this.comparePassword(password);
};

const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
