const AuditLog = require("../models/AuditLog.model");

const logAction = async ({ adminId, action, targetType, targetId, details }) => {
  try {
    await AuditLog.create({ adminId, action, targetType, targetId, details });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
};

module.exports = { logAction };