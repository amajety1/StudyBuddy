import mongoose from 'mongoose';
const { Schema } = mongoose;

// ChatRoom Schema
const ChatRoomSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Users in the chat
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }], // Messages in the chat
    isGroupChat: {
        type: Boolean,
        default: false
    },
    groupId: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: function() { return !this.isGroupChat; }
    },
    groupName: {
        type: String,
        required: function() { return this.isGroupChat; }
    },
    groupPhoto: {
        type: String,
        default: '/images/default-group.jpeg'
    },
    chatTitle: {
        type: String,
        required: function() { return this.isGroupChat; } // Only required for group chats
    },
    lastUpdated: { type: Date, default: Date.now }, // Last activity in the chat
    unreadCounts: {
        type: Map,
        of: Number,
        default: new Map()
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Initialize unread counts for new chatrooms
ChatRoomSchema.pre('save', async function(next) {
    if (this.isNew || !this.unreadCounts) {
        this.unreadCounts = new Map();
        this.participants.forEach(participantId => {
            this.unreadCounts.set(participantId.toString(), 0);
        });
    }
    next();
});

// Method to safely get unread count for a user
ChatRoomSchema.methods.getUnreadCountForUser = function(userId) {
    return this.unreadCounts.get(userId.toString()) || 0;
};

// Method to safely set unread count for a user
ChatRoomSchema.methods.setUnreadCountForUser = function(userId, count) {
    if (!this.unreadCounts) {
        this.unreadCounts = new Map();
    }
    this.unreadCounts.set(userId.toString(), count);
};

// Method to increment unread count for a user
ChatRoomSchema.methods.incrementUnreadCountForUser = function(userId) {
    const userIdStr = userId.toString();
    if (!this.unreadCounts) {
        this.unreadCounts = new Map();
    }
    this.unreadCounts.set(userIdStr, (this.unreadCounts.get(userIdStr) || 0) + 1);
};

// Create ChatRoom Model
const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRoom;
