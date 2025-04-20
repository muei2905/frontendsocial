import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Users, Settings, LogOut, Newspaper,User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  const handleNavItemClick = (path) => {
    if (path === "/messages") {
      setIsExpanded(!isExpanded); // Thu gọn navbar khi click Messages
    }
    else
    {
      setIsExpanded(true);
    }
  };
  const handleLogout = () => {
    if (isLoggingOut) return; // Ngăn gọi logout nhiều lần
    setIsLoggingOut(true);
    console.log("🛑 Calling logout function...");
    logout(navigate);
    setIsLoggingOut(false);
  };
  return (
    <aside className={`rounded-r-2xl z-20 fixed left-0 top-0 h-full text-white ${isExpanded ? "w-64" : "w-20"} flex flex-col items-center py-6 transition-all`}>

      <div className="flex flex-col items-center mb-6">
        <img
          src={authUser.image}
          alt="Profile"
          className={`rounded-full mb-2 ${isExpanded ? "w-24" : "w-14"}` }
        />
        {isExpanded && (
          <div className="text-center">
            <h2 className="text-lg font-semibold">{authUser?.userName || "Guest"}</h2>
            <p className="text-sm text-gray-400">@{authUser?.username || "unknown"}</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="w-full space-y-2 flex flex-col items-center">
        <NavItem to="/newsfeeds" icon={Newspaper} label="News Feed" isExpanded={isExpanded} active={location.pathname === "/newsfeeds"} onClick={() => handleNavItemClick("/newsfeed")} />
        <NavItem to="/messages" icon={MessageSquare} label="Messages" badge={5} isExpanded={isExpanded} active={location.pathname === "/messages"} onClick={() => handleNavItemClick("/messages")} />
        <NavItem to="/friends" icon={Users} label="Friends" badge={2} isExpanded={isExpanded} active={location.pathname === "/friends"} onClick={() => handleNavItemClick("/friends")} />
        <NavItem to="/profile" icon={User} label="Profile" isExpanded={isExpanded} active={location.pathname === "/profile"} onClick={() => handleNavItemClick("/profile")} />
        <NavItem to="/settings" icon={Settings} label="Settings" isExpanded={isExpanded} active={location.pathname === "/settings"} onClick={() => handleNavItemClick("/settings")} />
      </nav>

      {/* Logout Button */}
      <button className="mt-auto bg-gray-700 px-4 py-2 rounded-lg w-11/12 flex items-center justify-center gap-2 hover:bg-gray-600"
          onClick={handleLogout}>
        <LogOut className="w-5 h-5" />
        {isExpanded && <span>Log out</span>}
      </button>
    </aside>
  );
};

const NavItem = ({ to, icon: Icon, label, active, badge, isExpanded, onClick }) => {
  return (
    <Link
      to={to}
      className={`flex items-center ${isExpanded ? "gap-3 w-11/12 px-4 py-2" : "w-12 h-12 justify-center"} rounded-lg transition-all ${active ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      {isExpanded && <span className="text-sm flex-1">{label}</span>}
      {badge && isExpanded && <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full">{badge}</span>}
    </Link>
  );
};

export default Navbar;
