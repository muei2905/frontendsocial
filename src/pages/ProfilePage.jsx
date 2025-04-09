import React, { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Separator } from "../components/ui/Separator";
import { useProfileStore } from "../store/useProfileStore";
import { usePostStore } from "../store/usePostStore";
import PostCard from "../components/PostCard";
import CreatePostCard from "../components/CreatePostCard";

export const ProfilePage = () => {
  // Lấy dữ liệu từ useProfileStore
  const { user, loading: userLoading, error: userError, fetchUser } = useProfileStore();

  // Lấy dữ liệu từ usePostStore
  const { posts, loading: postsLoading, error: postsError, fetchPosts } = usePostStore();

  // Gọi API khi component mount
  useEffect(() => {
    fetchUser(); // Lấy thông tin người dùng
    fetchPosts(); // Lấy danh sách bài đăng
  }, [fetchUser, fetchPosts]);

  // Nếu đang tải, hiển thị thông báo
  if (userLoading || postsLoading) {
    return (
      <div className="w-full min-h-screen p-4" style={{ marginLeft: "16rem" }}>
        Loading...
      </div>
    );
  }

  // Nếu có lỗi, hiển thị thông báo lỗi
  if (userError || postsError) {
    return (
      <div className="w-full min-h-screen p-4" style={{ marginLeft: "16rem" }}>
        Error: {userError || postsError}
      </div>
    );
  }

  // Sắp xếp bài đăng theo thời gian tạo (mới nhất → cũ nhất)
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.createAt) - new Date(a.createAt);
  });

  return (
    <div className="max-w-6xl mx-auto" style={{ marginLeft: "16rem" }}>
      {/* Thông tin người dùng */}
      <section className="p-6 flex justify-between items-start">
        <div className="flex items-start gap-6">
          <Avatar className="w-[200px] h-[200px]">
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
          <div className="flex flex-col justify-center mt-16">
            <h2 className="text-2xl font-bold">
              {user?.fullName || "Unknown"}
            </h2>
            <p className="text-lg text-gray-500">
              {user?.email || "No email"}
            </p>
          </div>
        </div>
        <Button className="rounded-lg">Edit Profile</Button>
      </section>

      <Separator className="mx-auto w-[95%] bg-[#1e1e1e]" />

      {/* Form tạo bài đăng */}
      <CreatePostCard user={user} />

      {/* Danh sách bài đăng từ store */}
      <section className="space-y-4 mt-4 px-6">
        {sortedPosts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} user={user} />
          ))
        )}
      </section>
    </div>
  );
};

export default ProfilePage;