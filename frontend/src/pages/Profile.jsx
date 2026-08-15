import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/auth.service";
import DashboardHeader from "../components/common/DashboardHeader";

const Profile = () => {
  const { user, setUserManually } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    organizationName: user?.organizationName || "",
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
      if (photo) payload.append("profileImage", photo);

      const res = await updateProfile(payload);

      const updatedUser = { ...user, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div style={{ maxWidth: 480, margin: "30px auto", padding: 20 }}>
  <DashboardHeader
    icon="👤"
    title="My Profile"
    subtitle="Keep your details up to date"
    gradient="linear-gradient(135deg, #2e7d32, #ff8f00)"
  />

  <div className="card">
    {user?.profileImage ? (
      <img
        src={`${import.meta.env.VITE_SOCKET_URL}${user.profileImage}`}
        alt="Profile"
        className="avatar-glow"
        style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: "3px solid var(--primary-green)" }}
      />
    ) : (
      <div
        className="avatar-glow"
        style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "var(--primary-green-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          marginBottom: 10,
        }}
      >
        {user?.name?.charAt(0).toUpperCase()}
      </div>
    )}

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} required />

          <label>Address</label>
          <input name="address" value={formData.address} onChange={handleChange} required />

          {(user?.role === "donor" || user?.role === "ngo") && (
            <>
              <label>Organization Name</label>
              <input
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
              />
            </>
          )}

          <label>Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;