import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getAllUsers,
  verifyUser,
  toggleUserStatus,
  bulkVerifyUsers,
  exportUsersCSV,
} from "../../services/admin.service";

const UserVerificationTable = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (roleFilter) filters.role = roleFilter;
      if (verifiedFilter) filters.verified = verifiedFilter;

      const res = await getAllUsers(filters);
      setUsers(res.data);
      setSelectedIds([]);
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
      toast.success("User verified");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify user");
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setActioningId(userId);
    try {
      await toggleUserStatus(userId);
      toast.success("Status updated");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setActioningId(null);
    }
  };

  const toggleSelect = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const unverifiedIds = users.filter((u) => !u.isVerified).map((u) => u._id);
    if (selectedIds.length === unverifiedIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unverifiedIds);
    }
  };

  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one user");
      return;
    }
    setBulkLoading(true);
    try {
      const res = await bulkVerifyUsers(selectedIds);
      toast.success(`${res.data.modifiedCount} users verified`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk verify failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportUsersCSV();
      toast.success("Users exported");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  return (
    <div>
      <h3>User Management</h3>

      <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
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

        <div>
          <button onClick={handleBulkVerify} disabled={bulkLoading || selectedIds.length === 0}>
            {bulkLoading ? "Verifying..." : `Bulk Verify (${selectedIds.length})`}
          </button>
          <button className="btn-outline" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={toggleSelectAll} />
              </th>
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
                <td>
                  {!u.isVerified && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(u._id)}
                      onChange={() => toggleSelect(u._id)}
                    />
                  )}
                </td>
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