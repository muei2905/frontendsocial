import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export const ForgotPass = () => {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [error, setError] = useState("");
  const { sendOtp, isSendingOtp } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    try {
      console.log("Sending email:", formData.email); // Log email gửi lên
      await sendOtp(formData.email, navigate);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <Card className="w-[583px] border border-[#d9d9d9] rounded-lg">
        <CardContent className="p-6">
          <h2 className="text-base font-normal mb-5">Forget Password</h2>

          <p className="text-base font-normal mb-6">
            Please enter your email to send the verification code to your
            account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Email"
                className="input input-bordered w-full pl-10"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex justify-end gap-4">
              <Button variant="ghost">
                <Link to="/login">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="btn-primary text-neutral-100"
                disabled={isSendingOtp}
              >
                {isSendingOtp ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPass;