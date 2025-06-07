import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Function to get users for the sidebar
export const getUserForSidebar = async (req, res) => {
    try {
        // Ensure the user is authenticated
        const loggedInUserId = req.user._id;
        // Fetch all users except the logged-in user
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")
        res.status(200).json(filteredUsers)
    }
    catch (e) {
        console.error("Error fetching users for sidebar:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Function to get messages for a specific user
export const getMessages = async (req, res) => {
    try {
        // Ensure the user is authenticated
        const { id: userToChatId } = req.params
        const myId = req.user._id;

        // Validate the userToChatId
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
        res.status(200).json(messages);
    } catch (e) {
        console.error("Error fetching messages:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Function to send a message
export const sendMessage = async (req, res) => {
    try {
        // Ensure the user is authenticated
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // Import Cloudinary configuration
            const uploadeResponse = await Cloudinary.uploader.upload(image);
            imageUrl = uploadeResponse.secure_url;
        }

        // create a new message
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();
        //todo : realtime functionality goes here using socket.io
        res.status(201).json(newMessage);
    } catch (e) {
        console.error("Error sending message:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}