import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Separator } from "../components/ui/Separator";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

export const Verification = () => {
  const [formData, setFormData] = useState({
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: "",
    otp6: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { resendOtp, verifyOtp, isSendingOtp, isVerifyingOtp } = useAuthStore();

  const email = localStorage.getItem("forgotPasswordEmail") || "your email";

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const key = `otp${index + 1}`; // Tạo key tương ứng (otp1, otp2, ...)
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    const key = `otp${index + 1}`;
    if (e.key === "Backspace" && !formData[key] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Ghép các giá trị từ formData thành chuỗi OTP
    const otpCode = Object.values(formData).join("");
    try {
      const response = await verifyOtp(otpCode, navigate); // Cách 1
      // Nếu dùng Cách 2:
      // const response = await verifyOtp(otpCode);
      // setSuccess(response.message || "OTP verified successfully! Redirecting...");
      // setTimeout(() => {
      //   navigate("/resetpass");
      // }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      await resendOtp();
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[460px] rounded-lg border border-[#d9d9d9] p-6">
        <CardContent className="p-0 text-center">
          <h2 className="font-normal text-base">Enter verification code</h2>
          <p className="mt-4 mb-6">
            We've sent a code to <span className="font-semibold">{email}</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: 6 }, (_, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={formData[`otp${index + 1}`]} // Lấy giá trị từ formData
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-bold border border-gray-400 rounded focus:outline-none focus:border-black"
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            <div className="mb-4">
              <span>Didn't get a code? </span>
              <button
                type="button"
                onClick={handleResend}
                className="ml-2 text-blue-500 hover:underline"
                disabled={isSendingOtp}
              >
                {isSendingOtp ? "Sending..." : "Click to resend"}
              </button>
            </div>

            <Separator className="w-full bg-[#d9d9d9]" />

            <div className="flex justify-center gap-4 my-6">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary text-neutral-100"
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verification;