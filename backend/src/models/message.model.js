import mongoose from 'mongoose';

//message Schema definition
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
},
    { timestamps: true })

//creating the message model
const Message = mongoose.model("Message",messageSchema);
export default Message;
