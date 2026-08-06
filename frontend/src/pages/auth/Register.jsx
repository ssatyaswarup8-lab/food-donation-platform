import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ longitude: 0, latitude: 0 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ longitude: pos.coords.longitude, latitude: pos.coords.latitude }),
        () => resolve({ longitude: 0, latitude: 0 })
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const coords = await getLocation();
      const payload = { ...formData, ...coords };

      const userData = await register(payload);
      redirectByRole(userData.role);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === "donor") navigate("/donor/dashboard");
    else if (role === "ngo") navigate("/ngo/dashboard");
    else if (role === "volunteer") navigate("/volunteer/dashboard");
    else navigate("/");
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="donor">Donor</option>
          <option value="ngo">NGO</option>
          <option value="volunteer">Volunteer</option>
        </select>

        {formData.role === "donor" && (
          <select name="donorType" value={formData.donorType} onChange={handleChange}>
            <option value="">Select Donor Type</option>
            <option value="restaurant">Restaurant</option>
            <option value="hotel">Hotel</option>
            <option value="wedding_organizer">Wedding Organizer</option>
            <option value="college_canteen">College Canteen</option>
            <option value="individual">Individual</option>
          </select>
        )}

        {(formData.role === "donor" || formData.role === "ngo") && (
          <input
            name="organizationName"
            placeholder="Organization Name"
            value={formData.organizationName}
            onChange={handleChange}
          />
        )}

        <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;