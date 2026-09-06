import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin, requireUser } from "@/lib/auth";
import { uploadBufferToCloudinary, validateUploadFile } from "@/lib/cloudinary";
import Prescription from "@/models/Prescription";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) {
    return error;
  }

  try {
    await dbConnect();
    const filter = user.role === "admin" ? {} : { user: user.id };
    const prescriptions = await Prescription.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return jsonResponse({ prescriptions });
  } catch {
    return jsonResponse({ message: "Unable to load prescriptions." }, 500);
  }
}

export async function POST(request) {
  const { user, error } = await requireUser();
  if (error) {
    return error;
  }

  try {
    const formData = await request.formData();
    const note = String(formData.get("note") || "").trim();
    const file = formData.get("file");

    const fileError = validateUploadFile(file, {
      maxBytes: 8 * 1024 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    });
    if (fileError) {
      return jsonResponse({ message: fileError }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadBufferToCloudinary(buffer, {
      folder: "mediquick/prescriptions",
      resource_type: file.type === "application/pdf" ? "raw" : "image"
    });

    await dbConnect();
    const prescription = await Prescription.create({
      user: user.id,
      fileUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
      note,
      status: "Pending"
    });

    return jsonResponse({
      message: "Prescription uploaded. It is pending pharmacy review.",
      prescription
    }, 201);
  } catch (error) {
    const message = error.message?.includes("Cloudinary")
      ? "Prescription storage is not configured yet."
      : "Unable to upload this prescription.";
    return jsonResponse({ message }, 500);
  }
}
