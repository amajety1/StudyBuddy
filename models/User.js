import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  techStack: { type: String },
  githubLink: { type: String }
});

const availableSessionSchema = new Schema({
  dayOfWeek: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
    required: true 
  },
  time: { 
    type: String, 
    required: true // e.g., "10:00 AM - 12:00 PM"
  },
  location: { 
    type: String, 
    required: true // e.g., "Library Room 201" or "Online"
  },
  sessionType: { 
    type: String, 
    enum: ['One-on-One', 'Group'], 
    required: true 
  },
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
  outgoingBuddyRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  incomingBuddyRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  incomingGroupRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  outgoingGroupRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],

  groups: [
    {
      group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
      isOwner: { type: Boolean, default: false },
    }
  ],
  chatrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" }], // Array of chatroom references

  // Profile Info
  github: { type: String },
  
  selectedCourses: [{
    prefix: { type: String },
    number: { type: Number },
    name: { type: String },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  }],
  previousCourses: [{
    prefix: { type: String },
    number: { type: Number },
    name: { type: String },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  }],
  projects: [projectSchema], // Array of project objects
  major: { type: String },
  degreeType: { type: String },
  bio: { type: String },
  about: { type: String },
  availableSessions: [availableSessionSchema], // Array of available session objects
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
});

const User = model('User', userSchema);
export default User;
