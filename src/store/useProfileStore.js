import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useProfileStore = create((set, get) => ({
  // Trạng thái
  user: null, // Lưu thông tin người dùng
  loading: false, // Trạng thái tải
  error: null, // Lưu lỗi nếu có
  isUpdatingProfile: false, // Trạng thái cập nhật profile

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

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    const authUser = useAuthStore.getState().authUser;
    const currentUser = get().user;
    if (!authUser || !authUser.jwt) {
      set({
        error: "No authentication token found. Please log in.",
        isUpdatingProfile: false,
      });
      return;
    }

    // Kiểm tra currentUser và user.id
    if (!currentUser || !currentUser.id) {
      set({
        error: "User profile not found. Please try again.",
        isUpdatingProfile: false,
      });
      toast.error("Không tìm thấy thông tin người dùng. Vui lòng thử lại.");
      return;
    }

    try {
      let avatarUrl = data.avatar;
      const cloudName = "dl5tkeog4";
      const preset = "social-network";

      // Lấy avatar ban đầu từ state user
      const originalAvatarUrl = get().user?.avatar || "";

      // Nếu avatar là chuỗi base64 và khác với avatar ban đầu
      if (avatarUrl && avatarUrl.startsWith("data:image/") && avatarUrl !== originalAvatarUrl) {
        
        try {
          const formData = new FormData();
          formData.append("file", avatarUrl); // avatarUrl là chuỗi base64
          formData.append("upload_preset", preset);

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const dataUpload = await res.json();
          console.log("Upload success:", dataUpload);
          if (!dataUpload.secure_url) {
            throw new Error("Failed to upload avatar to Cloudinary");
          }
          avatarUrl = dataUpload.secure_url; // Cập nhật avatarUrl thành URL từ Cloudinary
        } catch (error) {
          console.error("Upload error:", error);
          throw error;
        }
      } else if (avatarUrl === originalAvatarUrl) {
        // Nếu avatar không thay đổi, giữ nguyên URL cũ
        avatarUrl = originalAvatarUrl;
      } else if (!avatarUrl) {
        // Nếu không có avatar mới (người dùng xóa), đặt thành null
        avatarUrl = null;
      }

      // Gửi dữ liệu lên API
      const response = await axiosInstance.put(
        `/api/users/${currentUser.id}/profile`,
        {
          fullName: data.fullName,
          avatar: avatarUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authUser.jwt}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật state user với dữ liệu mới
      set((state) => ({
        user: { ...state.user, ...response.data },
        isUpdatingProfile: false,
      }));

      toast.success("Cập nhật hồ sơ thành công");
      console.log("Cập nhật hồ sơ thành công:", response.data);
    } catch (error) {
      console.log("Lỗi khi cập nhật hồ sơ:", error);
      toast.error(error.response?.data?.message || "Có lỗi khi cập nhật hồ sơ");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
