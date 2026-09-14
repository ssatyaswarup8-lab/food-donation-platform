import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Utensils,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const redirectByRole = (role) => {
    if (role === "donor") {
      navigate("/donor/dashboard");
    } else if (role === "ngo") {
      navigate("/ngo/dashboard");
    } else if (role === "volunteer") {
      navigate("/volunteer/dashboard");
    } else if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const userData = await login(formData);

      toast.success(
        `Welcome back, ${userData.name}!`
      );

      redirectByRole(userData.role);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div className="login-background" />

      <div className="login-layout">

        {/* =================================================
            LEFT BRAND PANEL
            ================================================= */}

        <section className="login-brand-panel">

          <Link
            to="/"
            className="login-brand"
          >
            <span className="login-brand-mark">
              <Leaf size={19} />
            </span>

            <span>
              Share<span>Plate</span>
            </span>
          </Link>

          <div className="login-brand-content">

            <span className="login-kicker">
              WELCOME BACK
            </span>

            <h1>
              Good food.
              <br />
              <span>Good people.</span>
              <br />
              One community.
            </h1>

            <p>
              Sign in to continue making a difference —
              whether you're donating food, coordinating
              meals, or helping deliver them.
            </p>

            {/* IMPACT CARD */}

            <div className="login-impact-card">

              <div className="impact-food-icon">
                <Utensils size={20} />
              </div>

              <div className="impact-card-content">

                <span>COMMUNITY IMPACT</span>

                <strong>
                  12.4K+ meals rescued
                </strong>

                <p>
                  Thanks to people like you.
                </p>

              </div>

              <div className="impact-arrow">
                <ArrowRight size={15} />
              </div>

            </div>

          </div>

          <div className="login-brand-footer">

            <ShieldCheck size={14} />

            <span>
              A safer way to share food with your community.
            </span>

          </div>

        </section>

        {/* =================================================
            LOGIN PANEL
            ================================================= */}

        <main className="login-form-panel">

          <div className="login-form-container">

            {/* ICON */}

            <div className="login-icon">
              <LockKeyhole size={24} />
            </div>

            <span className="login-form-kicker">
              ACCOUNT ACCESS
            </span>

            <h2>
              Welcome
              <br />
              <span>back.</span>
            </h2>

            <p className="login-description">
              Sign in to your SharePlate account to continue
              where you left off.
            </p>

            {/* ERROR */}

            {error && (
              <div className="login-error">

                <span className="error-mark">
                  !
                </span>

                <span>{error}</span>

              </div>
            )}

            {/* FORM */}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}

              <div className="login-field">

                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="login-input-wrapper">

                  <Mail size={17} />

                  <input
                    id="login-email"
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

              {/* PASSWORD */}

              <div className="login-field">

                <div className="password-label-row">

                  <label htmlFor="login-password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>

                </div>

                <div className="login-input-wrapper">

                  <LockKeyhole size={17} />

                  <input
                    id="login-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
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

              {/* SUBMIT */}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}

              </button>

            </form>

            {/* SECURITY */}

            <div className="login-security">

              <ShieldCheck size={14} />

              <span>
                Your account information is securely
                handled by SharePlate.
              </span>

            </div>

            {/* REGISTER */}

            <div className="login-register">

              <span>
                Don't have an account?
              </span>

              <Link to="/register">
                Create one
                <ArrowRight size={13} />
              </Link>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Login;