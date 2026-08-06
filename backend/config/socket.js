const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client joins a room based on their userId after login
    // so we can send targeted events (e.g. "notify donor X")
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room: ${userId}`);
    });

    // Volunteer sends live location while delivering
    socket.on("volunteer-location-update", (data) => {
      // data: { deliveryId, longitude, latitude }
      io.to(data.deliveryId).emit("volunteer-location", data);
    });

    // Anyone tracking a specific delivery joins its room
    socket.on("track-delivery", (deliveryId) => {
      socket.join(deliveryId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

module.exports = { initSocket, getIO };