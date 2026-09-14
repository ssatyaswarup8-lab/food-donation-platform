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
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Building2,
  UsersRound,
  HeartHandshake,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

import "./Register.css";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "donor",
    donorType: "",
    organizationName: "",
    address: "",
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

  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          longitude: 0,
          latitude: 0,
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
          }),
        () =>
          resolve({
            longitude: 0,
            latitude: 0,
          })
      );
    });
  };

  const redirectByRole = (role) => {
    if (role === "donor") {
      navigate("/donor/dashboard");
    } else if (role === "ngo") {
      navigate("/ngo/dashboard");
    } else if (role === "volunteer") {
      navigate("/volunteer/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const coords = await getLocation();

      const payload = {
        ...formData,
        ...coords,
      };

      const userData = await register(payload);

      toast.success(
        `Welcome, ${userData.name}! Registration successful.`
      );

      redirectByRole(userData.role);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed";

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* Background */}
      <div className="register-background" />

      <div className="register-layout">

        {/* =================================================
            LEFT BRAND PANEL
            ================================================= */}

        <section className="register-brand-panel">

          <Link
            to="/"
            className="register-brand"
          >
            <span className="register-brand-mark">
              <Leaf size={19} />
            </span>

            <span>
              Share<span>Plate</span>
            </span>
          </Link>

          <div className="register-brand-content">

            <span className="register-kicker">
              JOIN THE COMMUNITY
            </span>

            <h1>
              Your surplus
              <br />
              can become
              <br />
              <span>someone's meal.</span>
            </h1>

            <p>
              Create your SharePlate account and become
              part of a community working together to
              reduce food waste and make every meal count.
            </p>

            {/* ROLE CARDS */}

            <div className="register-role-preview">

              <div className="role-preview-item">

                <div className="role-preview-icon">
                  <HeartHandshake size={17} />
                </div>

                <div>
                  <strong>Donate</strong>
                  <span>
                    Give surplus food a purpose.
                  </span>
                </div>

              </div>

              <div className="role-preview-item">

                <div className="role-preview-icon">
                  <UsersRound size={17} />
                </div>

                <div>
                  <strong>Volunteer</strong>
                  <span>
                    Help move food where it matters.
                  </span>
                </div>

              </div>

              <div className="role-preview-item">

                <div className="role-preview-icon">
                  <Building2 size={17} />
                </div>

                <div>
                  <strong>Support</strong>
                  <span>
                    Connect communities with food.
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="register-brand-footer">

            <ShieldCheck size={14} />

            <span>
              Your information is securely handled.
            </span>

          </div>

        </section>

        {/* =================================================
            REGISTER FORM PANEL
            ================================================= */}

        <main className="register-form-panel">

          <div className="register-form-container">

            <div className="register-form-header">

              <div className="register-icon">
                <UserRound size={24} />
              </div>

              <span className="register-form-kicker">
                CREATE ACCOUNT
              </span>

              <h2>
                Join
                <br />
                <span>SharePlate.</span>
              </h2>

              <p>
                Tell us a little about yourself so we can
                connect you with the right opportunities.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="register-error">

                <span className="register-error-mark">
                  !
                </span>

                <span>{error}</span>

              </div>
            )}

            {/* FORM */}

            <form
              className="register-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}

              <div className="register-field">

                <label htmlFor="register-name">
                  Full name
                </label>

                <div className="register-input-wrapper">

                  <UserRound size={16} />

                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                </div>

              </div>

              {/* EMAIL + PHONE */}

              <div className="register-two-column">

                <div className="register-field">

                  <label htmlFor="register-email">
                    Email address
                  </label>

                  <div className="register-input-wrapper">

                    <Mail size={16} />

                    <input
                      id="register-email"
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

                <div className="register-field">

                  <label htmlFor="register-phone">
                    Phone number
                  </label>

                  <div className="register-input-wrapper">

                    <Phone size={16} />

                    <input
                      id="register-phone"
                      name="phone"
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      required
                    />

                  </div>

                </div>

              </div>

              {/* PASSWORD */}

              <div className="register-field">

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="register-input-wrapper">

                  <LockKeyhole size={16} />

                  <input
                    id="register-password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
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

              {/* ROLE */}

              <div className="register-field">

                <label htmlFor="register-role">
                  I want to join as
                </label>

                <div className="register-select-wrapper">

                  <UsersRound size={16} />

                  <select
                    id="register-role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="donor">
                      Donor
                    </option>

                    <option value="ngo">
                      NGO
                    </option>

                    <option value="volunteer">
                      Volunteer
                    </option>

                  </select>

                </div>

              </div>

              {/* DONOR TYPE */}

              {formData.role === "donor" && (
                <div className="register-field register-conditional-field">

                  <label htmlFor="register-donor-type">
                    Donor type
                  </label>

                  <select
                    id="register-donor-type"
                    name="donorType"
                    value={formData.donorType}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select donor type
                    </option>

                    <option value="restaurant">
                      Restaurant
                    </option>

                    <option value="hotel">
                      Hotel
                    </option>

                    <option value="wedding_organizer">
                      Wedding Organizer
                    </option>

                    <option value="college_canteen">
                      College Canteen
                    </option>

                    <option value="individual">
                      Individual
                    </option>

                  </select>

                </div>
              )}

              {/* ORGANIZATION */}

              {(formData.role === "donor" ||
                formData.role === "ngo") && (
                <div className="register-field">

                  <label htmlFor="register-organization">
                    Organization name
                    <span className="optional-label">
                      Optional
                    </span>
                  </label>

                  <div className="register-input-wrapper">

                    <Building2 size={16} />

                    <input
                      id="register-organization"
                      name="organizationName"
                      type="text"
                      placeholder="Organization or business name"
                      value={
                        formData.organizationName
                      }
                      onChange={handleChange}
                    />

                  </div>

                </div>
              )}

              {/* ADDRESS */}

              <div className="register-field">

                <label htmlFor="register-address">
                  Address
                </label>

                <div className="register-input-wrapper">

                  <MapPin size={16} />

                  <input
                    id="register-address"
                    name="address"
                    type="text"
                    placeholder="Your address"
                    value={formData.address}
                    onChange={handleChange}
                    autoComplete="street-address"
                    required
                  />

                </div>

              </div>

              {/* LOCATION INFO */}

              <div className="register-location-note">

                <MapPin size={14} />

                <span>
                  We'll use your location to help connect
                  you with nearby food donations and
                  opportunities.
                </span>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="register-spinner" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={16} />
                  </>
                )}

              </button>

            </form>

            {/* LOGIN */}

            <div className="register-login">

              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Sign in
                <ArrowRight size={13} />
              </Link>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default Register;