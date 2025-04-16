import { useState } from "react";
import { HeartIcon, MessageSquareIcon, MoreVerticalIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/Card";
import CommentPopup from "./CommentPopup";

export const PostCard = ({ post, user }) => {
  // Định dạng thời gian theo "dd thg MM, yyyy"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day} thg ${month}, ${year}`;
  };

  const formattedDate = formatDate(post.createAt);

  // Trạng thái để quản lý hiển thị popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Card className="border-[#2c2c2c] border-[0.5px] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b-[0.5px] border-[#2c2c2c]">
          <div className="flex items-center gap-2">
            <Avatar className="w-[50px] h-[50px]">
              <AvatarImage
                src={
                  user?.avatar ||
                  "https://c.animaapp.com/taiAUsBV/img/avatar-2@2x.png"
                }
                alt={user?.fullName || "User"}
              />
              <AvatarFallback>
                {user?.fullName ? user.fullName[0] : "T"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-xl">
                {user?.fullName || "Unknown"}
              </h3>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVerticalIcon className="h-6 w-6" />
          </Button>
        </CardHeader>

        {post.content && (
          <CardContent className="p-4 border-b-[0.5px] border-[#2c2c2c]">
            <p>{post.content}</p>
          </CardContent>
        )}

        {post.imageUrl && (
          <CardContent className="p-0 border-b-[0.5px] border-[#2c2c2c] flex justify-center items-center">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="max-w-full h-auto object-contain"
            />
          </CardContent>
        )}

        <CardFooter className="flex items-center p-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="p-0">
                <HeartIcon className="w-[34px] h-[34px]" />
              </Button>
              <span className="font-medium">{post.totalLike} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="p-0"
                onClick={() => setIsPopupOpen(true)}
              >
                <MessageSquareIcon className="w-[34px] h-[34px]" />
              </Button>
              <span className="font-medium">{post.totalCmt} comments</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      {isPopupOpen && (
        <CommentPopup
          post={post}
          user={user}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  );
};

export default PostCard;
