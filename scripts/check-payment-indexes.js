// Script to check indexes on payments collection
const mongoose = require("mongoose");

async function checkPaymentIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem");
    console.log("Connected to MongoDB");
    
    console.log("Checking indexes on payments collection...");
    
    const db = mongoose.connection.db;
    
    // Check indexes for payments collection
    const paymentIndexes = await db.collection('payments').indexes();
    console.log("\nPayment collection indexes:");
    paymentIndexes.forEach(index => {
      console.log(`- Name: ${index.name}, Key: ${JSON.stringify(index.key)}, Unique: ${index.unique || false}, Sparse: ${index.sparse || false}`);
    });
    
    // Check if there's a problematic unique index on transactionId
    const transactionIdIndex = paymentIndexes.find(index => 
      index.key && 
      index.key.transactionId === 1 && 
      index.unique === true
    );
    
    if (transactionIdIndex) {
      console.log("\nFound unique index on transactionId:");
      console.log(`- Sparse: ${transactionIdIndex.sparse || false}`);
      
      if (!transactionIdIndex.sparse) {
        console.log("PROBLEM: Unique index on transactionId is NOT sparse!");
        console.log("This means multiple null values are not allowed.");
        console.log("The index should be sparse to allow multiple null values.");
      } else {
        console.log(" Index is sparse - should allow multiple null values");
      }
    } else {
      console.log("\nNo unique index found on transactionId");
    }
    
  } catch (error) {
    console.error("Error checking payment indexes:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkPaymentIndexes();
