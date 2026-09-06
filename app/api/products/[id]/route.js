import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin } from "@/lib/auth";
import { uploadBufferToCloudinary, validateUploadFile } from "@/lib/cloudinary";
import { toNumber } from "@/lib/validators";
import Product from "@/models/Product";

async function maybeUploadImage(formData) {
  const file = formData.get("image");
  if (!file || typeof file === "string" || !file.size) {
    return null;
  }

  const fileError = validateUploadFile(file, {
    maxBytes: 5 * 1024 * 1024,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"]
  });
  if (fileError) {
    throw new Error(fileError);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadBufferToCloudinary(buffer, {
    folder: "mediquick/products"
  });

  return { image: uploaded.secure_url, imagePublicId: uploaded.public_id };
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid product ID." }, 400);
    }

    await dbConnect();
    const product = await Product.findById(id);
    if (!product) {
      return jsonResponse({ message: "Product not found." }, 404);
    }

    return jsonResponse({ product });
  } catch {
    return jsonResponse({ message: "Unable to load this product." }, 500);
  }
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid product ID." }, 400);
    }

    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const dosage = String(formData.get("dosage") || "").trim();
    const safetyInformation = String(formData.get("safetyInformation") || "").trim();
    const price = toNumber(formData.get("price"));
    const stock = toNumber(formData.get("stock"));
    const prescriptionRequired = formData.get("prescriptionRequired") === "true";

    if (!name || !description || !category) {
      return jsonResponse({ message: "Name, description, and category are required." }, 400);
    }

    if (!Number.isFinite(price) || price < 0) {
      return jsonResponse({ message: "Enter a valid price that is not negative." }, 400);
    }

    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      return jsonResponse({ message: "Stock must be a whole number of zero or more." }, 400);
    }

    await dbConnect();
    const product = await Product.findById(id);
    if (!product) {
      return jsonResponse({ message: "Product not found." }, 404);
    }

    const imageData = await maybeUploadImage(formData);

    product.name = name;
    product.description = description;
    product.category = category;
    product.dosage = dosage;
    product.safetyInformation = safetyInformation;
    product.price = price;
    product.stock = stock;
    product.prescriptionRequired = prescriptionRequired;
    if (imageData) {
      product.image = imageData.image;
      product.imagePublicId = imageData.imagePublicId;
    }

    await product.save();
    return jsonResponse({ message: "Product updated.", product });
  } catch (error) {
    return jsonResponse({ message: error.message || "Unable to update product." }, 400);
  }
}

export async function DELETE(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonResponse({ message: "Invalid product ID." }, 400);
    }

    await dbConnect();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return jsonResponse({ message: "Product not found." }, 404);
    }

    return jsonResponse({ message: "Product deleted." });
  } catch {
    return jsonResponse({ message: "Unable to delete product." }, 500);
  }
}
