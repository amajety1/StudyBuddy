import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  // Basic Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }

});



const User = model('User', userSchema);
export default User;
