import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";
import { useProfileStore } from "../store/useProfileStore";
import EditPostModal from "./EditPostModal";


const PostCardMe = ({ post }) => {
  const [liked, setLiked] = useState(post.likedByMe);
  const [countLike, setCountLike] = useState(post.totalLike);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const { sendCmt, likePost, isLoadingLike, deletePost } = usePostStore();
  const { authUser } = useAuthStore();
  const avt = ''; 
  const [visibleComments, setVisibleComments] = useState(5);

  const [showMenu, setShowMenu] = useState(false); 
  const [showEditModal, setShowEditModal] = useState(false);

  const likedUsers = post.likedUsers;
  const handleShowMoreComments = () => {
    setVisibleComments((prev) => prev + 5);
  };
  const {user} = useProfileStore();


  const toggleLike = () => {
    setLiked(!liked);
    setCountLike(liked ? countLike - 1 : countLike + 1)
    likePost(post.id)
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      userName: authUser?.userName || "Bạn",
      userImg: authUser.image,
      content: commentText.trim(),
    };
    setComments([...comments, newComment]);
    setCommentText("");
    const data = {
      "postId": post.id,
      "content": commentText.trim()
    }
    sendCmt(data);
  };

  const handleDelete = () => {
    deletePost(post.id); // Gọi hàm xóa bài đăng
    setShowMenu(false); // Ẩn menu sau khi xóa
  };

  const handleEdit = () => {
    setShowEditModal(true); // Hiển thị popup chỉnh sửa
    setShowMenu(false); // Ẩn menu sau khi chọn chỉnh sửa
  };

  const formatFriendlyTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 5) return "Vừa xong";
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const hh = time.getHours().toString().padStart(2, "0");
    const mm = time.getMinutes().toString().padStart(2, "0");
    const dd = time.getDate().toString().padStart(2, "0");
    const mo = (time.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = time.getFullYear();

    if (diffInHours < 48) return `Hôm qua lúc ${hh}:${mm}`;
    return `${hh}:${mm} ${dd}/${mo}/${yyyy}`;
  };



  return (
    <div className="relative w-[80%] my-1">
      {isLoadingLike === post.id && (
        <div className="absolute inset-0 bg-opacity-50 z-10 flex flex-col items-center justify-center rounded-lg">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-30"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          </div>
          <p className="text-sm mt-2 text-gray-300">Đang xử lý lượt thích...</p>
        </div>
      )}

      {/* Nội dung card */}
      <div className={`mt-4 border border-base-100 shadow-2xl shadow-base-300 rounded-lg ${isLoadingLike === post.id ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center">
            <img
              src={post.avatar || avt}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-3">
              <h3 className="font-semibold text-base-content">{post.userName}</h3>
              <p className="text-sm text-gray-400">
                {formatFriendlyTime(post.createAt)}
              </p>
            </div>
          </div>
          {/* Nút menu ⋮ */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="transition-colors duration-200"
            >
              ⋮
            </button>
            {/* Menu tùy chọn */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-gray-800 text-white rounded-lg shadow-lg z-20">
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t-lg"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b-lg text-red-500"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>

        <p className=" mb-1 pl-4 pt-2 text-lg">{post.content}</p>

        {post.imageUrl && (
          <div className="grid grid-cols-1 gap-2">
            <img
              src={post.imageUrl}
              alt="Main"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between p-3 rounded-2xl">
          <button onClick={toggleLike} className="flex items-center gap-1">
            <Heart
              className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
            />
            <span>{countLike}     </span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1">
            <MessageCircle className="w-5 h-5" />
            <span>{comments.length}</span>
          </button>
        </div>

        {/* Danh sách bình luận */}
        {showComments && (
          <div className="px-4 pb-4">
            {comments.length === 0 ? (
              <p className="text-sm">Chưa có bình luận nào.</p>
            ) : (
              <div className="space-y-3">
                {comments.slice(0, visibleComments).map((cmt, index) => (
                  <div key={index} className="flex gap-2 border-b border-gray-700 pb-2">
                    <img
                      src={cmt.userImg || avt}
                      className="w-8 h-8 rounded-full"
                      alt="Avatar"
                    />
                    <div>
                      <p className="text-sm font-medium">{cmt.userName}</p>
                      <p className="text-sm">{cmt.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length > visibleComments && (
                  <button
                    onClick={handleShowMoreComments}
                    className="text-sm mt-2 hover:underline"
                  >
                    Xem thêm bình luận
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <img
                src={user.avatar || avt}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                type="text"
                placeholder="Viết bình luận..."
                className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded-full focus:outline-none"
              />
              <button onClick={handleSendComment}>
                <Send className="w-5 h-5 hover:text-blue-600" />
              </button>
            </div>
          </div>
        )}
      </div>
      {showEditModal && (
        <EditPostModal post={post} onClose={() => setShowEditModal(false)} />
      )}  
    </div>
  );

};

export default PostCardMe;
