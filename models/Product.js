import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    dosage: { type: String, default: "" },
    safetyInformation: { type: String, default: "" },
    prescriptionRequired: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
