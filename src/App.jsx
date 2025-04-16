import Navbar from "./components/Navbar";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingPage from "./pages/SettingPage";
import ProfilePage from "./pages/ProfilePage";
import FriendPage from "./pages/FriendPage";
import NewsFeedPage from "./pages/NewFeedsPage";
import { ForgotPass } from "./pages/ForgotPassPage";
import { Verification } from "./pages/VerificatonPage";
import { ResetPass } from "./pages/ResetPassPage";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect, useState } from "react";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, connectSocket, disconnectSocket } =
    useAuthStore();
  const { theme } = useThemeStore();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [authUser, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (!authUser) {
      console.log("checkAuth()");
      checkAuth(navigate);
    }
  }, []);

  return (
    <div data-theme={theme}>
      <div className="flex">
        {/* Navbar dọc bên trái */}
        {authUser && <Navbar />}
        {/* Nội dung chính */}
        <div className="flex-1 ml-[84px] h-full ">
          <Routes className="h-full">
            <Route
              path="/"
              element={authUser ? <NewsFeedPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/newsfeeds"
              element={authUser ? <NewsFeedPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/messages"
              element={authUser ? <ChatPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/signup"
              element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route path="/settings" element={<SettingPage />} />
            <Route
              path="/profile"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/friends"
              element={authUser ? <FriendPage /> : <Navigate to="/login" />}
            />
            <Route path="/forgotpass" element={<ForgotPass />} />
            <Route path="/verify" element={<Verification />} />
            <Route path="/resetpass" element={<ResetPass />} />
          </Routes>
        </div>
      </div>
      {/* Hiển thị thông báo */}
      <div className="fixed bottom-5 right-5 space-y-2">
        {notifications.map((notify) => (
          <Notification
            key={notify.id}
            type={notify.type}
            content={notify.content}
            time={notify.time}
            onClose={() =>
              setNotifications((prev) => prev.filter((n) => n.id !== notify.id))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default App;
