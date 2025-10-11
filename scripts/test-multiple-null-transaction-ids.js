// Script to test creating multiple payments with null transactionId
const mongoose = require("mongoose");

// Define Payment schema
const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hackathons",
    required: true,
  },
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registration",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["PayPal", "Credit Card", "Debit Card", "Bank Transfer"],
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    default: "Hackathon registration fee",
  },
}, {
  timestamps: true,
});

const Payment = mongoose.model("TestPayment", paymentSchema);

async function testMultipleNullTransactionIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem");
    console.log("Connected to MongoDB");
    
    console.log("Testing creation of multiple payments with null transactionId...");
    
    // Get a test user and hackathon ID
    const testUserId = "6721d1d67a324b1ea745a862";
    const testHackathonId = "68dbc887df175103486c5362";
    const testRegistrationId = "68ea2d899b20cb39a3170f5c";
    
    // Try to create multiple payments with null transactionId
    const payments = [];
    for (let i = 0; i < 3; i++) {
      try {
        const payment = new Payment({
          user: testUserId,
          hackathon: testHackathonId,
          registration: testRegistrationId,
          amount: 100 + i * 10,
          paymentMethod: "PayPal",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          description: `Test payment ${i + 1}`,
          // transactionId is not set, so it will be null
        });
        
        const savedPayment = await payment.save();
        payments.push(savedPayment);
        console.log(`✅ Created payment ${i + 1} with ID: ${savedPayment._id}`);
      } catch (error) {
        console.log(`❌ Failed to create payment ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`\nSuccessfully created ${payments.length} payments with null transactionId`);
    
    // Clean up test payments
    console.log("\nCleaning up test payments...");
    for (const payment of payments) {
      await Payment.findByIdAndDelete(payment._id);
      console.log(`Deleted test payment: ${payment._id}`);
    }
    
    console.log("\n🎉 Test completed successfully!");
    console.log("Multiple payments with null transactionId can now be created.");
    
  } catch (error) {
    console.error("Error testing multiple null transactionIds:", error);
  } finally {
    mongoose.connection.close();
  }
}

testMultipleNullTransactionIds();
