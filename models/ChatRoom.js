import mongoose from 'mongoose';

// ChatRoom Schema
const chatRoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users in the chat
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // Messages in the chat
  lastUpdated: { type: Date, default: Date.now }, // Last activity in the chat
});

// Create ChatRoom Model
const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
