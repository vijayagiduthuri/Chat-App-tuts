import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

// Zustand store for managing authentication state
export const useAuthStore = create((set) => ({

    // Authentication state
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    // Action to set the authenticated user
    checkAuth: async () => {
        // Check if the user is authenticated
        try {
            const res = await axiosInstance.get("/auth/check");
            // If authenticated, set the authUser state
            set({
                authUser: res.data
            })
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

        }
        catch (e) {
            toast.error(e.response?.data?.message || "Error signing up");
        }
        finally {
            // Reset the signing up state
            set({ isSigningUp: false });
        }
    },

    //logout action
    logout: async () => {
        try{
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
        }
        catch(e){
            toast.error(e.response?.data?.message || "Error logging out");
        }
    }
}))

