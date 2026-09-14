import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Mail,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

import { forgotPassword } from "../../services/auth.service";

import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your registered email");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email);

      toast.success(
        "If that email exists, an OTP has been sent"
      );

      setSent(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      {/* BACKGROUND */}
      <div className="forgot-background" />

      <div className="forgot-layout">

        {/* =================================================
            LEFT BRAND PANEL
            ================================================= */}

        <section className="forgot-brand-panel">

          <Link to="/" className="forgot-brand">

            <span className="forgot-brand-mark">
              <Leaf size={19} />
            </span>

            <span>
              Share<span>Plate</span>
            </span>

          </Link>

          <div className="forgot-brand-content">

            <span className="forgot-kicker">
              ACCOUNT RECOVERY
            </span>

            <h1>
              Let's get you
              <br />
              <span>back in.</span>
            </h1>

            <p>
              Don't worry. It happens. We'll help you
              securely regain access to your SharePlate
              account.
            </p>

            <div className="forgot-benefits">

              <div className="forgot-benefit">

                <div className="benefit-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <strong>Secure recovery</strong>
                  <span>
                    Your account stays protected.
                  </span>
                </div>

              </div>

              <div className="forgot-benefit">

                <div className="benefit-icon">
                  <KeyRound size={17} />
                </div>

                <div>
                  <strong>One-time verification</strong>
                  <span>
                    We'll send a secure OTP to your email.
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="forgot-brand-footer">
            <span>SharePlate</span>
            <span>Making surplus food useful.</span>
          </div>

        </section>

        {/* =================================================
            FORM PANEL
            ================================================= */}

        <main className="forgot-form-panel">

          <div className="forgot-form-container">

            {!sent ? (
              <>
                {/* ICON */}

                <div className="forgot-icon">
                  <Mail size={25} />
                </div>

                <span className="form-kicker">
                  PASSWORD RESET
                </span>

                <h2>
                  Forgot your
                  <br />
                  <span>password?</span>
                </h2>

                <p className="forgot-description">
                  Enter the email address associated with
                  your account. If it exists, we'll send you
                  a one-time password to continue.
                </p>

                {/* FORM */}

                <form
                  className="forgot-form"
                  onSubmit={handleSubmit}
                >

                  <div className="forgot-field">

                    <label htmlFor="email">
                      Registered email
                    </label>

                    <div className="forgot-input-wrapper">

                      <Mail size={17} />

                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        autoComplete="email"
                        required
                      />

                    </div>

                  </div>

                  <button
                    type="submit"
                    className="forgot-submit"
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <span className="forgot-spinner" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight size={16} />
                      </>
                    )}

                  </button>

                </form>

                <div className="forgot-security-note">

                  <ShieldCheck size={14} />

                  <span>
                    We'll never reveal whether an email
                    is registered with SharePlate.
                  </span>

                </div>

              </>
            ) : (
              /* =================================================
                 OTP SENT STATE
                 ================================================= */

              <div className="otp-sent-state">

                <div className="success-icon">
                  <CheckCircle2 size={31} />
                </div>

                <span className="form-kicker">
                  CHECK YOUR INBOX
                </span>

                <h2>
                  OTP is
                  <br />
                  <span>on its way.</span>
                </h2>

                <p className="forgot-description">
                  If an account exists for
                  <strong> {email}</strong>, we've sent
                  you a one-time password. Check your inbox
                  and continue the password reset process.
                </p>

                <Link
                  to="/reset-password"
                  className="continue-reset-button"
                >
                  Enter OTP & Reset Password
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  className="try-another-button"
                  onClick={() => setSent(false)}
                >
                  Use a different email
                </button>

              </div>
            )}

            {/* LOGIN */}

            <div className="back-login">

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

export default ForgotPassword;