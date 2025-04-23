import React, { useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Camera } from "lucide-react"; // Thêm icon Camera

const ProfileDetails = ({ isOpen, onClose, user, formData, setFormData, onUpdate, isLoading }) => {
  // Vô hiệu hóa scroll khi mở popup, khôi phục khi đóng
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup: Khôi phục scroll khi component unmount hoặc isOpen thay đổi
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });

    setFormData((prev) => ({ ...prev, avatar: base64Image }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay mờ */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>

      {/* Nội dung popup */}
      <div className="relative bg-gray-800 shadow-lg rounded-xl p-5 w-full max-w-md mx-4 border border-gray-700 z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Profile Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Avatar preview với icon camera */}
          <div className="relative">
            <img
              src={formData.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            {/* Icon camera */}
            <label
              htmlFor="avatarInput"
              className="absolute bottom-0 right-0 bg-gray-600 rounded-full p-2 cursor-pointer hover:bg-gray-700 transition-all"
            >
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatarInput"
              />
            </label>
          </div>

          {/* Tên */}
          <div className="w-full">
            <label className="text-gray-400">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full p-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none"
            />
          </div>

          {/* Email (chỉ hiển thị, không chỉnh sửa) */}
          <div className="w-full">
            <label className="text-gray-400">Email</label>
            <input
              type="email"
              value={user?.email || "No email"}
              disabled
              className="w-full p-2 rounded-lg border border-gray-600 bg-gray-900 text-gray-400 focus:outline-none"
            />
          </div>

          {/* Nút cập nhật */}
          <Button
            onClick={onUpdate}
            disabled={isLoading}
            className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;