import mongoose from "mongoose";
const {Schema} = mongoose;

const NotificationSchema = new Schema({
    content: {type: String, required: true},
    date: {type: Date, default: Date.now},
    seen: {type: Boolean, default: false},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    type: {type: String, required: true, enum: ['buddy_request', 'message', 'group_invite']},
});

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;