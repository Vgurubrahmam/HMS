// Script to fix the transactionId unique index to be sparse
const mongoose = require("mongoose");

async function fixTransactionIdIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem");
    console.log("Connected to MongoDB");
    
    console.log("Fixing transactionId unique index...");
    
    const db = mongoose.connection.db;
    const collection = db.collection('payments');
    
    // Drop the existing unique index on transactionId
    console.log("Dropping existing transactionId_1 index...");
    try {
      await collection.dropIndex("transactionId_1");
      console.log("✅ Successfully dropped transactionId_1 index");
    } catch (error) {
      if (error.code === 27) {
        console.log("Index transactionId_1 doesn't exist, continuing...");
      } else {
        throw error;
      }
    }
    
    // Create a new sparse unique index on transactionId
    console.log("Creating new sparse unique index on transactionId...");
    await collection.createIndex(
      { transactionId: 1 }, 
      { 
        unique: true, 
        sparse: true,
        name: "transactionId_1_sparse"
      }
    );
    console.log("✅ Successfully created sparse unique index on transactionId");
    
    // Verify the new index
    console.log("\nVerifying the new index...");
    const indexes = await collection.indexes();
    const newIndex = indexes.find(index => index.name === "transactionId_1_sparse");
    
    if (newIndex) {
      console.log("✅ New index created successfully:");
      console.log(`- Name: ${newIndex.name}`);
      console.log(`- Key: ${JSON.stringify(newIndex.key)}`);
      console.log(`- Unique: ${newIndex.unique}`);
      console.log(`- Sparse: ${newIndex.sparse}`);
    } else {
      console.log("❌ Failed to create the new index");
    }
    
    console.log("\n🎉 TransactionId index fix completed!");
    console.log("Now multiple payments can have null transactionId values.");
    
  } catch (error) {
    console.error("Error fixing transactionId index:", error);
  } finally {
    mongoose.connection.close();
  }
}

fixTransactionIdIndex();
