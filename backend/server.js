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

// Configured allowed origins for CORS (Local development + Vercel / Production domains)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

// Add URLs from CLIENT_URL or FRONTEND_URL env vars (supports comma-separated list)
const envUrls = [process.env.CLIENT_URL, process.env.FRONTEND_URL].filter(Boolean);
envUrls.forEach((entry) => {
  entry.split(",").forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, "");
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
});

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Render health checks)
    if (!origin) return callback(null, true);

    const originClean = origin.replace(/\/+$/, "");

    // Match exact listed origins or any vercel.app deployment / preview branch
    const isAllowed =
      allowedOrigins.includes(originClean) ||
      /\.vercel\.app$/.test(originClean) ||
      process.env.NODE_ENV !== "production";

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      callback(new Error(`CORS blocked: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
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