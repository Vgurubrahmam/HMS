// Script to check transactionId values in payments collection
const mongoose = require("mongoose");

async function checkTransactionIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem");
    console.log("Connected to MongoDB");
    
    console.log("Checking transactionId values in payments collection...");
    
    // Get all payments
    const allPayments = await mongoose.connection.db.collection('payments').find({}).toArray();
    console.log(`Total payments in database: ${allPayments.length}`);
    
    // Check transactionId values
    const nullTransactionIds = allPayments.filter(p => p.transactionId === null || p.transactionId === undefined);
    const validTransactionIds = allPayments.filter(p => p.transactionId && p.transactionId !== null);
    
    console.log(`Payments with null/undefined transactionId: ${nullTransactionIds.length}`);
    console.log(`Payments with valid transactionId: ${validTransactionIds.length}`);
    
    if (nullTransactionIds.length > 0) {
      console.log("\nPayments with null transactionId:");
      nullTransactionIds.forEach((payment, index) => {
        console.log(`${index + 1}. Payment ID: ${payment._id}, User: ${payment.user}, Amount: ${payment.amount}, Status: ${payment.status}`);
      });
    }
    
    if (validTransactionIds.length > 0) {
      console.log("\nPayments with valid transactionId:");
      validTransactionIds.forEach((payment, index) => {
        console.log(`${index + 1}. Payment ID: ${payment._id}, TransactionId: ${payment.transactionId}, Status: ${payment.status}`);
      });
    }
    
    // Check for duplicate transactionIds
    const transactionIdCounts = {};
    allPayments.forEach(payment => {
      const tid = payment.transactionId;
      if (tid) {
        transactionIdCounts[tid] = (transactionIdCounts[tid] || 0) + 1;
      }
    });
    
    const duplicates = Object.entries(transactionIdCounts).filter(([tid, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log("\nDuplicate transactionIds found:");
      duplicates.forEach(([tid, count]) => {
        console.log(`TransactionId: ${tid}, Count: ${count}`);
      });
    } else {
      console.log("\nNo duplicate transactionIds found");
    }
    
  } catch (error) {
    console.error("Error checking transactionIds:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkTransactionIds();
