import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const useProfileStore = create((set, get) => ({
  // Trạng thái
  user: null, // Lưu thông tin người dùng
  loading: false, // Trạng thái tải
  error: null, // Lưu lỗi nếu có

  // Hàm để lấy thông tin người dùng từ API
  fetchUser: async () => {
    set({ loading: true, error: null });

    // Lấy token từ useAuthStore
    const authUser = useAuthStore.getState().authUser;
    if (!authUser || !authUser.jwt) {
      set({
        error: "No authentication token found. Please log in.",
        loading: false,
      });
      return;
    }

    try {
      const response = await axiosInstance.get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${authUser.jwt}`, // Gắn token vào header
        },
      });
      const data = response.data;

      // Lưu thông tin người dùng vào state
      set({ user: data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch user profile",
        loading: false,
      });
    }
  },
}));