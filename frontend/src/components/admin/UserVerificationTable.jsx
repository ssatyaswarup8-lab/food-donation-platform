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

  // ============================================================
  // FETCH USERS
  // ============================================================

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const filters = {};

      if (roleFilter) {
        filters.role = roleFilter;
      }

      if (verifiedFilter) {
        filters.verified = verifiedFilter;
      }

      const res = await getAllUsers(filters);

      // Your API response is expected to be:
      // {
      //   data: [...]
      // }

      const fetchedUsers = Array.isArray(res.data)
        ? res.data
        : [];

      setUsers(fetchedUsers);

      // Clear old selections
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to fetch users:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD USERS WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    fetchUsers();

    // We intentionally don't include fetchUsers here
    // because it is recreated on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, verifiedFilter]);

  // ============================================================
  // VERIFY SINGLE USER
  // ============================================================

  const handleVerify = async (user) => {
    if (!user?._id) {
      toast.error("Invalid user ID");
      return;
    }

    // ----------------------------------------------------------
    // IMPORTANT:
    // Do not send a user without a role to backend verification.
    // ----------------------------------------------------------

    if (!user.role) {
      toast.error(
        "This user has no role. Please assign a role before verification."
      );

      console.error(
        "Cannot verify user because role is missing:",
        user
      );

      return;
    }

    setActioningId(user._id);

    try {
      await verifyUser(user._id);

      toast.success(
        `${user.name || "User"} verified successfully`
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "Verify user error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to verify user";

      toast.error(message);
    } finally {
      setActioningId(null);
    }
  };

  // ============================================================
  // TOGGLE USER STATUS
  // ============================================================

  const handleToggleStatus = async (user) => {
    if (!user?._id) {
      toast.error("Invalid user ID");
      return;
    }

    setActioningId(user._id);

    try {
      await toggleUserStatus(user._id);

      toast.success(
        user.isActive
          ? "User deactivated"
          : "User activated"
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "Toggle status error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setActioningId(null);
    }
  };

  // ============================================================
  // SELECT / UNSELECT USER
  // ============================================================

  const toggleSelect = (user) => {
    if (!user?._id) {
      return;
    }

    // Don't allow selecting a user without role
    if (!user.role) {
      toast.error(
        "This user has no role and cannot be bulk verified."
      );

      return;
    }

    setSelectedIds((prev) => {
      if (prev.includes(user._id)) {
        return prev.filter(
          (id) => id !== user._id
        );
      }

      return [...prev, user._id];
    });
  };

  // ============================================================
  // SELECT ALL UNVERIFIED VALID USERS
  // ============================================================

  const toggleSelectAll = () => {
    const unverifiedUsers = users.filter(
      (user) =>
        !user.isVerified &&
        user.role &&
        [
          "donor",
          "ngo",
          "volunteer",
        ].includes(user.role)
    );

    const unverifiedIds =
      unverifiedUsers.map(
        (user) => user._id
      );

    if (
      selectedIds.length ===
      unverifiedIds.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unverifiedIds);
    }
  };

  // ============================================================
  // BULK VERIFY
  // ============================================================

  const handleBulkVerify = async () => {
    if (selectedIds.length === 0) {
      toast.error(
        "Select at least one user"
      );

      return;
    }

    setBulkLoading(true);

    try {
      const res =
        await bulkVerifyUsers(
          selectedIds
        );

      toast.success(
        `${
          res.data?.modifiedCount || 0
        } users verified`
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "Bulk verification error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Bulk verification failed"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // ============================================================
  // EXPORT USERS
  // ============================================================

  const handleExport = async () => {
    try {
      await exportUsersCSV();

      toast.success(
        "Users exported successfully"
      );
    } catch (err) {
      console.error(
        "Export users error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Export failed"
      );
    }
  };

  // ============================================================
  // COUNTS
  // ============================================================

  const pendingUsers =
    users.filter(
      (user) => !user.isVerified
    ).length;

  const validPendingUsers =
    users.filter(
      (user) =>
        !user.isVerified &&
        user.role &&
        [
          "donor",
          "ngo",
          "volunteer",
        ].includes(user.role)
    ).length;

  const usersWithMissingRole =
    users.filter(
      (user) => !user.role
    ).length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="user-management">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="user-management-header">
        <div>
          <h3>User Management</h3>

          <p>
            Review, verify and manage
            SharePlate users.
          </p>
        </div>

        <div className="user-management-stats">
          <span>
            {users.length} users
          </span>

          <span>
            {pendingUsers} pending
          </span>
        </div>
      </div>

      {/* ======================================================
          MISSING ROLE WARNING
      ====================================================== */}

      {usersWithMissingRole > 0 && (
        <div
          className="user-role-warning"
          style={{
            padding: "14px 16px",
            marginBottom: "16px",
            borderRadius: "10px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
          }}
        >
          <strong>
            ⚠ {usersWithMissingRole} user
            {usersWithMissingRole > 1
              ? "s"
              : ""}{" "}
            have a missing role.
          </strong>

          <div
            style={{
              marginTop: "4px",
              fontSize: "14px",
            }}
          >
            These users cannot be verified
            until their role is assigned.
          </div>
        </div>
      )}

      {/* ======================================================
          FILTERS + ACTIONS
      ====================================================== */}

      <div
        className="user-management-toolbar"
        style={{
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* FILTERS */}

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(
                e.target.value
              )
            }
          >
            <option value="">
              All Roles
            </option>

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

          <select
            value={verifiedFilter}
            onChange={(e) =>
              setVerifiedFilter(
                e.target.value
              )
            }
          >
            <option value="">
              All Verification Status
            </option>

            <option value="false">
              Pending Verification
            </option>

            <option value="true">
              Verified
            </option>
          </select>
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleBulkVerify}
            disabled={
              bulkLoading ||
              selectedIds.length === 0
            }
          >
            {bulkLoading
              ? "Verifying..."
              : `Bulk Verify (${selectedIds.length})`}
          </button>

          <button
            className="btn-outline"
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        /* ====================================================
           EMPTY
           ==================================================== */

        <div
          style={{
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <h4>
            No users found
          </h4>

          <p>
            No users match the selected
            filters.
          </p>
        </div>
      ) : (
        /* ====================================================
           TABLE
           ==================================================== */

        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      validPendingUsers > 0 &&
                      selectedIds.length ===
                        validPendingUsers
                    }
                    onChange={
                      toggleSelectAll
                    }
                  />
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
              {users.map((u) => {
                const isActioning =
                  actioningId ===
                  u._id;

                const hasValidRole =
                  [
                    "donor",
                    "ngo",
                    "volunteer",
                  ].includes(
                    u.role
                  );

                return (
                  <tr key={u._id}>
                    {/* CHECKBOX */}

                    <td>
                      {!u.isVerified &&
                        hasValidRole && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(
                              u._id
                            )}
                            onChange={() =>
                              toggleSelect(
                                u
                              )
                            }
                          />
                        )}
                    </td>

                    {/* NAME */}

                    <td>
                      <strong>
                        {u.name ||
                          "Unknown User"}
                      </strong>
                    </td>

                    {/* EMAIL */}

                    <td>
                      {u.email ||
                        "No email"}
                    </td>

                    {/* ROLE */}

                    <td>
                      {u.role ? (
                        <span>
                          {u.role
                            .charAt(0)
                            .toUpperCase() +
                            u.role.slice(
                              1
                            )}
                        </span>
                      ) : (
                        <span
                          style={{
                            color:
                              "#dc2626",
                            fontWeight:
                              "600",
                          }}
                        >
                          Missing Role
                        </span>
                      )}
                    </td>

                    {/* PHONE */}

                    <td>
                      {u.phone ||
                        "—"}
                    </td>

                    {/* VERIFIED */}

                    <td>
                      {u.isVerified ? (
                        <span>
                          ✅ Verified
                        </span>
                      ) : (
                        <span>
                          ❌ Pending
                        </span>
                      )}
                    </td>

                    {/* ACTIVE */}

                    <td>
                      {u.isActive ? (
                        <span>
                          ✅ Active
                        </span>
                      ) : (
                        <span>
                          🚫 Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div
                        style={{
                          display:
                            "flex",
                          gap: "6px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        {/* VERIFY */}

                        {!u.isVerified && (
                          <button
                            onClick={() =>
                              handleVerify(
                                u
                              )
                            }
                            disabled={
                              isActioning ||
                              !hasValidRole
                            }
                            title={
                              !hasValidRole
                                ? "Role is missing"
                                : "Verify user"
                            }
                          >
                            {isActioning
                              ? "..."
                              : "Verify"}
                          </button>
                        )}

                        {/* TOGGLE STATUS */}

                        <button
                          onClick={() =>
                            handleToggleStatus(
                              u
                            )
                          }
                          disabled={
                            isActioning
                          }
                        >
                          {u.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>

                      {/* MISSING ROLE MESSAGE */}

                      {!u.isVerified &&
                        !hasValidRole && (
                          <div
                            style={{
                              marginTop:
                                "6px",
                              fontSize:
                                "12px",
                              color:
                                "#dc2626",
                            }}
                          >
                            Assign a role
                            before
                            verification.
                          </div>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserVerificationTable;