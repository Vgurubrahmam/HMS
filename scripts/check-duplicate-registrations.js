// Script to check and clean up duplicate registrations
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/hackathonmanagementsystem");

// Define Registration schema
const registrationSchema = new mongoose.Schema({
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
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: false,
  },
});

const Registration = mongoose.model("Registration", registrationSchema);

async function checkDuplicateRegistrations() {
  try {
    console.log("Checking for duplicate registrations...");
    
    // Find all registrations
    const registrations = await Registration.find({});
    console.log(`Total registrations: ${registrations.length}`);
    
    // Group by user and hackathon
    const grouped = {};
    const duplicates = [];
    
    registrations.forEach(reg => {
      const key = `${reg.user}_${reg.hackathon}`;
      if (grouped[key]) {
        duplicates.push(reg);
        console.log(`Duplicate found: User ${reg.user}, Hackathon ${reg.hackathon}`);
      } else {
        grouped[key] = reg;
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate registrations`);
      console.log("Duplicates:", duplicates.map(d => ({
        id: d._id,
        user: d.user,
        hackathon: d.hackathon,
        paymentStatus: d.paymentStatus,
        registrationDate: d.registrationDate
      })));
      
      // Ask if user wants to remove duplicates (keep the first one)
      console.log("\nTo remove duplicates, uncomment the deletion code below");
      // await Registration.deleteMany({ _id: { $in: duplicates.map(d => d._id) } });
      // console.log("Duplicates removed");
    } else {
      console.log("No duplicate registrations found");
    }
    
  } catch (error) {
    console.error("Error checking duplicates:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkDuplicateRegistrations();
