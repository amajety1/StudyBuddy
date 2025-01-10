import mongoose from "mongoose";
const {Schema} = mongoose;

const NotificationSchema = new Schema({
    content: {type: String, required: true},
    date: {type: Date, default: Date.now},
    seen: {type: Boolean, default: false},
    from_user: {type: Schema.Types.ObjectId, ref: 'User'},
    to_user: {type: Schema.Types.ObjectId, ref: 'User'},
    type: {type: String, required: true, enum: ['buddy_request', 'message', 'group_invite', 'group_join_request']},
});

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;