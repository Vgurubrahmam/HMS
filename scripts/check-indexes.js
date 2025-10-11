// Script to check database indexes
const mongoose = require("mongoose");

async function checkIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem");
    console.log("Connected to MongoDB");
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Check indexes for registrations collection
    const registrationIndexes = await db.collection('registrations').indexes();
    console.log("\nRegistration collection indexes:");
    registrationIndexes.forEach(index => {
      console.log(`- Name: ${index.name}, Key: ${JSON.stringify(index.key)}, Unique: ${index.unique || false}`);
    });
    
    // Check if there's a unique index on user+hackathon
    const uniqueIndex = registrationIndexes.find(index => 
      index.key && 
      index.key.user === 1 && 
      index.key.hackathon === 1 && 
      index.unique === true
    );
    
    if (uniqueIndex) {
      console.log("\nFound unique index on user+hackathon combination");
      console.log("This prevents duplicate registrations for the same user and hackathon");
    } else {
      console.log("\nNo unique index found on user+hackathon combination");
    }
    
  } catch (error) {
    console.error("Error checking indexes:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkIndexes();
