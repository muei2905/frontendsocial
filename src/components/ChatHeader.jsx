import { X } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const ChatHeader = ({ selectedUser, setSelectedUser }) => {
  const {theme} = useThemeStore();
  return (
    <div className={`
        p-2.5 border-b border-base-300 rounded-2xl
        ${theme === "dark" ? "bg-zinc-900" : "bg-base-100"}
      `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser?.avatar || "/avatar.png"}
                alt={selectedUser?.fullName || "User"}
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium text-base-content">{selectedUser?.fullName || "No user selected"}</h3>
            <p className="text-sm text-base-content/70 text-base-content">
              {selectedUser ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;