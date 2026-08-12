const Notification = require("../models/Notification.model");
const { success, error } = require("../utils/apiResponse");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    return success(res, 200, "Notifications fetched", { notifications, unreadCount });
  } catch (err) {
    return error(res, 500, err.message);
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    return success(res, 200, "Marked as read");
  } catch (err) {
    return error(res, 500, err.message);
  }
};