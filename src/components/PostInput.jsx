import { useState } from "react";
import { Image, Send } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";

const PostInput = ({ onPost }) => {
  const { authUser } = useAuthStore();
  const { isLoadUpPost } = usePostStore();

  const [content, setContent] = useState("");
  const [images, setImages] = useState('');

  const handlePost = () => {
    if (!content.trim() && images.length === 0) return;

    const newPost = {
      content: content,
      imageUrl: images,
      viewMode: "PUBLIC"

    };
    onPost(newPost); // Gọi onPost để thêm bài vào list_posts

    setContent("");
    setImages('');
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

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


  return (
    <div className="relative  shadow-lg rounded-xl p-5 w-3/4 max-w-2xl mb-6 border border-gray-700 overflow-hidden">
      <div className="flex items-start gap-4">
        <img
          src={authUser?.image || "/default-avatar.png"}
          alt="Avatar"
          className="w-12 h-12 rounded-full"
        />
        <input
          value={content}
          onChange={handleContentChange}
          placeholder="Bạn đang nghĩ gì?"
          className="flex-1 focus:outline-none p-4 text-white rounded-lg border-b-2 border-gray-600"
          style={{
            minHeight: "50px",
            maxHeight: "50px",
            overflowY: "auto",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
        />
      </div>

      {/* Hiển thị ảnh */}

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {images &&
          <div className="relative">
            <img
              src={images}
              alt="Preview"
              className="rounded-lg max-h-24 object-cover w-24 shadow-sm"
            />
            <button
              onClick={() => setImages('')}
              className="absolute -top-2 right-1 bg-transparent border-none text-white text-3xl"
              style={{ cursor: "pointer", borderRadius: "50%" }}
            >
              ×
            </button>
          </div>
        }
      </div>


      {/* Chức năng thêm ảnh + Đăng bài */}
      <div className="flex justify-between mt-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-500 cursor-pointer transition-all"
        >
          <Image className="w-5 h-5" />
          Ảnh
        </label>

        <button
          onClick={handlePost}
          disabled={!content.trim() && images.length === 0}
          className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all ${content.trim() || images.length
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-600 text-gray-400 "
            }`}
        >
          <Send className="w-5 h-5" />
          Đăng
        </button>
        {isLoadUpPost && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-xl z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid mb-4"></div>
            <p className="text-white font-medium">Đang xử lý...</p>
          </div>
        )}

      </div>

    </div>
  );
};

export default PostInput;
