import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Separator } from "../components/ui/Separator";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); // Thêm state lưu lỗi

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ trước khi login
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return; // Không gửi request nếu form chưa đủ dữ liệu
    }

    const errorMessage = await login(formData);
    if (errorMessage) {
      setError(errorMessage); // Cập nhật lỗi vào state
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full ">
      <Card className="w-full max-w-md rounded-lg border border-[#d9d9d9] shadow-lg">
        <CardContent className="flex flex-col gap-6 p-6">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>

              {/* Hiển thị lỗi nếu có */}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-base font-normal">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full pl-10"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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

            <Button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Loading..." : "Sign In"}
            </Button>
          </form>

          <div className="flex justify-between text-sm">
            <Link to="/forgotpass" className="underline">
              Forgot password?
            </Link>
          </div>

          <Separator className="bg-[#d9d9d9]" />
          <Link to="/signup">
            <Button className="btn btn-primary w-full">Create account</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
