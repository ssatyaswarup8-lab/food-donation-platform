import { useState } from "react";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  MapPin,
  Building2,
  Camera,
  Save,
  ShieldCheck,
  Mail,
  BadgeCheck,
  ImagePlus,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/auth.service";
import DashboardHeader from "../components/common/DashboardHeader";

import "./Profile.css";

const Profile = () => {
  const { user, setUserManually } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    organizationName: user?.organizationName || "",
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.profileImage || "");
  const [loading, setLoading] = useState(false);

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `${import.meta.env.VITE_SOCKET_URL}${image}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Please enter your address");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      if (photo) {
        payload.append("profileImage", photo);
      }

      const res = await updateProfile(payload);

      const updatedUser = {
        ...user,
        ...res.data,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (setUserManually) {
        setUserManually(updatedUser);
      }

      setPhoto(null);

      if (res.data?.profileImage) {
        setPreview(getImageUrl(res.data.profileImage));
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  const displayName =
    user?.name || "Community Member";

  const roleName =
    user?.role === "donor"
      ? "Food Donor"
      : user?.role === "ngo"
      ? "NGO Partner"
      : user?.role === "volunteer"
      ? "Volunteer"
      : "Community Member";

  return (
    <div className="profile-page">

      <div className="profile-background" />

      <div className="profile-container">

        {/* HEADER */}
        <DashboardHeader
          icon="👤"
          title="My Profile"
          subtitle="Keep your details up to date"
          gradient="linear-gradient(135deg, #55775d, #8ca68d)"
        />

        {/* PROFILE HERO */}
        <section className="profile-hero-card">

          <div className="profile-hero-left">

            <div className="profile-avatar-wrapper">

              {preview ? (
                <img
                  src={getImageUrl(preview)}
                  alt="Profile"
                  className="profile-avatar-image"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {userInitial}
                </div>
              )}

              <label
                htmlFor="profile-photo"
                className="avatar-camera"
                title="Change profile photo"
              >
                <Camera size={16} />
              </label>

            </div>

            <div className="profile-identity">

              <span className="profile-role">
                <BadgeCheck size={13} />
                {roleName}
              </span>

              <h2>{displayName}</h2>

              <p>
                {user?.email || "Your account information"}
              </p>

            </div>

          </div>

          <div className="profile-security">

            <ShieldCheck size={20} />

            <div>
              <strong>Account protected</strong>
              <span>Your profile information is private</span>
            </div>

          </div>

        </section>

        {/* FORM CARD */}
        <section className="profile-form-card">

          <div className="profile-section-heading">

            <div>
              <span className="profile-section-label">
                PERSONAL INFORMATION
              </span>

              <h2>Your details</h2>

              <p>
                Update your information so the SharePlate
                community can reach you when needed.
              </p>
            </div>

            <div className="heading-icon">
              <User size={21} />
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* NAME + PHONE */}
            <div className="form-grid">

              <div className="profile-field">

                <label htmlFor="name">
                  Full Name
                </label>

                <div className="input-wrapper">

                  <User size={17} />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />

                </div>

              </div>

              <div className="profile-field">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="input-wrapper">

                  <Phone size={17} />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />

                </div>

              </div>

            </div>

            {/* EMAIL */}
            <div className="profile-field">

              <label>
                Email Address
              </label>

              <div className="input-wrapper disabled-input">

                <Mail size={17} />

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                />

                <span className="verified-label">
                  Verified
                </span>

              </div>

              <small>
                Your registered email cannot be changed here.
              </small>

            </div>

            {/* ADDRESS */}
            <div className="profile-field">

              <label htmlFor="address">
                Address
              </label>

              <div className="input-wrapper textarea-wrapper">

                <MapPin size={17} />

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />

              </div>

            </div>

            {/* ORGANIZATION */}
            {(user?.role === "donor" ||
              user?.role === "ngo") && (
              <div className="organization-section">

                <div className="organization-heading">

                  <div className="organization-icon">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <h3>Organization information</h3>
                    <p>
                      Tell the community about the organization
                      you represent.
                    </p>
                  </div>

                </div>

                <div className="profile-field">

                  <label htmlFor="organizationName">
                    Organization Name
                  </label>

                  <div className="input-wrapper">

                    <Building2 size={17} />

                    <input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="Enter organization name"
                    />

                  </div>

                </div>

              </div>
            )}

            {/* PHOTO */}
            <div className="photo-section">

              <div className="organization-heading">

                <div className="organization-icon">
                  <ImagePlus size={19} />
                </div>

                <div>
                  <h3>Profile photo</h3>
                  <p>
                    Use a clear photo so community members
                    can recognize you.
                  </p>
                </div>

              </div>

              <label
                htmlFor="profile-photo"
                className="photo-upload"
              >

                <div className="upload-icon">
                  <Camera size={21} />
                </div>

                <div className="upload-text">

                  <strong>
                    {photo
                      ? photo.name
                      : "Choose a new profile photo"}
                  </strong>

                  <span>
                    JPG, PNG or WEBP · Maximum 5 MB
                  </span>

                </div>

                <span className="browse-button">
                  Browse
                </span>

              </label>

              <input
                id="profile-photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoChange}
                className="hidden-file-input"
              />

            </div>

            {/* ACTIONS */}
            <div className="profile-actions">

              <div className="save-note">
                <ShieldCheck size={15} />
                <span>
                  Your information is securely stored.
                </span>
              </div>

              <button
                type="submit"
                className="save-profile-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

        {/* ACCOUNT INFO */}
        <section className="account-info">

          <div className="account-info-icon">
            <User size={19} />
          </div>

          <div>
            <strong>
              SharePlate account
            </strong>

            <span>
              Account type: {roleName}
            </span>
          </div>

          <div className="account-status">
            <span />
            Active
          </div>

        </section>

      </div>
    </div>
  );
};

export default Profile;