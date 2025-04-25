import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const useChatStore = create((set, get) => ({
  messages: [],
  page: 0,
  totalPages: 1,
  isLoading: false,
  userId: null,
  selectedUserDetails: null,
  shouldScrollToBottom: true,

  setMessages: (messages) => set({ messages }),
  setPage: (page) => set({ page }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setUserId: (userId) => set({ userId }),
  setSelectedUserDetails: (selectedUserDetails) => set({ selectedUserDetails }),
  setShouldScrollToBottom: (shouldScrollToBottom) => set({ shouldScrollToBottom }),

  subscribeToMessages: (userId, authUser, selectedUserDetails) => {
    const { socket } = useAuthStore.getState();
    if (!socket || !socket.connected) {
      console.error("WebSocket chưa kết nối hoặc không tồn tại");
      return;
    }

    socket.subscribe(`/user/${userId}/queue/messages`, (message) => {
      try {
        const messageData = JSON.parse(message.body);

        if (
          !messageData ||
          typeof messageData !== "object" ||
          !messageData.senderId ||
          !messageData.receiverId
        ) {
          console.warn("Dữ liệu tin nhắn WebSocket không hợp lệ:", messageData);
          return;
        }

        const timestamp =
          messageData.timestamp ||
          messageData.timeStamp ||
          String(Date.now());

        if (!timestamp || isNaN(parseInt(timestamp))) {
          console.warn("Timestamp không hợp lệ, dùng thời gian hiện tại:", timestamp);
          messageData.timestamp = String(Date.now());
        } else {
          messageData.timestamp = String(timestamp);
        }

        if (!messageData.sender) {
          messageData.sender = {
            id: messageData.senderId,
            fullName:
              messageData.senderId === userId
                ? authUser?.fullName || "Người dùng"
                : selectedUserDetails?.fullName || "Người dùng",
            avatar:
              messageData.senderId === userId
                ? authUser?.avatar || "/avatar.png"
                : selectedUserDetails?.avatar || "/avatar.png",
          };
        }

        messageData.deleted = messageData.deleted || false;
        messageData.picture = messageData.picture || null;
        messageData.status = "sent"; // Set status to "sent" for WebSocket messages

        set((state) => {
          const prevMessages = state.messages || [];
          // Check if this is an update to a temporary message (sender case)
          const tempMessageIndex = prevMessages.findIndex(
            (msg) =>
              msg.status === "sending" &&
              msg.senderId === messageData.senderId &&
              msg.receiverId === messageData.receiverId &&
              msg.content === messageData.content &&
              msg.picture === messageData.picture &&
              Math.abs(parseInt(msg.timestamp) - parseInt(messageData.timestamp)) < 1000
          );

          if (tempMessageIndex !== -1) {
            // Update the temporary message with the final data
            const updatedMessages = [...prevMessages];
            updatedMessages[tempMessageIndex] = {
              ...messageData,
              id: messageData.id, // Use backend-assigned ID
              status: "sent",
            };
            return { messages: updatedMessages, shouldScrollToBottom: true };
          }

          // Otherwise, add as a new message (receiver case or duplicate check)
          const isDuplicate = prevMessages.some(
            (msg) =>
              msg.id === messageData.id ||
              (msg.content === messageData.content &&
                msg.senderId === messageData.senderId &&
                msg.receiverId === messageData.receiverId &&
                msg.timestamp === messageData.timestamp &&
                msg.picture === messageData.picture)
          );
          if (isDuplicate) {
            return { messages: prevMessages };
          }

          const updatedMessages = [...prevMessages, messageData].sort((a, b) => {
            const timestampA = a?.timestamp ? parseInt(a.timestamp) : 0;
            const timestampB = b?.timestamp ? parseInt(b.timestamp) : 0;
            return timestampA - timestampB;
          });
          return { messages: updatedMessages, shouldScrollToBottom: true };
        });
      } catch (error) {
        console.error("Lỗi khi xử lý tin nhắn WebSocket:", error);
      }
    });
  },

  subscribeToDeleteNotifications: (userId) => {
    const { socket } = useAuthStore.getState();
    if (!socket || !socket.connected) {
      console.error("WebSocket chưa kết nối hoặc không tồn tại");
      return;
    }

    socket.subscribe(`/user/${userId}/queue/delete`, (message) => {
      try {
        const recalledMessage = JSON.parse(message.body);
        const messageId = recalledMessage.messageId;
        console.log("Received recall notification:", recalledMessage);
        set((state) => ({
          messages: state.messages.map((msg) =>
            String(msg.id) === String(messageId)
              ? { ...msg, deleted: true, content: "This message has been recalled.", picture: null }
              : msg
          ),
        }));
      } catch (error) {
        console.error("Lỗi khi xử lý thông báo thu hồi tin nhắn:", error);
      }
    });
  },

  sendMessage: async (newMessage, selectedUser, userId, authUser, selectedUserDetails) => {
    const { socket } = useAuthStore.getState();
    if (!socket || !socket.connected || !selectedUser || !userId) {
      console.error("Không thể gửi tin nhắn: WebSocket hoặc thông tin người dùng không hợp lệ");
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`; // Temporary ID for sender's UI
    const timestamp = String(Date.now());
    const payload = {
      senderId: userId,
      receiverId: selectedUser.userId,
      content: newMessage.text || "",
      picture: newMessage.image || null,
      timestamp,
      timeStamp: timestamp,
      sender: {
        id: userId,
        fullName: authUser?.fullName || "Người dùng",
        avatar: authUser?.avatar || "/avatar.png",
      },
      receiver: {
        id: selectedUser.userId,
        fullName: selectedUserDetails?.fullName || "Người dùng",
        avatar: selectedUserDetails?.avatar || "/avatar.png",
      },
      deleted: false,
      status: "sending", // Initial status
      id: tempId, // Temporary ID
    };

    console.log("Gửi tin nhắn tới WebSocket:", payload);

    // Add the message to the sender's UI immediately
    set((state) => {
      const prevMessages = state.messages || [];
      const updatedMessages = [...prevMessages, payload].sort((a, b) => {
        const timestampA = a?.timestamp ? parseInt(a.timestamp) : 0;
        const timestampB = b?.timestamp ? parseInt(b.timestamp) : 0;
        return timestampA - timestampB;
      });
      return { messages: updatedMessages, shouldScrollToBottom: true };
    });

    try {
      await axiosInstance.post(
        "/api/messages/send",
        {
          senderId: userId,
          receiverId: selectedUser.userId,
          content: newMessage.text || "",
          picture: newMessage.image || null,
        },
        {
          headers: { Authorization: `Bearer ${authUser.jwt}` },
        }
      );

      socket.publish({
        destination: "/app/chat",
        body: JSON.stringify({
          senderId: userId,
          receiverId: selectedUser.userId,
          content: newMessage.text || "",
          picture: newMessage.image || null,
          timestamp,
          timeStamp: timestamp,
          sender: {
            id: userId,
            fullName: authUser?.fullName || "Người dùng",
            avatar: authUser?.avatar || "/avatar.png",
          },
          receiver: {
            id: selectedUser.userId,
            fullName: selectedUserDetails?.fullName || "Người dùng",
            avatar: selectedUserDetails?.avatar || "/avatar.png",
          },
          deleted: false,
        }),
      });
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại.");
      // Optionally remove the temporary message on failure
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== tempId),
      }));
    }
  },

  fetchUserProfile: async (authUser, setAuthUser) => {
    try {
      const response = await axiosInstance.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${authUser?.jwt}` },
      });
      set({ userId: response.data.id });
      setAuthUser({
        ...authUser,
        id: response.data.id,
        fullName: response.data.fullName || "Người dùng",
        avatar: response.data.avatar || "/avatar.png",
      });
    } catch (error) {
      console.error("Lỗi khi lấy profile:", error.response?.status, error.message);
    }
  },

  fetchSelectedUserDetails: async (selectedUser, authUser) => {
    try {
      const response = await axiosInstance.get(`/api/users/${selectedUser.userId}`, {
        headers: { Authorization: `Bearer ${authUser?.jwt}` },
      });
      set({
        selectedUserDetails: {
          id: response.data.id,
          fullName: response.data.fullName || "Người dùng",
          avatar: response.data.avatar || "/avatar.png",
        },
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin selectedUser:", error);
      set({
        selectedUserDetails: {
          id: selectedUser.userId,
          fullName: selectedUser.fullName || "Người dùng",
          avatar: selectedUser.avatar || "/avatar.png",
        },
      });
    }
  },

  fetchMessages: async (selectedUser, authUser, pageNum) => {
    if (!selectedUser?.userId || !authUser?.jwt) {
      console.log("Missing information to fetch messages:", { selectedUser, authUser });
      return;
    }
  
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/api/messages/between", {
        headers: { Authorization: `Bearer ${authUser.jwt}` },
        params: { receiverId: selectedUser.userId, page: pageNum, size: 20 },
      });
  
  
      if (!response.data || typeof response.data !== "object") {
        console.error("Invalid API response:", response.data);
        return;
      }
  
      const content = response.data.content || response.data.messages || [];
      const totalPages = response.data.totalPages || 1;
  
      if (!Array.isArray(content)) {
        console.warn("Message data is not an array:", content);
        return;
      }
  
      const formattedContent = content.map((msg) => ({
        ...msg,
        deleted: msg.deleted || false,
        picture: msg.picture || null,
        status: "sent",
      }));
  
      set((state) => {
        const prevMessages = state.messages || [];
        const updatedMessages = pageNum === 0 ? formattedContent : [...formattedContent, ...prevMessages];
        return {
          totalPages,
          messages: updatedMessages.sort((a, b) => {
            const timestampA = a?.timestamp ? parseInt(a.timestamp) : 0;
            const timestampB = b?.timestamp ? parseInt(b.timestamp) : 0;
            return timestampA - timestampB;
          }),
          shouldScrollToBottom: pageNum === 0,
        };
      });
    } catch (error) {
      console.error("Error fetching messages:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  handleSendMessage: (newMessage, selectedUser, userId, authUser, selectedUserDetails) => {
    get().sendMessage(newMessage, selectedUser, userId, authUser, selectedUserDetails);
  },

  handleDeleteMessage: async (messageId, authUser, userId, selectedUser) => {
    const { socket } = useAuthStore.getState();
    if (!messageId || !authUser?.jwt) {
      console.error("Thiếu messageId hoặc JWT để thu hồi tin nhắn");
      return;
    }

    try {
      await axiosInstance.delete(`/api/messages/delete/${messageId}`, {
        headers: { Authorization: `Bearer ${authUser.jwt}` },
      });

      if (socket && socket.connected) {
        const recallPayload = {
          messageId: String(messageId),
          senderId: userId,
          receiverId: selectedUser.userId,
        };
        console.log("Gửi thông báo thu hồi qua WebSocket:", recallPayload);

        socket.publish({
          destination: `/user/${userId}/queue/delete`,
          body: JSON.stringify(recallPayload),
        });

        socket.publish({
          destination: `/user/${selectedUser.userId}/queue/delete`,
          body: JSON.stringify(recallPayload),
        });
      }

      set((state) => ({
        messages: state.messages.map((msg) =>
          String(msg.id) === String(messageId)
            ? { ...msg, deleted: true, content: "This message has been recalled.", picture: null }
            : msg
        ),
      }));
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error.response?.status, error.message);
      toast.error("Không thể thu hồi tin nhắn. Vui lòng thử lại.");
    }
  },
}));

export default useChatStore;