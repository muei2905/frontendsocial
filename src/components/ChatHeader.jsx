import { X } from "lucide-react";

const ChatHeader = ({ selectedUser, setSelectedUser }) => {
  return (
    <div className="p-2.5 border-b border-base-300 bg-neutral-900 rounded-2xl">
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
            <h3 className="font-medium text-zinc-50">{selectedUser?.fullName || "No user selected"}</h3>
            <p className="text-sm text-base-content/70 text-zinc-50">
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