import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyEmail, resendVerificationOTP } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!location.state?.email) {
      // allow manual entry if user landed here directly (e.g. from login redirect)
    }
  }, [location.state]);

  const redirectByRole = (role) => {
    if (role === "donor") navigate("/donor/dashboard");
    else if (role === "ngo") navigate("/ngo/dashboard");
    else if (role === "volunteer") navigate("/volunteer/dashboard");
    else navigate("/");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Please enter your email and the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmail({ email, otp });
      toast.success("Email verified! Welcome aboard.");
      setSession(res.data);
      redirectByRole(res.data.role);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setResending(true);
    try {
      await resendVerificationOTP(email);
      toast.success("A new OTP has been sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "40px auto" }}>
      <h2>Verify Your Email</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        We sent a 6-digit code to your email. Enter it below to activate your account.
      </p>

      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <button className="btn-outline" onClick={handleResend} disabled={resending} style={{ marginTop: 8 }}>
        {resending ? "Resending..." : "Resend OTP"}
      </button>

      <p style={{ marginTop: 16 }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export default VerifyEmail;