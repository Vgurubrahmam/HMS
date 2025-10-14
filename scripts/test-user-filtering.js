// Script to test user filtering in API endpoints
const mongoose = require("mongoose");

async function testUserFiltering() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem");
    console.log("Connected to MongoDB");
    
    console.log("Testing user filtering in API endpoints...");
    
    // Test 1: Check if payments are properly filtered by user
    console.log("\n1. Testing payments filtering...");
    
    // Get all payments
    const allPayments = await mongoose.connection.db.collection('payments').find({}).toArray();
    console.log(`Total payments in database: ${allPayments.length}`);
    
    if (allPayments.length > 0) {
      const firstPayment = allPayments[0];
      const userId = firstPayment.user;
      console.log(`Testing with user ID: ${userId}`);
      
      // Get payments for this specific user
      const userPayments = await mongoose.connection.db.collection('payments').find({ user: userId }).toArray();
      console.log(`Payments for user ${userId}: ${userPayments.length}`);
      
      // Get payments for a different user (if exists)
      const otherPayments = allPayments.filter(p => p.user.toString() !== userId.toString());
      if (otherPayments.length > 0) {
        const otherUserId = otherPayments[0].user;
        const otherUserPayments = await mongoose.connection.db.collection('payments').find({ user: otherUserId }).toArray();
        console.log(`Payments for different user ${otherUserId}: ${otherUserPayments.length}`);
      }
    }
    
    // Test 2: Check if registrations are properly filtered by user
    console.log("\n2. Testing registrations filtering...");
    
    const allRegistrations = await mongoose.connection.db.collection('registrations').find({}).toArray();
    console.log(`Total registrations in database: ${allRegistrations.length}`);
    
    if (allRegistrations.length > 0) {
      const firstRegistration = allRegistrations[0];
      const userId = firstRegistration.user;
      console.log(`Testing with user ID: ${userId}`);
      
      const userRegistrations = await mongoose.connection.db.collection('registrations').find({ user: userId }).toArray();
      console.log(`Registrations for user ${userId}: ${userRegistrations.length}`);
    }
    
    
  } catch (error) {
    console.error("Error testing user filtering:", error);
  } finally {
    mongoose.connection.close();
  }
}

testUserFiltering();
