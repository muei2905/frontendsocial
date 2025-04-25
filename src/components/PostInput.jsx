import { useState } from "react";
import { Image, Send, Lock, Globe } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";

const PostInput = ({ onPost }) => {
  const { authUser } = useAuthStore();
  const { isLoadUpPost } = usePostStore();

  const [content, setContent] = useState("");
  const [images, setImages] = useState("");
  const [viewMode, setViewMode] = useState("PUBLIC");

  const handlePost = () => {
    if (!content.trim() && images.length === 0) return;

    const newPost = {
      content: content,
      imageUrl: images,
      viewMode: viewMode,
    };
    onPost(newPost);

    setContent("");
    setImages("");
    setViewMode("PUBLIC");
  };

  const handleContentChange = (e) => setContent(e.target.value);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });
    setImages(base64Image);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "PUBLIC" ? "PRIVATE" : "PUBLIC"));
  };

  return (
    <div className="relative shadow-lg rounded-xl p-5 w-5/6  bg-base-200 border border-base-200">
      <div className="flex items-start gap-4">
        <img
          src={authUser?.image || "/default-avatar.png"}
          alt="Avatar"
          className="w-12 h-12 rounded-full"
        />
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Bạn đang nghĩ gì?"
          className="flex-1 focus:outline-none p-3 h-12 text-base-content bg-base-200 rounded-lg resize-none"
          rows={2}
        />
      </div>

      {/* Hiển thị ảnh */}
      {images && (
        <div className="mt-4 flex gap-2 overflow-x-auto">
          <div className="relative">
            <img
              src={images}
              alt="Preview"
              className="rounded-lg max-h-24 object-cover w-24 shadow-sm"
            />
            <button
              onClick={() => setImages("")}
              className="absolute -top-2 right-1 text-error text-xl font-bold hover:scale-110"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Chức năng thêm ảnh + chế độ + đăng */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="flex items-center gap-2 text-primary hover:underline cursor-pointer"
          >
            <Image className="w-5 h-5" />
            Ảnh
          </label>

          <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 text-base-content/70 hover:text-primary transition"
          >
            {viewMode === "PUBLIC" ? (
              <>
                <Globe className="w-5 h-5" />
                Công khai
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Riêng tư
              </>
            )}
          </button>
        </div>

        {/* Nút đăng bài */}
        <button
          onClick={handlePost}
          disabled={!content.trim() && images.length === 0}
          className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold ${
            content.trim() || images.length
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-base-300 text-base-content/50 cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
          Đăng
        </button>
      </div>

      {/* Loading overlay khi đăng */}
      {isLoadUpPost && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary"></div>
            <p className="text-white font-medium">Đang xử lý...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostInput;
