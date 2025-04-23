import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Separator } from "../components/ui/Separator";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [errorSignup, setErrorSignup] = useState();

  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [id]: value };
      return newFormData;
    });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const newFormData = { ...prev, confirmPassword: value };
      if (newFormData.password && newFormData.confirmPassword) {
        if (newFormData.password !== newFormData.confirmPassword) {
          setError({ message: "Passwords do not match" });
        } else {
          setError(null);
        }
      } else {
        setError(null);
      }
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrorSignup(null);

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError({ message: "Please fill in all fields" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError({ message: "Passwords do not match" });
      return;
    }

    const signupData = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
    };
    const result = await signup(signupData); // Nhận kết quả từ signup
    if (result) {
      // Nếu có lỗi (result không phải null), cập nhật errorSignup
      setErrorSignup(result);
    } else {
      // Nếu thành công, điều hướng đến newsfeeds
      navigate("/newsfeeds");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <Card className="w-full max-w-md rounded-lg border border-[#d9d9d9] shadow-lg">
        <CardContent className="flex flex-col gap-6 p-6">
          <div className="text-center mb-4">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <User className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Sign up for a new account</p>
              {/* Hiển thị lỗi nếu có */}
              {errorSignup && <p className="text-red-500 text-sm mt-2">{errorSignup}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName" className="text-base font-normal">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your Name"
                  className="input input-bordered w-full pl-10"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                  onChange={handleChange}
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
              <Label htmlFor="passwordConfirm" className="text-base font-normal">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="******"
                  className="input input-bordered w-full pl-10"
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error.message}</p>
            )}

            <Button
              type="submit"
              className="btn btn-primary w-full"
              disabled={
                isSigningUp ||
                (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)
              }
            >
              {isSigningUp ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </Button>
          </form>

          <Separator className="bg-[#d9d9d9]" />
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;