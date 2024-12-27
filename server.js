import mongoose from 'mongoose';
import User from './model/User.js';

mongoose.connect("mongodb+srv://aniketstoic:y4KFChn40OuWJbW1@studybuddy.rvkwj.mongodb.net/")
console.log("MongoDB Connected...");

const user1 = new User({
    username: "aniketstoic",
    email: "aniketmajety@gmail.com",
    password: "aniketstoic"})

await user1.save();

const firstUser = await User.findOne({username: "aniketstoic"});
console.log(firstUser);