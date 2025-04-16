import { X, Smile, Camera, Image, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const CommentPopup = ({ post, user, onClose }) => {
  // Định dạng thời gian bình luận (nếu không có time, dùng createAt của bài đăng)
  const formatCommentTime = (commentTime, postCreateAt) => {
    const time = commentTime ? new Date(commentTime) : new Date(postCreateAt);
    return time.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#1e1e1e] rounded-lg w-[600px] max-h-[80vh] flex flex-col">
        {/* Header của popup */}
        <div className="flex justify-between items-center p-4 border-b border-[#2c2c2c]">
          <h2 className="text-xl font-bold text-white">Bình luận</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Danh sách bình luận */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-gray-500">Chưa có bình luận nào.</p>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src="https://c.animaapp.com/taiAUsBV/img/avatar-2@2x.png"
                    alt={comment.userName}
                  />
                  <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="bg-[#2c2c2c] rounded-lg p-3">
                  <p className="font-semibold text-white">{comment.userName}</p>
                  <p className="text-gray-300">{comment.content}</p>
                  <p className="text-xs text-gray-500">
                    {formatCommentTime(comment.time, post.createAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form nhập bình luận */}
        <div className="p-4 border-t border-[#2c2c2c] flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={
                user?.avatar ||
                "https://c.animaapp.com/taiAUsBV/img/avatar-2@2x.png"
              }
              alt={user?.fullName || "User"}
            />
            <AvatarFallback>
              {user?.fullName ? user.fullName[0] : "U"}
            </AvatarFallback>
          </Avatar>

          {/* Input và các biểu tượng */}
          <div className="flex-1 flex items-center gap-2 bg-[#2c2c2c] rounded-full px-3 py-2">
            {/* Input */}
            <Input
              className="flex-1 bg-transparent text-white border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-gray-400"
              placeholder="Viết bình luận..."
            />

            {/* Biểu tượng gửi */}
            <Button variant="ghost" size="icon" className="p-0">
              <Send className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentPopup;
