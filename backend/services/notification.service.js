const { getIO } = require("../config/socket");

// Send event to a specific user's room
const notifyUser = (userId, event, payload) => {
  try {
    const io = getIO();
    io.to(userId.toString()).emit(event, payload);
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