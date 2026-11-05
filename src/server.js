require("./config/env").validateEnv();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/database");
const attachSocketServer = require("./sockets/socketServer");

const PORT = process.env.PORT || 3333;
async function start() {
  await connectDB();
  const server = http.createServer(app);
  attachSocketServer(server);
  server.listen(PORT, () => console.log(`CarePlus API listening on ${PORT}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
start().catch(error => { console.error("Unable to start CarePlus API", error); process.exit(1); });
