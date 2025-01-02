import mongoose from 'mongoose';
const { Schema } = mongoose;

const MessageSchema = new Schema({
    content: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatRoom: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;