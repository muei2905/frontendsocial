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
        <div className="flex items-center justify-center min-h-screen bg-  text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-30"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
            </div>
          </div>
        </div>
      );
    }
    
  return (
    <div className="flex flex-col items-center text-white min-h-screen p-4">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-blue-400">
        News Feed
      </h1>

      <div className="w-full max-w-3xl">
        <PostInput onPost={handleNewPost} />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-3xl mt-6 -ml-48">
        {
          posts.map((post) => (
            
            <PostCard key={post.id} post={post} /> 
          ))
        }
      </div>
    </div>
  );
};

export default NewsFeed;
