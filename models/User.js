import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
