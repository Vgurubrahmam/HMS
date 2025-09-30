import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  id: string;
  username: string;
  email: string;
  phone?: string;
  branch?: string;
  year?: string;
  gender?: string;
  github?: string;
  profile?:string
}

const ProfileSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  branch: { type: String },
  year: { type: String },
  gender: { type: String },
  github: { type: String },
  image:{type:String}
});

const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
export default Profile;
