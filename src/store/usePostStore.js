import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const usePostStore = create((set, get) => ({
  // Trạng thái
  posts: [], // Lưu danh sách bài đăng
  loading: false, // Trạng thái tải
  error: null, // Lưu lỗi nếu có

  // Hàm để lấy dữ liệu bài đăng từ API
  fetchPosts: async () => {
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
      const response = await axiosInstance.get("/api/posts/me", {
        headers: {
          Authorization: `Bearer ${authUser.jwt}`, // Gắn token vào header
        },
      });
      const data = response.data;

      // Lưu bài đăng vào state
      set({ posts: data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch posts",
        loading: false,
      });
    }
  },
}));