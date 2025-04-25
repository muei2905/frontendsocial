import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Newspaper,
  User,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavItemClick = (path) => {
    if (path === "/messages") {
      setIsExpanded(!isExpanded);
    } else {
      setIsExpanded(true);
    }
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    logout(navigate);
    setIsLoggingOut(false);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-20 transition-all
        ${isExpanded ? "w-64" : "w-20"}
        flex flex-col items-center py-6
        bg-base-200 text-base-content shadow-lg 
      `}
    >
      {/* Avatar + User Info */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={authUser.image}
          alt="Profile"
          className={`rounded-full border-4 border-base-200 shadow-md transition-all duration-300 ${
            isExpanded ? "w-24" : "w-14"
          }`}
        />
        {isExpanded && (
          <div className="text-center mt-2">
            <h2 className="text-lg font-semibold truncate">
              {authUser?.userName || "Guest"}
            </h2>
            <p className="text-sm text-base-content/60 truncate">
              {authUser?.email || "unknown"}
            </p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="w-full px-2 space-y-2 flex flex-col items-center">
        <NavItem
          to="/newsfeeds"
          icon={Newspaper}
          label="News Feed"
          isExpanded={isExpanded}
          active={location.pathname === "/newsfeeds"}
          onClick={() => handleNavItemClick("/newsfeeds")}
        />
        <NavItem
          to="/messages"
          icon={MessageSquare}
          label="Messages"
          
          isExpanded={isExpanded}
          active={location.pathname === "/messages"}
          onClick={() => handleNavItemClick("/messages")}
        />
        <NavItem
          to="/friends"
          icon={Users}
          label="Friends"
          isExpanded={isExpanded}
          active={location.pathname === "/friends"}
          onClick={() => handleNavItemClick("/friends")}
        />
        <NavItem
          to="/profile"
          icon={User}
          label="Profile"
          isExpanded={isExpanded}
          active={location.pathname === "/profile"}
          onClick={() => handleNavItemClick("/profile")}
        />
        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          isExpanded={isExpanded}
          active={location.pathname === "/settings"}
          onClick={() => handleNavItemClick("/settings")}
        />
      </nav>

      {/* Logout Button */}
      <button
        className="mt-auto bg-base-200 hover:bg-base-300 text-base-content px-4 py-2 rounded-lg w-11/12 flex items-center justify-center gap-2 transition"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        {isExpanded && <span className="font-medium">Log out</span>}
      </button>
    </aside>
  );
};

const NavItem = ({
  to,
  icon: Icon,
  label,
  active,
  badge,
  isExpanded,
  onClick,
}) => {
  return (
    <Link
      to={to}
      className={`flex items-center rounded-lg transition-all
        ${isExpanded ? "gap-3 w-11/12 px-4 py-2" : "w-12 h-12 justify-center"}
        ${active ? "bg-base-300 text-primary font-semibold" : "hover:bg-base-200"}
      `}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      {isExpanded && <span className="text-sm flex-1">{label}</span>}
      {badge && isExpanded && (
        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default Navbar;
