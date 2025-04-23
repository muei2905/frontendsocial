import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 bg-base-100/50">
      <div className="max-w-md text-center space-y-4">
        {/* Icon Chat */}
        <div className="flex justify-center mb-2">
          <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce hover:scale-110 transition-transform duration-300">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold text-base-content">Welcome to Chatty!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
