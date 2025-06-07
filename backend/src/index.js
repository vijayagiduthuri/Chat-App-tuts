import express from 'express';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Set the port from environment variable or default to 9000
const PORT = process.env.PORT || 9000;

//middleware
app.use(express.json());

//parse cookies
app.use(cookieParser());

//routes
app.use('/api/auth', authRoutes);

//running the server
app.listen(PORT, () => {
    console.log('Server is running on PORT : ' + PORT);
    // Connect to the database
    connectDB();
})