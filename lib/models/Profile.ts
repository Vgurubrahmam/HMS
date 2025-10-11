import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  phone: String,
  gender: String,
  image: String,
  // Student fields
  branch: String,
  year: String,
  github: String,
  // Faculty fields
  department: String,
  designation: String,
  specialization: String,
  // Mentor fields
  expertise: [String],
  company: String,
  experience: String,
  // Coordinator fields
  managementRole: String,
  employeeId: String,
}, {
  timestamps: true,
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

export default Profile;
