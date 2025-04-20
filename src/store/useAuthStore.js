import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";


export const useAuthStore = create((set, get) => ({
  authUser: JSON.parse(localStorage.getItem("authUser")) || null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isSendingOtp: false,
  isVerifyingOtp: false,
  isResettingPassword: false,
  onlineUsers: [],
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  socket: null,
  

  checkAuth: async (navigate) => {
    const authData = localStorage.getItem("authUser");
  
    if (!authData) {
      console.log("Not authenticated, navigating to /login");
      set({ authUser: null });
      navigate("/login");
      return;
    }
  
    try {
      const user = JSON.parse(authData);
      if (!user || !user.jwt) throw new Error("Invalid user data"); // Thay _id bằng jwt
  
      set({ authUser: user });
      console.log("Authenticated, navigating to /settings");
      navigate("/settings");
    } catch (error) {
      console.error("Auth error:", error);
      set({ authUser: null });
      localStorage.removeItem("authUser");
      navigate("/login");
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      localStorage.setItem("authUser", JSON.stringify(res.data));

      set({ authUser: res.data });
      toast.success("Account created successfully");
      // get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
  
      // Kiểm tra xem res.data có tồn tại và có jwt hay không
      if (!res.data || !res.data.jwt) {
        throw new Error("Invalid login response: Missing JWT");
      }
      const profile = await axiosInstance.get("/api/users/profile",
        {
        headers: {
          Authorization: `Bearer ${res.data.jwt}`,
        },
      });
      const userData = {
        jwt: res.data.jwt,
        role: res.data.role,
        email: data.email,
        userName: profile.data.fullName,
        image: profile.data.avatar // Lấy email từ dữ liệu gửi lên vì server không trả về
      };
  
      set({ authUser: userData });
      localStorage.setItem("authUser", JSON.stringify(userData));
      toast.success("Logged in successfully");
      return null;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error?.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      set({ authUser: null });
      localStorage.removeItem("authUser");
      return errorMessage;
    } finally {
      set({ isLoggingIn: false });
    }
  },
  
  logout: (navigate) => {

    if (typeof navigate !== "function") {
      console.error("🚨 navigate is not a function!");
      return;
    }

    localStorage.removeItem("authUser");
    set({ authUser: null });
    toast.success("Logged out successfully");

    navigate("/login"); // Điều hướng về trang đăng nhập
  },

  sendOtp: async (email, navigate) => {
    set({ isSendingForgotPassword: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      if (!res.data || typeof res.data !== "string") {
        throw new Error("Invalid response: Expected JWT string");
      }
      localStorage.setItem("forgotPasswordToken", res.data);
      localStorage.setItem("forgotPasswordEmail", email); // Lưu email
      toast.success("Verification code sent to your email!");
      navigate("/verify");
      return res.data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to send verification code";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isSendingForgotPassword: false });
    }
  },

  // Thêm hàm resendForgotPassword
  resendOtp: async () => {
    set({ isSendingForgotPassword: true });
    try {
      const email = localStorage.getItem("forgotPasswordEmail");
      if (!email) {
        throw new Error("No email found. Please start over.");
      }

      const res = await axiosInstance.post("/auth/forgot-password", { email });
      if (!res.data || typeof res.data !== "string") {
        throw new Error("Invalid response: Expected JWT string");
      }

      localStorage.setItem("forgotPasswordToken", res.data); // Cập nhật token mới
      toast.success("A new verification code has been sent to your email!");
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to resend code";
      toast.error(errorMessage);
      throw err;
    } finally {
      set({ isSendingForgotPassword: false });
    }
  },
  
  verifyOtp: async (otpCode, navigate) => {
    set({ isVerifyingOtp: true });
    try {
      if (!otpCode || otpCode.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }
  
      const token = localStorage.getItem("forgotPasswordToken");
      if (!token) {
        throw new Error("No verification token found. Please request a new code.");
      }
  
      const res = await axiosInstance.post(
        "/auth/verify-otp",
        { otp: otpCode,
          token: token }, // Gửi token cùng với OTP
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const { token: newToken, message } = res.data;
      localStorage.setItem("resetPasswordToken", newToken);
      toast.success(message || "OTP verified successfully!");
      setTimeout(() => {
        navigate("/resetpass"); // Điều hướng tới ResetPass sau khi thành công
      }, 100);
      return { token: newToken, message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid OTP or expired token";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  resetPassword: async (password, navigate) => {
    set({ isResettingPassword: true });
    try {
      const token = localStorage.getItem("resetPasswordToken");
      if (!token) {
        throw new Error("No reset token found. Please verify OTP again.");
      }
  
      const res = await axiosInstance.post(
        "/auth/reset-password",
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // API trả về chuỗi text, không cần parse thêm
      const responseData = res.data; // Chuỗi "Mật khẩu đã được đặt lại thành công."
  
      localStorage.removeItem("resetPasswordToken");
      localStorage.removeItem("forgotPasswordToken");
      localStorage.removeItem("forgotPasswordEmail");
      setTimeout(() => {
        navigate("/login"); // Điều hướng về /login sau 0.7 giây
      }, 700);
      return responseData; // Trả về chuỗi text trực tiếp
    } catch (err) {
      const errorMessage = err.response?.data || { message: err.message };
      toast.error(typeof errorMessage === "string" ? errorMessage : errorMessage.message || "Failed to reset password");
      throw new Error(JSON.stringify(errorMessage)); // Chuyển đổi thành chuỗi JSON để xử lý trong component
    } finally {
      set({ isResettingPassword: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    console.log("Current socket:", socket);

    if (!authUser) {
      get().disconnectSocket();
      return;
    }

    if (socket == null) {
      console.log("Creating new socket...");
      const newSocket = io(BASE_URL, {
        query: { userId: authUser._id },
      });

      set({ socket: newSocket });
      newSocket.on("getOnlineUsers", (userId) => {
        set({ onlineUsers: userId });
      });
    }
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
