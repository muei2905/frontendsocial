import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(post.likedByMe);
  const [countLike, setCountLike] = useState(post.totalLike);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [visibleComments, setVisibleComments] = useState(5);
  const [showImage, setShowImage] = useState(false);

  const { sendCmt, likePost, isLoadingLike } = usePostStore();
  const { authUser } = useAuthStore();
  const avt = "";

  const handleShowMoreComments = () => {
    setVisibleComments((prev) => prev + 5);
  };

  const toggleLike = () => {
    setLiked(!liked);
    setCountLike(liked ? countLike - 1 : countLike + 1);
    likePost(post.id);
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
    sendCmt({ postId: post.id, content: commentText.trim() });
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
    <div className="relative w-5/6 my-1">
      {isLoadingLike === post.id && (
        <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center rounded-lg">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-sm mt-2 text-base-content/70">Đang xử lý lượt thích...</p>
        </div>
      )}

      <div className={`bg-base-100 text-base-content shadow-md rounded-xl ${isLoadingLike === post.id ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 rounded">
            <img src={post.avatar || avt} alt="Avatar" className="w-10 h-10 rounded-full object-cover rounded-full border-2 border-base-200" />
            <div>
              <h3 className="font-semibold">{post.userName}</h3>
              <p className="text-xs text-base-content/60">{formatFriendlyTime(post.createAt)}</p>
            </div>
          </div>
          <button className="text-base-content/60 hover:text-base-content">⋮</button>
        </div>

        <p className="px-4 pt-1 pb-2 text-base">{post.content}</p>

        {post.imageUrl && (
          <>
            <div className="w-full pb-2">
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full object-cover max-h-96 cursor-pointer hover:opacity-90 transition"
                onClick={() => setShowImage(true)}
              />
            </div>

            {showImage && (
              <div
                className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                onClick={() => setShowImage(false)}
              >
                <img
                  src={post.imageUrl}
                  alt="Zoomed"
                  className="h-[90%]  rounded-md shadow-lg "
                />
              </div>
            )}
          </>
        
        )}

        <div className="flex items-center justify-between text-sm px-4 py-3">
          <button onClick={toggleLike} className="flex items-center gap-1 text-base-content/80 hover:text-primary">
            <Heart className={` w-6 h-5 transition ${liked ? "text-red-500 fill-red-500" : ""}`} />
            <span>{countLike}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-base-content/80 hover:text-primary">
            <MessageCircle className="w-5 h-5" />
            <span>{comments.length}</span>
          </button>
        </div>

        {showComments && (
          <div className="px-4 pb-4">
            {comments.length === 0 ? (
              <p className="text-sm text-base-content/50">Hãy là người đầu tiên bình luận nhé.</p>
            ) : (
              <div className="space-y-3">
                {comments.slice(0, visibleComments).map((cmt, index) => (
                  <div key={index} className="flex gap-2 border-b border-base-300 pb-2">
                    <img src={cmt.userImg || avt} className="w-8 h-8 rounded-full" alt="Avatar" />
                    <div>
                      <p className="text-sm font-medium">{cmt.userName}</p>
                      <p className="text-sm text-base-content/70">{cmt.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length > visibleComments && (
                  <button
                    onClick={handleShowMoreComments}
                    className="text-sm text-primary hover:underline"
                  >
                    Xem thêm bình luận
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <img src={authUser.image || avt} alt="Avatar" className="w-8 h-8 rounded-full" />
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Viết bình luận..."
                className="flex-1 bg-base-200 text-sm px-3 py-2 rounded-full focus:outline-none text-base-content"
              />
              <button onClick={handleSendComment}>
                <Send className="w-5 h-5 text-primary hover:text-primary/80" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
