import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { resetPassword } from "../../services/auth.service";

import "./ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Keep OTP numeric and limited to 6 digits
    if (name === "otp") {
      const numericValue = value
        .replace(/\D/g, "")
        .slice(0, 6);

      setFormData((previous) => ({
        ...previous,
        [name]: numericValue,
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error(
        "Password should be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      await resetPassword(formData);

      toast.success(
        "Password reset! Please log in."
      );

      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="reset-background" />

      <div className="reset-layout">

        {/* =================================================
            LEFT BRAND PANEL
            ================================================= */}

        <section className="reset-brand-panel">

          <Link
            to="/"
            className="reset-brand"
          >
            <span className="reset-brand-mark">
              <Leaf size={19} />
            </span>

            <span>
              Share<span>Plate</span>
            </span>
          </Link>

          <div className="reset-brand-content">

            <span className="reset-kicker">
              SECURE ACCOUNT RECOVERY
            </span>

            <h1>
              A fresh start
              <br />
              is just
              <br />
              <span>one step away.</span>
            </h1>

            <p>
              Verify your identity with the OTP sent to
              your email, then choose a new password for
              your SharePlate account.
            </p>

            {/* STEPS */}

            <div className="reset-steps">

              <div className="reset-step">

                <div className="reset-step-number active">
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <strong>
                    Request recovery
                  </strong>

                  <span>
                    Start the password reset process.
                  </span>
                </div>

              </div>

              <div className="reset-step-line" />

              <div className="reset-step">

                <div className="reset-step-number current">
                  02
                </div>

                <div>
                  <strong>
                    Verify & reset
                  </strong>

                  <span>
                    Enter your OTP and create a new password.
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="reset-brand-footer">

            <ShieldCheck size={14} />

            <span>
              Secure password recovery powered by SharePlate.
            </span>

          </div>

        </section>

        {/* =================================================
            FORM PANEL
            ================================================= */}

        <main className="reset-form-panel">

          <div className="reset-form-container">

            <div className="reset-icon">
              <KeyRound size={25} />
            </div>

            <span className="reset-form-kicker">
              VERIFY & RESET
            </span>

            <h2>
              Create a new
              <br />
              <span>password.</span>
            </h2>

            <p className="reset-description">
              Enter the email and 6-digit OTP you received,
              then choose a new password for your account.
            </p>

            {/* FORM */}

            <form
              className="reset-form"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="reset-field">

                <label htmlFor="reset-email">
                  Registered email
                </label>

                <div className="reset-input-wrapper">

                  <Mail size={17} />

                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* OTP */}

              <div className="reset-field">

                <div className="reset-label-row">

                  <label htmlFor="reset-otp">
                    Verification code
                  </label>

                  <span>
                    6 digits
                  </span>

                </div>

                <div className="otp-input-wrapper">

                  <KeyRound size={17} />

                  <input
                    id="reset-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                    required
                  />

                </div>

                <p className="otp-helper">
                  Enter the one-time password sent to your
                  registered email.
                </p>

              </div>

              {/* NEW PASSWORD */}

              <div className="reset-field">

                <label htmlFor="reset-password">
                  New password
                </label>

                <div className="reset-input-wrapper">

                  <LockKeyhole size={17} />

                  <input
                    id="reset-password"
                    name="newPassword"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="reset-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

              </div>

              {/* PASSWORD INFO */}

              <div className="password-requirement">

                <ShieldCheck size={14} />

                <span>
                  Use at least 6 characters for your new
                  password.
                </span>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="reset-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="reset-spinner" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset password
                    <ArrowRight size={16} />
                  </>
                )}

              </button>

            </form>

            {/* BACK TO LOGIN */}

            <div className="reset-back-login">

              <Link to="/login">

                <ArrowLeft size={15} />

                Back to Login

              </Link>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default ResetPassword;