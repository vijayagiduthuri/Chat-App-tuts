import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUserForSidebar,getMessages,sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/users',protectRoute,getUserForSidebar);

router.post("/send/:id",protectRoute,sendMessage)

router.get("/chat/:id",protectRoute,getMessages);


export default router;
