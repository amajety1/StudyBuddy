import mongoose from 'mongoose';
import ChatRoom from './models/ChatRoom.js';
import Message from './models/Message.js';
import User from './models/User.js';
import Notification from './models/Notification.js';

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/StudyBuddy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection Error:', err));

// Using the actual chatroom ID from your database
const chatroomId = '67744e1c385c7ddee02ebc46'; // Your existing chatroom ID
const messagesToInsert = [
    {
        sender: '6774115dc1dfbb47a9e1d1e4', // First participant
        content: 'Hey, how are you doing?',
    },
    {
        sender: '67743a3d911de7e2d2d2c8cf', // Second participant
        content: "I'm good, thanks! How about you?",
    },
    {
        sender: '6774115dc1dfbb47a9e1d1e4', // First participant
        content: 'Doing great, just working on some projects.',
    },
];

const userId = "6776b0af9c5c68e0ff8cad70"; // Replace with the actual user ID
const user = await User.findById(userId).populate("notifications");
console.log("Populated user notifications:", user.notifications);