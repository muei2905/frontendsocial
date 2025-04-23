import { useState } from "react";
import ChatContainer from "../components/ChatContainer";
import Sidebar from "../components/Sidebar";


const ChatApp = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="flex h-screen"> 
      <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
    </div>
  );
};

export default ChatApp;