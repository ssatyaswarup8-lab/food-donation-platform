const { getIO } = require("../config/socket");
const Notification = require("../models/Notification.model");

const notifyUser = async (userId, event, payload) => {
  try {
    const io = getIO();
    io.to(userId.toString()).emit(event, payload);

    await Notification.create({
      userId,
      type: event,
      message: payload.message || JSON.stringify(payload),
      link: payload.link || null,
    });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

// Send event to all clients tracking a specific delivery
const notifyDeliveryRoom = (deliveryId, event, payload) => {
  try {
    const io = getIO();
    io.to(deliveryId.toString()).emit(event, payload);
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

// Broadcast to everyone (e.g. new food posted to all NGOs)
const broadcastEvent = (event, payload) => {
  try {
    const io = getIO();
    io.emit(event, payload);
  } catch (err) {
    console.error("Broadcast error:", err.message);
  }
};

module.exports = { notifyUser, notifyDeliveryRoom, broadcastEvent };