import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    name: { type: String },
    sku: { type: String, required: true },
    category: { type: String, default: "Sunmica" },
    price: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    unit: { type: String, default: "Sheet (8x4 ft)" },
    status: {
      type: String,
      default: "In Stock",
    },
    warehouseLocation: { type: String, default: "Main Warehouse - Bay A" },
    description: { type: String },
  },
  { timestamps: true }
);

stockSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Stock = mongoose.models.Stock ? mongoose.model("Stock") : mongoose.model("Stock", stockSchema);

export default Stock;
