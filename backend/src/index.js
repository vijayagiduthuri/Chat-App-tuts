import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Set the port from environment variable or default to 9000
const PORT = process.env.PORT || 9000;

//middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


//parse cookies
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin : "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}))

//routes
app.use('/api/auth', authRoutes);

//messages
app.use('/api/messages',messageRoutes)

//running the server
app.listen(PORT, () => {
    console.log('Server is running on PORT : ' +  PORT);
    // Connect to the database
    connectDB();
})