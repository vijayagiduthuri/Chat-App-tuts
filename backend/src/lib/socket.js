import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

// Initialize express app
const app = express();
const server = http.createServer(app);

//create socket.io server
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
})

io.on("connection", (socket) => {
    console.log("A user Connected", socket.id);
    socket.on("disconnect", () => {
        console.log("A User disconnected", socket.id)
    })
})

export { io, app, server }