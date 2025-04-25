import { useEffect } from "react";
import { usePostStore } from "../store/usePostStore";
import PostCard from "../components/PostCardnewFeed";
import PostInput from "../components/PostInput";

const NewsFeed = () => {
  const { posts, getPosts, createPost, isLoading } = usePostStore();

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  const handleNewPost = (newPost) => {
    createPost(newPost);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100 text-base-content">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary opacity-30"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          </div>
          <span className="text-sm opacity-70">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-base-content bg-base-100 min-h-screen p-4">
  

  <div className="w-full max-w-3xl flex flex-col gap-6 ml-60">
    <PostInput onPost={handleNewPost} />

    {posts.length === 0 ? (
      <div className="text-center text-sm opacity-70">
        No posts yet. Be the first to post!
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )}
  </div>
</div>

  );
};

export default NewsFeed;
