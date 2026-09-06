import dbConnect from "@/lib/db";
import { jsonResponse, requireAdmin } from "@/lib/auth";
import { uploadBufferToCloudinary, validateUploadFile } from "@/lib/cloudinary";
import { toNumber } from "@/lib/validators";
import Product from "@/models/Product";

function publicProduct(product) {
  return product;
}

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

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const limit = toNumber(searchParams.get("limit"));
    const query = Product.find().sort({ createdAt: 1 });
    if (Number.isFinite(limit) && limit > 0) {
      query.limit(limit);
    }
    const products = await query;
    return jsonResponse({ products: products.map(publicProduct) });
  } catch (error) {
    const message =
      error.message?.includes("MONGODB_URI")
        ? "The database is not configured yet."
        : "Unable to load products.";
    return jsonResponse({ message, products: [] }, 500);
  }
}

export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) {
    return error;
  }

  try {
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
    const imageData = await maybeUploadImage(formData);

    const product = await Product.create({
      name,
      description,
      category,
      dosage,
      safetyInformation,
      price,
      stock,
      prescriptionRequired,
      image: imageData?.image || "",
      imagePublicId: imageData?.imagePublicId || ""
    });

    return jsonResponse({ message: "Product created.", product }, 201);
  } catch (error) {
    return jsonResponse({ message: error.message || "Unable to create product." }, 400);
  }
}
