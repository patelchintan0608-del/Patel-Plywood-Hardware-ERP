import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import quotationRoutes from "./Routes/QuotationRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import customerRoutes from "./Routes/customerRoutes.js";
import orderRoutes from "./Routes/orderRoutes.js";
import deliveryRoutes from "./Routes/diliveryRoutes.js";
import dispatchRoutes from "./Routes/dispatchRoutes.js";
import stockRoutes from "./Routes/stockRoutes.js";
import inquiryRoutes from "./Routes/inquiryRoutes.js";
import leadRoutes from "./Routes/leadRoutes.js";
import authRoutes from "./Routes/AuthRoutes.js";
import employeeRoutes from "./Routes/employeeRoutes.js";
import { seedDatabase } from "./seedData.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/leads", leadRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Furniture ERP Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });