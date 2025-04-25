import { useState, useRef } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import uploadImage from "../store/uploadImage";
import { useThemeStore } from "../store/useThemeStore";


const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Lưu URL ảnh từ ImgBB
  const [isUploading, setIsUploading] = useState(false); // Trạng thái tải ảnh
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Tải ảnh lên ImgBB
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url); // Lưu URL ảnh
      toast.success("Tải ảnh lên thành công!");
    } catch (error) {
      toast.error("Lỗi khi tải ảnh lên: " + error.message);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl) return;
    if (isUploading) {
      toast.error("Vui lòng đợi ảnh tải lên xong!");
      return;
    }

    // Gửi tin nhắn với URL ảnh
    onSendMessage({
      text: text.trim(),
      image: imageUrl,
    });

    // Đặt lại trạng thái
    setText("");
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2 bg-base-300">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
              disabled={isUploading}
            >
              <X className="size-3" />
            </button>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <span className="text-white text-xs">Đang tải...</span>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Image size={20} />
          </button>
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md text-base-content"
            placeholder="Enter your message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle size-12"
          disabled={(!text.trim() && !imageUrl) || isUploading}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;