const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

// Join a room (user id)
socket.emit("join", "6a718d0736711fda81ea8115");

socket.on("food-claimed", (data) => {
  console.log("Food claimed:", data);
});

socket.on("delivery-assigned", (data) => {
  console.log("Delivery assigned:", data);
});

socket.on("delivery-status-update", (data) => {
  console.log("Status update:", data);
});