import express from 'express';
import { login, logout, signup,updateProfile,checkAuth,updatePassword } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';


//initialize express router
const router = express.Router();

router.post('/signup', signup)

router.post('/login', login)

router.post('/update-password', protectRoute, updatePassword);

router.post('/logout', logout)

router.put('/update-profile', protectRoute, updateProfile)

router.get("/check",protectRoute,checkAuth)

export default router;