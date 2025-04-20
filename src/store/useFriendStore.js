import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
    isLoadingFriend: false,
    friends: [],
    sentRequests: [],
    pendingRequests: [],

    getFriend: async () => {
        const authUser = useAuthStore.getState().authUser;

        try {
            
            
        } catch (error) {
            
        }

    },

    getsentRequests: async () => {
        const authUser = useAuthStore.getState().authUser;


    },

    getpendingRequests: async () => {\
        const authUser = useAuthStore.getState().authUser;


    },
}))

