import mongoose from "mongoose";
const { Schema } = mongoose;


const courseSchema = new Schema({
    prefix: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    }, 
    name: {
        type: String,
        required: true,
    }
});

export default mongoose.model('Course', courseSchema);