import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Separator } from "../components/ui/Separator";
import { useProfileStore } from "../store/useProfileStore";
import { usePostStore } from "../store/usePostStore";
import PostCardMe from "../components/PostCardMe";
import PostInput from "../components/PostInput";
import ProfileDetails from "../components/ProfileDetails";
import { Pen } from "lucide-react";

export const ProfilePage = () => {
  // Lấy dữ liệu từ useProfileStore
  const {
    user,
    loading: userLoading,
    error: userError,
    fetchUser,
    updateProfile,
    isUpdatingProfile,
  } = useProfileStore();

  // Lấy dữ liệu từ usePostStore
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    fetchPosts,
    createPost,
    isLoading,
  } = usePostStore();

  // State để quản lý hiển thị popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    avatar: "",
  });

  // Gọi API khi component mount
  useEffect(() => {
    fetchUser(); // Lấy thông tin người dùng
    fetchPosts(); // Lấy danh sách bài đăng
  }, [fetchUser, fetchPosts]);

  // Cập nhật formData khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        avatar: user.avatar || "https://c.animaapp.com/taiAUsBV/img/siba-inu-red-dog-head-600nw-730870726@2x.png",
      });
    }
  }, [user]);

  const handleNewPost = (newPost) => {
    createPost(newPost);
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      handleClosePopup();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Nếu đang tải
  if (userLoading || postsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-30"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (userError || postsError) {
    return (
      <div className="w-full min-h-screen p-4" style={{ marginLeft: "16rem" }}>
        Error: {userError || postsError}
      </div>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.createAt) - new Date(a.createAt);
  });

  return (
    <div className="max-w-6xl mx-auto" style={{ marginLeft: "16rem" }}>
      <section className="p-6 flex justify-between items-start">
        <div className="flex items-start gap-6">
          <Avatar className="w-[150px] h-[150px]">
            <AvatarImage
              src={
                user?.avatar ||
                "https://c.animaapp.com/taiAUsBV/img/siba-inu-red-dog-head-600nw-730870726@2x.png"
              }
              alt={user?.fullName || "User"}
            />
            <AvatarFallback>
              {user?.fullName ? user.fullName[0] : "T"}
            </AvatarFallback>
          </Avatar>
          <row className="flex flex-col justify-center mt-12">
            <h2 className="text-2xl font-bold text-base-content">
              {user?.fullName || "Unknown"}
            </h2>
            <p className="text-lg text-gray-500">{user?.email || "No email"}</p>
          </row>
        </div>
        <button
            onClick={handleOpenPopup}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors mr-8"
            title="Edit Profile"
          >
            <Pen className="w-6 h-6 text-gray-300 hover:text-white" />
          </button>
      </section>

      <ProfileDetails
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        user={user}
        formData={formData}
        setFormData={setFormData}
        onUpdate={handleUpdateProfile}
        isLoading={isUpdatingProfile}
      />

      <Separator className="w-[95%] bg-gray-900" />

      <section className="relative w-full my-1 mt-4">
        <PostInput onPost={handleNewPost} />
      </section>

      <section className="mt-4">
        {sortedPosts.length === 0 ? (
          <p>No posts here.</p>
        ) : (
          sortedPosts.map((post) => (
            <PostCardMe key={post.id} post={post} />
          ))
        )}
      </section>
    </div>
  );
};

export default ProfilePage;