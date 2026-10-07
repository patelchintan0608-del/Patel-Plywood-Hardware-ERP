import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String },
    name: { type: String },
    sku: { type: String },
    category: { type: String, default: "Sunmica" },
    price: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    unit: { type: String, default: "Sheet (8x4 ft)" },
    thickness: { type: String },
    finish: { type: String },
    status: {
      type: String,
      default: "In Stock",
    },
    description: { type: String },
  },
  { timestamps: true }
);

productSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Product = mongoose.models.Product ? mongoose.model("Product") : mongoose.model("Product", productSchema);

export default Product;
