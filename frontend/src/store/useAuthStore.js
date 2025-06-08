import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingUp: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({
                authUser: res.data
            })
        } catch (e) {
            console.log("Error checking authentication:", e);
            set({
                authUser: null
            })
        }
        finally {
            set({
                isCheckingAuth: false
            })
        }
    }
}))