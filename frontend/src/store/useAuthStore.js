import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:9000" : "/";

// Zustand store for managing authentication state
export const useAuthStore = create((set, get) => ({
    // Authentication state
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    showOnlineOnly: false,
    showOnlineStatus: true, // New state for showing online status indicators
    socket: null,

    // UI state setters
    setShowOnlineOnly: (value) => set({ showOnlineOnly: value }),
    setShowOnlineStatus: (value) => set({ showOnlineStatus: value }),

    // Action to check if user is authenticated
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.error('Auth check failed:', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    // Sign up action
    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            console.error('Signup failed:', error);
            const errorMessage = error.response?.data?.message || "Error signing up";
            toast.error(errorMessage);
            throw error; // Re-throw for component handling
        } finally {
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
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.message || "Error logging in";
            toast.error(errorMessage);
            throw error; // Re-throw for component handling
        } finally {
            set({ isLoggingIn: false });
        }
    },

    // Logout action
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.error('Logout request failed:', error);
            // Continue with logout even if server request fails
        } finally {
            // Always clear local state and disconnect socket
            set({ authUser: null });
            get().disconnectSocket();
            toast.success("Logged out successfully");
        }
    },

    // Action to update the profile
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.error('Profile update failed:', error);
            const errorMessage = error.response?.data?.message || "Error updating profile";
            toast.error(errorMessage);
            throw error; // Re-throw for component handling
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    // Connect to socket server
    connectSocket: () => {
        const { authUser, socket } = get();

        // Don't connect if no user or already connected
        if (!authUser || socket?.connected) {
            return;
        }

        try {
            const newSocket = io(BASE_URL, {
                query: {
                    userId: authUser._id,
                },
                autoConnect: false // Prevent automatic connection
            });

            // Set up event listeners before connecting
            newSocket.on("getOnlineUsers", (userIds) => {
                set({ onlineUsers: userIds });
            });

            newSocket.on("connect", () => {
                console.log("Socket connected successfully");
            });

            newSocket.on("disconnect", (reason) => {
                console.log("Socket disconnected:", reason);
            });

            newSocket.on("connect_error", (error) => {
                console.error("Socket connection error:", error);
            });

            // Connect and store socket instance
            newSocket.connect();
            set({ socket: newSocket });

        } catch (error) {
            console.error('Socket connection failed:', error);
        }
    },

    // Disconnect from socket server
    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null });
            console.log("Socket disconnected");
        }
    },

    // Helper method to reset all state (useful for testing or complete logout)
    resetStore: () => {
        get().disconnectSocket();
        set({
            authUser: null,
            isSigningUp: false,
            isLoggingIn: false,
            isUpdatingProfile: false,
            isCheckingAuth: false,
            onlineUsers: [],
            showOnlineOnly: false,
            showOnlineStatus: true,
            socket: null
        });
    }
}));