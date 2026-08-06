require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const seedAdminFromEnv = require("./utils/seedAdminFromEnv");
const dns = require ("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedAdminFromEnv();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();