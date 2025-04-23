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
    searchFriend: async (name) => {
        const authUser = useAuthStore.getState().authUser;
        const jwt = authUser.jwt;

        try {
            const res = await axiosInstance.get(`/api/friendships/search?name=${encodeURIComponent(name)}`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });
            console.log(res.data)
            return res.data;
        } catch (error) {
            console.error("Lỗi tìm kiếm bạn bè", error);
            throw error;
        }
    }, 
    deleteFriend: async (id) => {
        const jwt = useAuthStore.getState().authUser.jwt;
        try {
            const response = await axiosInstance.post(`/api/friendships/unfriend/${id}`, {}, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
    
            if (response.status === 204) {
                console.log("Đã xóa bạn thành công");
                return true;
            } else {
                console.error("Có lỗi khi xóa bạn:", response);
                return false;
            }
        } catch (error) {
            console.error("Lỗi khi xóa bạn:", error);
            return false;
        }
    },
    

    acceptFriendRequest: async (id) => {
        const jwt = useAuthStore.getState().authUser.jwt;
        await axiosInstance.put(`/api/friendships/accept/${id}`, {}, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    },

    cancelSentRequest: async (id) => {
        const jwt = useAuthStore.getState().authUser.jwt;
        await axiosInstance.delete(`/api/friendships/cancel/${id}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    }

}));
