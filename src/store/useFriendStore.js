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
        const jwt = authUser.jwt;

        set({ isLoadingFriend: true });

        try {
            const res = await axiosInstance.get("api/friendships/friends", {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });
            set({ friends: res.data });
        } catch (error) {
            console.error("Failed to fetch friends", error);
        } finally {
            set({ isLoadingFriend: false });
        }
    },

    getsentRequests: async () => {
        const authUser = useAuthStore.getState().authUser;
        const jwt = authUser.jwt;

        try {
            const res = await axiosInstance.get("api/friendships/sent-requests", {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });
            set({ sentRequests: res.data });
        } catch (error) {
            console.error("Failed to fetch sent requests", error);
        }
    },

    getpendingRequests: async () => {
        const authUser = useAuthStore.getState().authUser;
        const jwt = authUser.jwt;

        try {
            const res = await axiosInstance.get("api/friendships/received-requests", {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });
            set({ pendingRequests: res.data });
        } catch (error) {
            console.error("Failed to fetch pending requests", error);
        }
    },
}));
