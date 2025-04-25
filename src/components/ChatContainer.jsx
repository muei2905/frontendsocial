import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import NoChatSelected from "./NoChatSelected";
import { useAuthStore } from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const {
    messages,
    page,
    totalPages,
    isLoading,
    userId,
    selectedUserDetails,
    shouldScrollToBottom,
    setMessages,
    setPage,
    setShouldScrollToBottom,
    fetchUserProfile,
    fetchSelectedUserDetails,
    fetchMessages,
    handleSendMessage,
    handleDeleteMessage,
    subscribeToMessages,
    subscribeToDeleteNotifications,
  } = useChatStore();

  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const [noMoreMessages, setNoMoreMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const { authUser, setAuthUser } = useAuthStore();

  useEffect(() => {
    if (authUser && authUser.jwt) {
      fetchUserProfile(authUser, setAuthUser);
    }
  }, [authUser, setAuthUser, fetchUserProfile]);

  useEffect(() => {
    if (selectedUser && selectedUser.userId && authUser?.jwt) {
      fetchSelectedUserDetails(selectedUser, authUser);
    }
  }, [selectedUser, authUser, fetchSelectedUserDetails]);

  useEffect(() => {
    if (userId && authUser && selectedUserDetails) {
      subscribeToMessages(userId, authUser, selectedUserDetails);
      subscribeToDeleteNotifications(userId);
    }
  }, [userId, authUser, selectedUserDetails, subscribeToMessages, subscribeToDeleteNotifications]);

  useEffect(() => {
    if (selectedUser && authUser) {
      setPage(0);
      setMessages([]);
      setShouldScrollToBottom(true);
      setNoMoreMessages(false);
      setIsLoadingOlder(false);
      fetchMessages(selectedUser, authUser, 0);
    }
  }, [selectedUser, authUser, setPage, setMessages, setShouldScrollToBottom, fetchMessages]);

  useEffect(() => {
    if (shouldScrollToBottom && messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollDownButton(false);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    const handleScroll = () => {
      if (!messageContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (scrollTop < 10 && !isLoading && !isLoadingOlder) {
        setPage((prevPage) => {
          const newPage = prevPage + 1;
          if (newPage >= totalPages) {
            setNoMoreMessages(true);
            console.log("Không còn tin nhắn cũ để tải");
            return prevPage;
          }
          setNoMoreMessages(false);
          setIsLoadingOlder(true);
          console.log("Fetching older messages, page:", newPage);
          const previousHeight = messageContainerRef.current.scrollHeight;
          fetchMessages(selectedUser, authUser, newPage).then(() => {
            if (messageContainerRef.current) {
              const newHeight = messageContainerRef.current.scrollHeight;
              messageContainerRef.current.scrollTop = newHeight - previousHeight;
            }
            setIsLoadingOlder(false);
          }).catch((error) => {
            console.error("Failed to fetch older messages:", error);
            setIsLoadingOlder(false);
          });
          return newPage;
        });
      }

      setShowScrollDownButton(!isNearBottom);
    };

    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [page, totalPages, isLoading, isLoadingOlder, selectedUser, authUser, setPage, fetchMessages]);

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollDownButton(false);
    }
  };

  const onSendMessage = (newMessage) => {
    handleSendMessage(newMessage, selectedUser, userId, authUser, selectedUserDetails);
  };

  const onDeleteMessage = (messageId) => {
    handleDeleteMessage(messageId, authUser, userId, selectedUser);
    setMenuVisible(null);
  };

  const openImagePopup = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  };

  const closeImagePopup = () => {
    setShowImagePopup(false);
    setSelectedImage(null);
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto rounded-2xl h-full ml-1 relative">
      {!selectedUser ? (
        <NoChatSelected />
      ) : (
        <>
          <ChatHeader selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messageContainerRef}>
            {isLoadingOlder && (
              <p className="text-center text-gray-400">Đang tải tin nhắn cũ...</p>
            )}
            {noMoreMessages && (
              <p className="text-center text-gray-400">Không còn tin nhắn cũ</p>
            )}
            {
              messages.length > 0 ? (
                messages.map((message, index) => {
                  const isFromSelectedUser =
                    String(message.sender?.id || message.senderId) === String(selectedUser.userId);
                  const isSender = String(message.sender?.id || message.senderId) === String(userId);
                  const previousMessage = messages[index - 1];
                  const nextMessage = messages[index + 1];
                  const isSameSenderAsPrevious =
                    previousMessage &&
                    String(previousMessage.sender?.id || previousMessage.senderId) ===
                      String(message.sender?.id || message.senderId);
                  const isSameSenderAsNext =
                    nextMessage &&
                    String(nextMessage.sender?.id || nextMessage.senderId) ===
                      String(message.sender?.id || message.senderId);
                  const showAvatar = !isSameSenderAsNext || index === messages.length - 1;
                  const marginClass = isSameSenderAsPrevious ? "mb-0.5" : "mb-3";
                  // Determine if this is the latest message from this sender
                  const isLatestMessage = !nextMessage || 
                    String(nextMessage.sender?.id || nextMessage.senderId) !== 
                    String(message.sender?.id || message.senderId);
                  return (
                    <div
                      key={message.id || index}
                      className={`flex flex-col ${
                        isFromSelectedUser ? "items-start" : "items-end"
                      } ${marginClass} animate__animated animate__fadeInUp relative group`}
                      ref={index === messages.length - 1 ? messageEndRef : null}
                    >
                      <div
                        className={`flex w-full ${
                          isFromSelectedUser ? "flex-row" : "flex-row-reverse"
                        } gap-2 max-w-[70%]`}
                      >
                        {/* Avatar */}
                        {showAvatar ? (
                          <div className="chat-image avatar flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-50 shadow-lg">
                              <img
                                src={isFromSelectedUser ? selectedUser.avatar || "/avatar.png" : message.sender?.avatar || "/avatar.png"}
                                alt={isFromSelectedUser ? selectedUser.avatar || "Người dùng" : message.sender?.avatar || "Người dùng"}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 flex-shrink-0" />
                        )}

                        {/* Message Content and Menu */}
                        <div className="flex flex-col flex-1 relative">
                          {/* Message Menu for Sender */}
                          {isSender && !message.deleted && (
                            <div className="absolute left-[-2px] top-2 z-20">
                              <button
                                onClick={() => setMenuVisible(menuVisible === index ? null : index)}
                                className="text-gray-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6h.01M12 12h.01M12 18h.01"
                                  />
                                </svg>
                              </button>
                              {menuVisible === index && (
                                <div className="absolute left-0 top-6 text-white rounded-lg shadow-lg z-20 min-w-[120px]">
                                  <button
                                    onClick={() => onDeleteMessage(message.id)}
                                    className="block px-4 py-2 hover:bg-neutral-700 rounded-lg w-full text-left"
                                  >
                                    Recall Message
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                          className={`chat-bubble rounded-2xl p-4 break-words whitespace-pre-wrap max-w-[90%]
                            ${isFromSelectedUser 
                              ? "bg-base-200 text-base-content mr-auto shadow" 
                              : "bg-base-300 text-base-content ml-auto shadow-md"} 
                            ${message.deleted ? "italic text-gray-400 line-through" : ""}`}
                          
                          
                          >
                            {message.deleted ? (
                              <p>This message has been recalled.</p>
                            ) : (
                              <>
                                {message.picture && (
                                  <img
                                    src={message.picture}
                                    alt="Hình ảnh"
                                    className="w-[200px] rounded-lg mb-2 cursor-pointer"
                                    onClick={() => openImagePopup(message.picture)}
                                  />
                                )}
                                {message.content && (
                                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                                )}
                                {isLatestMessage && message.timestamp && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatTimestamp(message.timestamp)}
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Sent Status */}
                          {isSender && !message.deleted && index === messages.length - 1 && (
                            <p className="text-xs text-gray-400 text-right mt-1">Đã gửi</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                !isLoading && !isLoadingOlder && (
                  <p className="text-center text-gray-400">Chưa có tin nhắn</p>
                )
              )
            }
          </div>
          <MessageInput onSendMessage={onSendMessage} />
          {showScrollDownButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-20 right-4 bg-gray-800 text-white rounded-full p-3 shadow-lg hover:bg-gray-700 transition-colors"
              title="Cuộn xuống tin nhắn mới nhất"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          )}
        </>
      )}

      {showImagePopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeImagePopup}
        >
          <div className="relative max-w-3xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Hình lớn"
              className="w-full h-auto rounded-lg shadow-lg max-h-[80vh] object-contain"
            />
            <button
              onClick={closeImagePopup}
              className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;