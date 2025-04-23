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
            const res = await axiosInstance.get(`/api/users/findUser?email=${encodeURIComponent(name)}`, {
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
    
            if (response.status === 200) {
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
        try {
            const response = await axiosInstance.post(`/api/friendships/accept/${id}`, {}, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
    
            if (response.status === 200) {
                console.log("Đã trở thành bạn bè");
                return true;
            } else {
                console.error("Có lỗi khi thêm bạn bè:", response);
                return false;
            }
        } catch (error) {
            console.error("Lỗi khi thêm bạn:", error);
            return false;
        }
    },

    cancelSentRequest: async (id) => {
        const jwt = useAuthStore.getState().authUser.jwt;
        try {
            const response = await axiosInstance.delete(`/api/friendships/cancel?friendId=${id}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
    
            if (response.status === 200) {
                console.log(response.data)
                console.log("Đã xóa lời mời thành côngggg");
                return true;
            } else {
                console.error("Có lỗi khi xóa lời mời kết bạn:", response);
                return false;
            }
        } catch (error) {
            console.error("Lỗi khi xóa lời mời:", error);
            return false;
        }
    },

    sendFriendRequest: async (id) => {
        const jwt = useAuthStore.getState().authUser.jwt;
        try {
            const response = await axiosInstance.post(`/api/friendships/add/${id}`, {}, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
    
            if (response.status === 200) {
                console.log("Đã gửi lời mời bạn thành công");
                return true;
            } else {
                console.error("Có lỗi khi gửi lời mời kết bạn:", response);
                return false;
            }
        } catch (error) {
            console.error("Lỗi khi xóa bạn:", error);
            return false;
        }
    },
    

}));
