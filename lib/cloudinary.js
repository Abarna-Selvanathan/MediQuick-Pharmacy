import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY values to .env.local.");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    configured = true;
  }

  return cloudinary;
}

export function validateUploadFile(file, { maxBytes, allowedTypes }) {
  if (!file) {
    return "A file is required.";
  }

  if (!allowedTypes.includes(file.type)) {
    return "Invalid file type.";
  }

  if (file.size > maxBytes) {
    return "The file is too large.";
  }

  return "";
}

export async function uploadBufferToCloudinary(buffer, options) {
  const client = getCloudinary();

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });

    stream.end(buffer);
  });
}
