const CLOUDINARY_CLOUD_NAME = "dhdomiqlt"; // Thay bằng cloud_name của bạn
const CLOUDINARY_UPLOAD_PRESET = "chat_app_unsigned"; // Thay bằng upload preset bạn đã tạo

const uploadImage = async (file) => {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Vui lòng chọn file ảnh hợp lệ");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error(data.error?.message || "Không thể tải ảnh lên");
    }

    return data.secure_url; // Trả về URL ảnh từ Cloudinary
  } catch (error) {
    console.error("Lỗi khi tải ảnh lên Cloudinary:", error);
    throw error;
  }
};

export default uploadImage;