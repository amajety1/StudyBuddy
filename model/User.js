import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  // Basic Information
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Encrypted

  // Profile Information
//   fullName: { type: String, required: true },
//   bio: { type: String, default: "" },
//   profilePicture: { type: String, default: "/images/default-profile.jpg" },
//   about: { type: String, default: "" },

//   // Academic Information
//   currentCourses: [String],
//   previousCourses: [String],
//   projects: [{
//     title: String,
//     description: String,
//     githubLink: String,
//     createdAt: { type: Date, default: Date.now }
    
//   }],

//   // Group Chat Information
//   groups: [{
//     groupId: { type: Schema.Types.ObjectId, ref: "Group" },
//     joinedAt: { type: Date, default: Date.now }
//   }],

//   // Buddy Connections
//   buddies: [{
//     userId: { type: Schema.Types.ObjectId, ref: "User" },
//     status: { type: String, enum: ["pending", "confirmed", "blocked"], default: "pending" }
//   }],

//   // Availability
//   availableTimes: {
//     monday: [{ start: String, end: String }],
//     tuesday: [{ start: String, end: String }],
//     wednesday: [{ start: String, end: String }],
//     thursday: [{ start: String, end: String }],
//     friday: [{ start: String, end: String }]
//   },

//   // System Fields
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update the `updatedAt` field
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = model('User', userSchema);
export default User;
