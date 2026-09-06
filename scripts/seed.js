import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Product from "../models/Product.js";
import User from "../models/User.js";

const products = [
  {
    name: "Paracetamol",
    description: "Common pharmacy pack for general household use. Always read the label and follow the supplied instructions.",
    price: 2.49,
    category: "Pain Relief",
    stock: 80,
    dosage: "Use only as directed on the product packaging or by a healthcare professional.",
    safetyInformation: "Keep out of reach of children. Do not exceed the stated dose. Seek advice if symptoms continue.",
    prescriptionRequired: false
  },
  {
    name: "Amoxicillin",
    description: "Prescription-only antibiotic product listed for pharmacy workflow demonstration. Supply is subject to a valid prescription.",
    price: 8.99,
    category: "Prescription Medicines",
    stock: 25,
    dosage: "To be used only as prescribed.",
    safetyInformation: "Do not use without a valid prescription. Follow the prescriber and pharmacist instructions.",
    prescriptionRequired: true
  },
  {
    name: "Cetirizine",
    description: "Antihistamine tablets commonly used in pharmacy catalogues. Check the packaging for suitability before use.",
    price: 4.25,
    category: "Allergy",
    stock: 60,
    dosage: "Follow the dosage instructions on the pack unless a pharmacist or doctor advises otherwise.",
    safetyInformation: "May cause drowsiness in some people. Ask a pharmacist before use if you take other medicines.",
    prescriptionRequired: false
  },
  {
    name: "Omeprazole",
    description: "Pharmacy product associated with acid-related stomach symptoms. This listing is for catalogue purposes only.",
    price: 6.5,
    category: "Digestive Health",
    stock: 40,
    dosage: "Use according to the product information leaflet.",
    safetyInformation: "Do not use for prolonged periods without professional advice. Speak to a pharmacist if symptoms persist.",
    prescriptionRequired: false
  },
  {
    name: "Ibuprofen",
    description: "Anti-inflammatory pain relief tablets for short-term use according to the pack instructions.",
    price: 3.15,
    category: "Pain Relief",
    stock: 70,
    dosage: "Take with food if recommended on the pack. Do not exceed the stated dose.",
    safetyInformation: "Not suitable for everyone. Ask a pharmacist if you have stomach, heart, or kidney concerns.",
    prescriptionRequired: false
  },
  {
    name: "Vitamin C",
    description: "Vitamin C tablets for everyday nutritional supplement use as part of a balanced diet.",
    price: 5.99,
    category: "Vitamins & Supplements",
    stock: 90,
    dosage: "One tablet daily, or as directed on the label.",
    safetyInformation: "Food supplements should not replace a varied diet. Store in a cool, dry place.",
    prescriptionRequired: false
  },
  {
    name: "Calcium Tablets",
    description: "Calcium supplement tablets for customers who want an additional dietary calcium source.",
    price: 6.75,
    category: "Vitamins & Supplements",
    stock: 55,
    dosage: "Follow the serving suggestion on the product label.",
    safetyInformation: "Speak to a pharmacist before use if you take other medicines or have a medical condition.",
    prescriptionRequired: false
  },
  {
    name: "First Aid Kit",
    description: "A compact first aid kit containing basic wound-care items for home or travel use.",
    price: 12.5,
    category: "First Aid",
    stock: 35,
    dosage: "",
    safetyInformation: "Check contents regularly and replace used items. This kit does not replace emergency medical care.",
    prescriptionRequired: false
  }
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local before seeding.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  await Product.deleteMany({});
  await Product.insertMany(
    products.map((product) => ({
      ...product,
      image: "/images/product-placeholder.svg"
    }))
  );

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: "MediQuick Admin",
        email: adminEmail,
        password: hashedPassword,
        phone: "00000000000",
        address: "Pharmacy Office",
        role: "admin"
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log("Admin user created or updated from ADMIN_EMAIL.");
  } else {
    console.log("Skipped admin user. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local to create one.");
  }

  console.log("Seeded 8 pharmacy products.");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
