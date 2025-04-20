import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likesCount);



  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="bg-gray-800 text-white shadow-lg rounded-lg  w-3/4">
      <div className="flex items-center mb-2 pt-4 pl-4">
        <img
          // src={post.createdBy.profilePic || authUser.profilePic || ''}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-2">
          <h3 className="font-semibold">{post.userName || "dá"}</h3>
          <p className="text-sm text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <p className="text-gray-200 mb-3 pl-4">{post.userName}</p>

      {post.images && post.images.length === 3 && (
        <div className="grid grid-cols-2 gap-2">
          <img
            src={post.images[0]}
            alt="Main Image"
            className="w-full h-full object-cover "
          />

          {/* Cột 2: Hai ảnh nhỏ */}
          <div className="grid gap-2">
            <img
              src={post.images[1]}
              alt="Sub Image 1"
              className="w-full h-full object-cover "
            />
            <img
              src={post.images[2]}
              alt="Sub Image 2"
              className="w-full h-full object-cover "
            />
          </div>
        </div>
      )}



      <div className="flex items-center justify-between text-gray-400 p-3">
        <button onClick={toggleLike} className="flex items-center gap-1">
          <Heart
            className={`w-5 h-5 ${liked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
          />
          <span>{likeCount}</span>
        </button>

        <div className="flex items-center gap-1">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <span>{post.comments.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
