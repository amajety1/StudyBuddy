import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  techStack: { type: String },
  githubLink: { type: String }
});

const userSchema = new Schema({
  // Basic Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  profilePicture: { type: String, default: 'http://localhost:5001/images/default-profile.jpeg' }, // URL to profile picture
  buddies: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  chatrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" }], // Array of chatroom references
  // Profile Info
  github: { type: String },
  selectedCourses: [{ type: String }], // Array of course strings
  projects: [projectSchema], // Array of project objects

});

const User = model('User', userSchema);
export default User;
