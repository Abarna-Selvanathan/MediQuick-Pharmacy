import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["New", "In Progress", "Resolved"], default: "New" }
  },
  { timestamps: true }
);

export default mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
