import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_url = "http://localhost:9000";

// Zustand store for managing authentication state
export const useAuthStore = create((set, get) => ({

    // Authentication state
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    // Action to set the authenticated user
    checkAuth: async () => {
        // Check if the user is authenticated
        try {
            const res = await axiosInstance.get("/auth/check");
            // If authenticated, set the authUser state
            set({
                authUser: res.data
            })
            get().connectSocket();
        } catch (e) {
            set({
                authUser: null
            })
        }
        finally {
            set({
                isCheckingAuth: false
            })
        }
    },

    // Sign up action
    signup: async (data) => {
        // Sign up the user with the provided data
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        }
        catch (e) {
            toast.error(e.response?.data?.message || "Error signing up");
        }
        finally {
            // Reset the signing up state
            set({ isSigningUp: false });
        }
    },

    // Login action
    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");
            get().connectSocket();
        }
        catch (e) {
            toast.error(e.response?.data?.message || "Error logging in");
        }
        finally {
            set({ isLoggingIn: false });
        }
    },

    //logout action
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        }
        catch (e) {
            toast.error(e.response?.data?.message || "Error logging out");
        }
    },

    // Action to update the profile picture
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile picture updated successfully");
        } catch (e) {
            toast.error(e.response?.data?.message || "Error updating profile picture");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    //connect to the server
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) {
            return;
        }
        const socket = io(BASE_url, {
            query: {
                userId: authUser._id,
            }
        })
        socket.connect()
        set({ socket: socket })
        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    //disconnect to the server
    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
        }
    }

}))

