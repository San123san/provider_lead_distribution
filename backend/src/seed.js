import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/mongoDatabase.js";
import { Provider } from "./models/provider.model.js";

dotenv.config({ path: './.env' });

const providersData = [
  { providerId: 1, name: "Provider 1", mandatoryFor: ["Service 1", "Service 3"], poolFor: [] },
  { providerId: 2, name: "Provider 2", mandatoryFor: [], poolFor: ["Service 1", "Service 3"] },
  { providerId: 3, name: "Provider 3", mandatoryFor: [], poolFor: ["Service 1", "Service 3"] },
  { providerId: 4, name: "Provider 4", mandatoryFor: ["Service 3"], poolFor: ["Service 1"] },
  { providerId: 5, name: "Provider 5", mandatoryFor: ["Service 2"], poolFor: ["Service 3"] },
  { providerId: 6, name: "Provider 6", mandatoryFor: [], poolFor: ["Service 2", "Service 3"] },
  { providerId: 7, name: "Provider 7", mandatoryFor: [], poolFor: ["Service 2", "Service 3"] },
  { providerId: 8, name: "Provider 8", mandatoryFor: [], poolFor: ["Service 2", "Service 3"] },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Clearing old providers...");
    await Provider.deleteMany({});
    
    console.log("Inserting seed data...");
    await Provider.insertMany(providersData);
    
    console.log("Seed data inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedDatabase();