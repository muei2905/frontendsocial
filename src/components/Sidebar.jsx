import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import SearchFriends from "./SearchFriendsInput";

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const { authUser, socket: stompClient } = useAuthStore();

  // Hàm định dạng thời gian của lastMessage từ timestamp
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ""; // Trả về rỗng nếu timestamp không tồn tại

    const date = new Date(parseInt(timestamp)); // Parse timestamp từ chuỗi
    if (isNaN(date)) return ""; // Kiểm tra timestamp hợp lệ

    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }); // Định dạng ngày: DD/MM/YYYY
    }
  };

  // Fetch danh sách contacts ban đầu từ API
  useEffect(() => {
    const fetchContacts = async () => {
      if (!authUser || !authUser.jwt) {
        console.log("No user or JWT found, skipping fetch contacts");
        return;
      }

      try {
        const response = await axiosInstance.get("/api/messages/contacts", {
          headers: { Authorization: `Bearer ${authUser.jwt}` },
        });
        console.log("Contacts data:", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setUsers([]);
      }
    };

    fetchContacts();
  }, [authUser]);

  // Hàm lấy tin nhắn mới nhất khi tin nhắn cuối bị thu hồi
  const fetchLatestMessage = async (userId) => {
    try {
      const response = await axiosInstance.get("/api/messages/between", {
        headers: { Authorization: `Bearer ${authUser.jwt}` },
        params: { receiverId: userId, page: 0, size: 1 },
      });

      const messages = response.data.content || [];
      if (messages.length > 0) {
        const latestMessage = messages[0];
        return {
          content: latestMessage.deleted ? "This message has been recalled." : latestMessage.content,
          timestamp: latestMessage.timestamp || latestMessage.timeStamp, // Sử dụng timestamp
          sentByCurrentUser: String(latestMessage.senderId) === String(authUser.id),
          deleted: latestMessage.deleted || false,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching latest message:", error);
      return null;
    }
  };

  // Thiết lập subscriptions WebSocket từ useAuthStore
  useEffect(() => {
    if (!authUser || !authUser.jwt || !authUser.id || !stompClient || !stompClient.connected) {
      console.log("WebSocket not connected or user not authenticated, skipping subscriptions");
      return;
    }

    console.log(`Sidebar subscribing as User ${authUser.id}`);

    // Subscription để nhận tin nhắn mới
    const messageSubscription = stompClient.subscribe(
      `/user/${authUser.id}/queue/messages`,
      (message) => {
        try {
          const messageData = JSON.parse(message.body);
          const { senderId, receiverId, content, timestamp, deleted } = messageData;

          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((user) => {
              if (
                String(user.userId) === String(senderId) ||
                String(user.userId) === String(receiverId)
              ) {
                return {
                  ...user,
                  lastMessage: {
                    content: deleted ? "This message has been recalled." : content,
                    timestamp: timestamp, // Sử dụng timestamp
                    sentByCurrentUser: String(senderId) === String(authUser.id),
                    deleted: deleted || false,
                  },
                };
              }
              return user;
            });
            return updatedUsers.sort((a, b) => {
              const timeA = a.lastMessage ? parseInt(a.lastMessage.timestamp) : 0;
              const timeB = b.lastMessage ? parseInt(b.lastMessage.timestamp) : 0;
              return timeB - timeA; // Sắp xếp theo timestamp giảm dần
            });
          });
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      }
    );

    // Subscription để nhận thông báo thu hồi tin nhắn
    const deleteSubscription = stompClient.subscribe(
      `/user/${authUser.id}/queue/delete`,
      async (message) => {
        try {
          const recalledMessage = JSON.parse(message.body);
          const { senderId, receiverId } = recalledMessage;

          // Xác định userId của người liên quan
          const relatedUserId =
            String(senderId) === String(authUser.id) ? receiverId : senderId;

          // Lấy tin nhắn mới nhất còn lại
          const newLastMessage = await fetchLatestMessage(relatedUserId);

          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((user) => {
              if (String(user.userId) === String(relatedUserId)) {
                return {
                  ...user,
                  lastMessage: newLastMessage,
                };
              }
              return user;
            });
            return updatedUsers.sort((a, b) => {
              const timeA = a.lastMessage ? parseInt(a.lastMessage.timestamp) : 0;
              const timeB = b.lastMessage ? parseInt(b.lastMessage.timestamp) : 0;
              return timeB - timeA;
            });
          });
        } catch (error) {
          console.error("Failed to process recall notification:", error);
        }
      }
    );

    // Cleanup subscriptions khi component unmount hoặc authUser thay đổi
    return () => {
      if (stompClient && stompClient.connected) {
        messageSubscription?.unsubscribe();
        deleteSubscription?.unsubscribe();
        console.log("Unsubscribed from WebSocket topics in Sidebar");
      }
    };
  }, [authUser, stompClient]);

  return (
    <aside className="h-full w-80 bg-muted text-foreground p-6 rounded-2xl shadow-lg transition-colors">
      <h2 className="text-2xl font-bold mb-6 text-primary">Messages</h2>

      {/* Search box */}
      <SearchFriends authUser={authUser} onSelectUser={setSelectedUser} />

      {/* Danh sách contacts */}
      <div className="space-y-5">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.userId}
              className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors duration-200 ${selectedUser?.userId === user.userId
                  ? "bg-accent"
                  : "hover:bg-muted/70 bg-muted"
                }`}
              onClick={() => {
                console.log("Selected user:", user);
                setSelectedUser({
                  userId: user.userId,
                  fullName: user.fullName,
                  avatar: user.avatarUrl || "/avatar.png",
                });
              }}
            >
              <img
                src={user.avatarUrl || "/avatar.png"}
                alt={user.fullName}
                className="w-14 h-14 rounded-full object-cover shadow-md"
              />
              <div className="flex-1">
                <p className="font-medium text-lg">{user.fullName}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground truncate">
                    {user.lastMessage ? (
                      <>
                        {user.lastMessage.sentByCurrentUser ? "You: " : ""}
                        {user.lastMessage.content || "Send a picture"}
                      </>
                    ) : (
                      "No messages yet"
                    )}
                  </p>
                  {user.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      · {formatLastMessageTime(user.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No contacts found.</p>
        )}
      </div>
    </aside>

  );
};

export default Sidebar;