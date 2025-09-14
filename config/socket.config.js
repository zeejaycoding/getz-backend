let ioInstance;

const setupSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("join", (data) => {
      let userId;
      try {
        const parsedData =
          typeof data === "string" && data.includes("{")
            ? JSON.parse(data)
            : { userId: data };
        userId = parsedData.userId;
      } catch (e) {
        console.error("Failed to parse join data:", e);
        return;
      }

      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      } else {
        console.log(
          "Received 'join' event but userId was undefined or missing."
        );
      }
    });
    socket.on("driverLocation", ({ driverId, latitude, longitude }) => {
      io.to(driverId).emit("driverLocationUpdate", { latitude, longitude });
    });
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(userId).emit(event, data);
  }
};

module.exports = { setupSocket, emitToUser };
