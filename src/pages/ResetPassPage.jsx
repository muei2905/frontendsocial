import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

export const ResetPass = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null); // Lưu dữ liệu lỗi từ API hoặc lỗi cục bộ
  const [success, setSuccess] = useState(null); // Lưu chuỗi thành công từ API
  const navigate = useNavigate();
  const { resetPassword, isResettingPassword } = useAuthStore();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [id]: value };

      // So sánh ngay khi cả hai field đều có giá trị
      if (newFormData.password && newFormData.confirmPassword) {
        if (newFormData.password !== newFormData.confirmPassword) {
          setError({ message: "Passwords do not match" });
        } else {
          setError(null); // Xóa lỗi nếu khớp
        }
      } else if (!newFormData.password || !newFormData.confirmPassword) {
        setError(null); // Xóa lỗi nếu một trong hai field rỗng
      }

      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);

    // Kiểm tra rỗng
    if (!formData.password || !formData.confirmPassword) {
      setError({ message: "Please fill in both password fields" });
      return;
    }

    // Kiểm tra khớp đã được xử lý real-time, nhưng vẫn kiểm tra lại để chắc chắn
    if (formData.password !== formData.confirmPassword) {
      setError({ message: "Passwords do not match" });
      return;
    }

    try {
      const response = await resetPassword(formData.password, navigate);
      setSuccess(response); // Lưu chuỗi text từ API
    } catch (err) {
      setError(JSON.parse(err.message)); // Parse lỗi từ API
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-[485px]">
        <Card className="w-full rounded-lg border border-[#d9d9d9]">
          <CardContent className="flex flex-col gap-6 p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-base font-normal">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    className="input input-bordered w-full pl-10"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword" className="text-base font-normal">
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    className="input input-bordered w-full pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Hiển thị thông báo */}
              {success && (
                <p className="text-green-500 text-sm mt-2">
                  {success} {/* Hiển thị chuỗi text từ API */}
                </p>
              )}
              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error.message ? (
                    <p>{error.message}</p> // Hiển thị lỗi cục bộ hoặc message từ API
                  ) : (
                    <pre>{JSON.stringify(error, null, 2)}</pre> // Hiển thị JSON lỗi từ API
                  )}
                </div>
              )}

              <div className="flex flex-col items-center justify-center gap-4 mt-4">
                <Button
                  type="submit"
                  className="w-60 text-neutral-100 rounded-lg p-3 font-normal"
                  disabled={isResettingPassword || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)}
                >
                  {isResettingPassword ? "Resetting..." : "Reset Password"}
                </Button>

                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPass;