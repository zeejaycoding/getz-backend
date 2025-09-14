const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./database/connection");
const combineRouter = require("./routers");
const http = require("http");
const { setupSocket } = require("./config/socket.config");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

setupSocket(io);
const port = process.env.PORT || 3002;

app.use(express.json());
app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE" }));

dbConnection();
app.use("/api/v1", combineRouter);

app.use("*", (req, res) => {
  res.status(404).json({ message: "Invalid API endpoint" });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
