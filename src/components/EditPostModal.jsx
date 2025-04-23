import { useState, useEffect } from "react";
import { Image, Send, X, Lock, Globe } from "lucide-react"; // Thêm icon Lock và Globe
import { useAuthStore } from "../store/useAuthStore";
import { usePostStore } from "../store/usePostStore";
import { useProfileStore } from "../store/useProfileStore";
import toast from "react-hot-toast";

const EditPostModal = ({ post, onClose }) => {
  const { authUser } = useAuthStore();
  const { updatePost, isLoading } = usePostStore();
  const { user } = useProfileStore();

  const [content, setContent] = useState(post?.content || "");
  const [image, setImage] = useState(post?.imageUrl || "");
  const [viewMode, setViewMode] = useState(post?.viewMode || "PUBLIC"); // Thêm state viewMode

  // Vô hiệu hóa scroll khi mở popup
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // Khôi phục scroll khi đóng popup
    };
  }, []);

  const handleUpdate = async () => {
    if (!content.trim() && !image) return;

    const updatedPost = {
      content: content,
      imageUrl: image,
      viewMode: viewMode, // Thêm viewMode vào updatedPost
    };

    try {
      await updatePost(post.id, updatedPost); // Cập nhật bài đăng
      onClose(); // Đóng popup
    } catch (error) {
      toast.error("Có lỗi khi cập nhật bài đăng");
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const base64ImageEdit = await new Promise((resolve) => {
      const readerEdit = new FileReader();
      readerEdit.readAsDataURL(file);
      readerEdit.onload = () => resolve(readerEdit.result);
    });
    setImage(base64ImageEdit);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "PUBLIC" ? "PRIVATE" : "PUBLIC"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay mờ */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose} // Đóng popup khi nhấn vào overlay
      ></div>

      {/* Nội dung popup */}
      <div className="relative bg-gray-800 shadow-lg rounded-xl p-5 w-full max-w-md mx-4 border border-gray-700 z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Chỉnh sửa bài đăng</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-12 h-12 rounded-full"
          />
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="Bạn đang nghĩ gì?"
            className="flex-1 focus:outline-none p-4 rounded-lg border-b-2 border-gray-600"
            style={{
              minHeight: "50px",
              maxHeight: "150px",
              overflowY: "auto",
              wordWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>

        {/* Hiển thị ảnh */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {image && (
            <div className="relative">
              <img
                src={image}
                alt="Preview"
                className="rounded-lg max-h-24 object-cover w-24 shadow-sm"
              />
              <button
                onClick={() => setImage("")}
                className="absolute -top-2 right-1 bg-transparent border-none text-white text-3xl"
                style={{ cursor: "pointer", borderRadius: "50%" }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Chức năng thêm ảnh + Chế độ hiển thị + Cập nhật bài */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-4">
            {/* Nút thêm ảnh */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="fileInputEdit"
            />
            <label
              htmlFor="fileInputEdit"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-500 cursor-pointer transition-all"
            >
              <Image className="w-5 h-5" />
              Ảnh
            </label>

            {/* Nút toggle viewMode */}
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-2 text-gray-300 hover:text-gray-100 cursor-pointer transition-all"
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

          {/* Nút cập nhật */}
          <button
            onClick={handleUpdate}
            disabled={isLoading || (!content.trim() && !image)}
            className={`px-5 py-2 rounded-lg flex items-center gap-2 transition-all ${
              content.trim() || image
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-600 text-gray-400"
            }`}
          >
            <Send className="w-5 h-5" />
            Cập nhật
          </button>
        </div>

        {/* Overlay loading khi đang cập nhật */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-xl z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid mb-4"></div>
            <p className="text-white font-medium">Đang xử lý...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditPostModal;