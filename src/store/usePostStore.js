import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const usePostStore = create((set, get) => ({
  // Trạng thái
  posts: [], // Lưu danh sách bài đăng
  loading: false, // Trạng thái tải
  error: null, // Lưu lỗi nếu có


  page: 1,
  limit: 10,
  isLoading: false,
  isLoadingLike: null,
  isLoadUpPost : false,

  createPost: async (data) => {
    set({ isLoadUpPost: true });

    console.log(data.imageUrl)
    const cloudName = 'dl5tkeog4'
    const present = 'social-network'
    let image = null;
    try {
      const formData = new FormData();
      formData.append("file", data.imageUrl);
      formData.append("upload_preset", present); 

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, 
        {
          method: "POST",
          body: formData,
        }
      );

      const dataUpload = await res.json();
      console.log("Upload success:", dataUpload);
      image = dataUpload.secure_url;

    } catch (error) {
      console.error("Upload error:", error);
    }

    
    const authUser = useAuthStore.getState().authUser;
    try {
      data.imageUrl = image
      const res = await axiosInstance.post("/api/posts",
        data,
        {
          headers: {
            Authorization: `Bearer ${authUser.jwt}`,
          },
        });
      if (res.status == 201) {
        res.data.avatar = res.data.user.avatar
        res.data.userName = res.data.user.fullName
        console.log(res.data)
        set((state) => ({ posts: [res.data, ...state.posts] }));
      }


    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      set({ isLoadUpPost: false });
    }
  },

  getPosts: async () => {
    set({ isLoading: true });
    const authUser = useAuthStore.getState().authUser;
    try {
      const response = await axiosInstance.get("/api/posts/feed ", {
        headers: {
          Authorization: `Bearer ${authUser.jwt}`, // Gắn token vào header
        },
      });
      const data = response.data;
      // const { page, limit } = get();
      // const res = await axiosInstance.get(`/post/get-post?page=${page}&limit=${limit}`);
      set({ posts: data });

    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      set({ isLoading: false });
    }
  },

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
  sendCmt: async (data) => {
    console.log(data)
    set({ isLoading: false });
    const authUser = useAuthStore.getState().authUser;
    try {
      const response = await axiosInstance.post("/api/comments",
        data,
        {
          headers: {
            Authorization: `Bearer ${authUser.jwt}`,
          },
        });
      console.log(response.data)
      // console.log(data)
      // const { page, limit } = get();
      // const res = await axiosInstance.get(`/post/get-post?page=${page}&limit=${limit}`);

    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      set({ isLoading: false });
    }
  },
  likePost: async (id) => {
    set({ isLoadingLike: id });
    const authUser = useAuthStore.getState().authUser;
    try {
      const response = await axiosInstance.post(`/api/likes/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authUser.jwt}`,
          },
        });
      console.log(response.data)


    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      set({ isLoadingLike: null });
    }
  },
  // Hàm cập nhật bài đăng
  updatePost: async (id, data) => {
    set({ isLoading: true });
    const authUser = useAuthStore.getState().authUser;

    try {
      let image = data.imageUrl;
      const cloudName = "dl5tkeog4";
      const preset = "social-network";

      // Lấy bài đăng gốc từ state posts để so sánh imageUrl
      const currentPost = get().posts.find((post) => post.id === id);
      const originalImageUrl = currentPost?.imageUrl || ""; // URL ban đầu (Cloudinary URL hoặc rỗng)

      // Nếu imageUrl mới là chuỗi base64 và khác với imageUrl ban đầu
      if (image && image.startsWith("data:image/") && image !== originalImageUrl) {
        try {
          const formData = new FormData();
          formData.append("file", image); // image là chuỗi base64
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
            throw new Error("Failed to upload image to Cloudinary");
          }
          image = dataUpload.secure_url; // Cập nhật image thành URL từ Cloudinary
        } catch (error) {
          console.error("Upload error:", error);
          throw error; // Ném lỗi để xử lý ở catch bên dưới
        }
      } else if (image === originalImageUrl) {
        // Nếu imageUrl mới giống với imageUrl ban đầu, giữ nguyên URL cũ
        image = originalImageUrl;
      } else if (!image) {
        // Nếu không có ảnh mới (người dùng xóa ảnh), đặt imageUrl thành null
        image = null;
      }

      // Cập nhật dữ liệu bài đăng
      const updatedData = { ...data, imageUrl: image };
      const response = await axiosInstance.put(
        `/api/posts/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${authUser.jwt}`,
          },
        }
      );

      // Cập nhật danh sách bài đăng trong store
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id ? { ...post, ...response.data } : post
        ),
      }));

      toast.success("Cập nhật bài đăng thành công");
    } catch (error) {
      console.error("Error in updatePost:", error);
      toast.error(error.response?.data?.message || "Có lỗi khi cập nhật bài đăng");
    } finally {
      set({ isLoading: false });
    }
  },

  // Hàm xóa bài đăng
  deletePost: async (id) => {
    set({ isLoading: true });
    const authUser = useAuthStore.getState().authUser;

    try {
      await axiosInstance.delete(`/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${authUser.jwt}`,
        },
      });

      // Xóa bài đăng khỏi danh sách trong store
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
      }));

      toast.success("Xóa bài đăng thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi khi xóa bài đăng");
    } finally {
      set({ isLoading: false });
    }
  },
}));