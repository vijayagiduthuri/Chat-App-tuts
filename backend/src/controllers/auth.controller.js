import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

//user signup
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        // Check if all fields are provided
        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creating newUser
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            //generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                }
            });
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (e) {
        console.error("Error during signup:", e.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


//user login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        //find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        //check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        //generate jwt token
        generateToken(user._id, res);
        res.status(200).json({
            message: "User logged successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            }
        });
    } catch (e) {
        console.error("Error during login:", e.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

//update password
export const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        // Get user ID from JWT token (assuming you have auth middleware)
        const userId = req.user.id;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }
        
        //find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        //check if current password is correct
        const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordCorrect) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        
        //hash the new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        
        //update password in database
        await User.findByIdAndUpdate(userId, { 
            password: hashedNewPassword,
            updatedAt: new Date()
        });
        
        res.status(200).json({
            message: "Password updated successfully",
            success: true
        });
        
    } catch (e) {
        console.error("Error during password update:", e.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

//user logout
export const logout = (req, res) => {
    try {
        // Clear the JWT cookie
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "User logged out successfully" });
    } catch (e) {
        console.error("Error during logout:", e.message);
        res.status(500).json({ message: "Internal server error" });
    }
} 


//update user profile
export const updateProfile = async (req, res) => {
    try{
        //checking the profile picture
        const {profilePic } = req.body;
        const userId = req.user._id 
        if(!profilePic){
            return res.status(400).json({ message: "Profile picture is required" });
        }

        //uploading the profile picture to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        //updating the user profile with the new profile picture
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url
        }, { new: true });
        res.status(200).json(updatedUser)
    }catch(e){
        console.error("Error during profile update:", e.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


//checking authentication
export const checkAuth = (req,res)=>{
    try{
        res.status(200).json(req.user);
    }
    catch(e){
        console.log("Error in checkAuth Controller",e.message);
        res.status(500).json({message : "Internal server Error"})
    }
}