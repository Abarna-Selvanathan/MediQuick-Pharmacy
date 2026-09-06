import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, default: "" },
    note: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
  },
  { timestamps: true }
);

export default mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);
