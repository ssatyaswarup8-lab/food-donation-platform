import { useState, useEffect } from "react";
import { getAuditLogs, exportDeliveriesCSV } from "../../services/admin.service";
import toast from "react-hot-toast";

const actionLabels = {
  verify_user: "Verified User",
  toggle_user_status: "Toggled User Status",
  approve_food_quality: "Approved Food Quality",
  reject_food_quality: "Rejected Food Quality",
  assign_volunteer: "Assigned Volunteer",
  bulk_verify_users: "Bulk Verified Users",
  export_data: "Exported Data",
};

const AuditLogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportDeliveries = async () => {
    try {
      await exportDeliveriesCSV();
      toast.success("Deliveries exported");
    } catch (err) {
      toast.error("Export failed");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>Audit Log</h3>
        <button onClick={handleExportDeliveries}>Export Deliveries CSV</button>
      </div>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No admin actions recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Action</th>
              <th>Details</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{log.adminId?.name || "Unknown"}</td>
                <td>{actionLabels[log.action] || log.action}</td>
                <td>{log.details}</td>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AuditLogPanel;