import { useState, useEffect } from "react";
import { getAllUsers, verifyUser, toggleUserStatus } from "../../services/admin.service";

const UserVerificationTable = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (roleFilter) filters.role = roleFilter;
      if (verifiedFilter) filters.verified = verifiedFilter;

      const res = await getAllUsers(filters);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, verifiedFilter]);

  const handleVerify = async (userId) => {
    setActioningId(userId);
    try {
      await verifyUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify user");
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setActioningId(userId);
    try {
      await toggleUserStatus(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h3>User Management</h3>

      <div style={{ marginBottom: 10 }}>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="donor">Donor</option>
          <option value="ngo">NGO</option>
          <option value="volunteer">Volunteer</option>
        </select>

        <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
          <option value="">All Verification Status</option>
          <option value="false">Pending Verification</option>
          <option value="true">Verified</option>
        </select>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Verified</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.phone}</td>
                <td>{u.isVerified ? "✅" : "❌"}</td>
                <td>{u.isActive ? "✅" : "🚫"}</td>
                <td>
                  {!u.isVerified && (
                    <button onClick={() => handleVerify(u._id)} disabled={actioningId === u._id}>
                      Verify
                    </button>
                  )}
                  <button onClick={() => handleToggleStatus(u._id)} disabled={actioningId === u._id}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserVerificationTable;