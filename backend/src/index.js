import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { app, server } from './lib/socket.js';
// Load environment variables from .env file
dotenv.config();

// Set the port from environment variable or default to 9000
const PORT = process.env.PORT || 9000;

const __dirname = path.resolve();

//middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


//parse cookies
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}))

//routes
app.use('/api/auth', authRoutes);

//messages
app.use('/api/messages', messageRoutes)

if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React frontend app
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
    });
}

//running the server
server.listen(PORT, () => {
    console.log('Server is running on PORT : ' + PORT);
    // Connect to the database
    connectDB();
})