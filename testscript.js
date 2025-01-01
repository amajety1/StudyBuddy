import mongoose from 'mongoose';
import ChatRoom from './models/ChatRoom.js';
import Message from './models/Message.js';

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

const insertMessages = async () => {
    try {
        // Insert messages into the Message collection
        const insertedMessages = await Message.insertMany(
            messagesToInsert.map(message => ({
                ...message,
                timestamp: new Date(), // Add timestamp to each message
            }))
        );

        // Extract message IDs
        const messageIds = insertedMessages.map(msg => msg._id);

        // Update the chatroom with the message IDs
        const updatedChatRoom = await ChatRoom.findByIdAndUpdate(
            chatroomId,
            {
                $push: { messages: { $each: messageIds } },
                $set: { lastUpdated: new Date() },
            },
            { new: true }
        );

        console.log('Messages inserted successfully:', insertedMessages);
        console.log('Chatroom updated successfully:', updatedChatRoom);

        // Verify the update by fetching the chatroom
        const verifiedChatRoom = await ChatRoom.findById(chatroomId).populate('messages');
        console.log('Verified chatroom state:', verifiedChatRoom);
    } catch (error) {
        console.error('Error inserting messages:', error);
    } finally {
        // Close the database connection
        mongoose.connection.close();
    }
};

insertMessages();
