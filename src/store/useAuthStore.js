import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
      set({ authUser: null });
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(authData);
      if (!user || !user.jwt)
        throw new Error("Dữ liệu người dùng không hợp lệ");

      set({ authUser: user });
      navigate("/newsfeeds");

      // get().connectSocket();
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      set({ authUser: null });
      localStorage.removeItem("authUser");
      navigate("/login");
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      if (res.status === 201) {
        localStorage.setItem("authUser", JSON.stringify(res.data));
        set({ authUser: res.data });
        toast.success("Tạo tài khoản thành công");
        get().connectSocket();
        return null; // Trả về null khi thành công
      } else {
        const errorMessage = res.data?.message || "Đăng ký thất bại";
        return errorMessage; // Trả về thông báo lỗi
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
      return errorMessage; // Trả về thông báo lỗi
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      if (!res.data || !res.data.jwt) {
        throw new Error("Phản hồi đăng nhập không hợp lệ: Thiếu JWT");
      }

      const userData = {
        jwt: res.data.jwt,
        role: res.data.role,
        email: data.email,
      };

      set({ authUser: userData });
      localStorage.setItem("authUser", JSON.stringify(userData));
      toast.success("Đăng nhập thành công");
      get().connectSocket();
      return null;
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      const errorMessage =
        error?.response?.data?.message || "Invalid password or email";
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
      console.error("navigate không phải là một hàm!");
      return;
    }

    get().disconnectSocket();
    localStorage.removeItem("authUser");
    set({ authUser: null });
    toast.success("Đăng xuất thành công");

    navigate("/login");
  },

  sendOtp: async (email, navigate) => {
    set({ isSendingForgotPassword: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      if (!res.data || typeof res.data !== "string") {
        throw new Error("Phản hồi không hợp lệ: Cần chuỗi JWT");
      }
      localStorage.setItem("forgotPasswordToken", res.data);
      localStorage.setItem("forgotPasswordEmail", email);
      toast.success("Mã xác nhận đã được gửi đến email của bạn!");
      navigate("/verify");
      return res.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Không thể gửi mã xác nhận";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isSendingForgotPassword: false });
    }
  },

  resendOtp: async () => {
    set({ isSendingForgotPassword: true });
    try {
      const email = localStorage.getItem("forgotPasswordEmail");
      if (!email) {
        throw new Error("Không tìm thấy email. Vui lòng bắt đầu lại.");
      }

      const res = await axiosInstance.post("/auth/forgot-password", { email });
      if (!res.data || typeof res.data !== "string") {
        throw new Error("Phản hồi không hợp lệ: Cần chuỗi JWT");
      }

      localStorage.setItem("forgotPasswordToken", res.data);
      toast.success("Mã xác nhận mới đã được gửi đến email của bạn!");
      return res.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Không thể gửi lại mã";
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
        throw new Error("Vui lòng nhập mã OTP 6 chữ số hợp lệ");
      }

      const token = localStorage.getItem("forgotPasswordToken");
      if (!token) {
        throw new Error(
          "Không tìm thấy token xác nhận. Vui lòng yêu cầu mã mới."
        );
      }

      const res = await axiosInstance.post(
        "/auth/verify-otp",
        { otp: otpCode, token: token },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { token: newToken, message } = res.data;
      localStorage.setItem("resetPasswordToken", newToken);
      toast.success(message || "Xác nhận OTP thành công!");
      setTimeout(() => {
        navigate("/resetpass");
      }, 100);
      return { token: newToken, message };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "OTP không hợp lệ hoặc token đã hết hạn";
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
        throw new Error(
          "Không tìm thấy token đặt lại. Vui lòng xác nhận OTP lại."
        );
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

      const responseData = res.data;

      localStorage.removeItem("resetPasswordToken");
      localStorage.removeItem("forgotPasswordToken");
      localStorage.removeItem("forgotPasswordEmail");
      setTimeout(() => {
        navigate("/login");
      }, 700);
      return responseData;
    } catch (err) {
      const errorMessage = err.response?.data || { message: err.message };
      toast.error(
        typeof errorMessage === "string"
          ? errorMessage
          : errorMessage.message || "Không thể đặt lại mật khẩu"
      );
      throw new Error(JSON.stringify(errorMessage));
    } finally {
      set({ isResettingPassword: false });
    }
  },

  connectSocket: () => {
    const authUser = get().authUser;
    if (!authUser || !authUser.jwt) {
      console.error(
        "Không thể kết nối socket: Không tìm thấy người dùng đã xác thực"
      );
      return;
    }

    const userId = authUser.email;

    const socket = new SockJS("https://backendsocial-1.onrender.com/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${authUser.jwt}`,
      },
      onConnect: () => {
        console.log(`Đã kết nối với WebSocket cho user ${userId}`);
      },
      onStompError: (frame) => {
        console.error("Lỗi STOMP:", frame);
        toast.error("Không thể kết nối đến WebSocket. Vui lòng thử lại sau!");
      },
      onWebSocketError: (err) => {
        console.error("Lỗi WebSocket:", err);
        toast.error("Lỗi kết nối WebSocket!");
      },
      reconnectDelay: 5000,
    });

    stompClient.activate();
    set({ socket: stompClient });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.deactivate();
      set({ socket: null });
      console.log("WebSocket đã ngắt kết nối thành công");
    } else {
      console.log("Không có kết nối WebSocket để ngắt");
    }
  },
}));
