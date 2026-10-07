import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "quotation_employee",
        "delivery_employee",
        "sales_employee",
        "inventory_employee",
        "account_employee",
        "manager",
      ],
      required: true,
      default: "admin",
    },

    department: {
      type: String,
      default: "",
    },

    permissions: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook for password hashing & fallback defaults
userSchema.pre("save", async function (next) {
  if (!this.name) {
    this.name = this.email ? this.email.split("@")[0] : "User";
  }

  if (this.isModified("password")) {
    if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  if (typeof next === "function") {
    next();
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return bcrypt.compare(enteredPassword, this.password);
  }
  return this.password === enteredPassword;
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return this.comparePassword(enteredPassword);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
