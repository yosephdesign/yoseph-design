import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "./models/Product.js";
import { StudioModel } from "./models/StudioModel.js";
import { PRODUCTS } from "./data/products.js";
import { STUDIO_MODELS } from "./data/studioModels.js";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to your .env file.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB Atlas");

  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    const productsToInsert = PRODUCTS.map(({ id: _id, ...rest }) => rest);
    await Product.insertMany(productsToInsert);
    console.log(`Seeded ${productsToInsert.length} products`);
  } else {
    console.log(
      `Skipped product seeding — ${existingProducts} products already exist`
    );
  }

  const existingModels = await StudioModel.countDocuments();
  if (existingModels === 0) {
    const modelsToInsert = STUDIO_MODELS.map(({ id: _id, ...rest }) => rest);
    await StudioModel.insertMany(modelsToInsert);
    console.log(`Seeded ${modelsToInsert.length} studio models`);
  } else {
    console.log(
      `Skipped studio model seeding — ${existingModels} models already exist`
    );
  }

  await mongoose.disconnect();
  console.log("Seed complete. Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
