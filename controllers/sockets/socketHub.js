const registerRoomHandlers = require("./roomHandler");
const registerGameHandlers = require("./gameHandler");

// Global state lives here at the top level
const users = new Set();
const activeRooms = new Map();
const unmatchedPlayers = [];

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("joinLobby", () => {
      console.log("User joined the lobby:", socket.id);
      // add user to list of connected users in the lobby
      users.add(socket.id);
      // emit a list of connected users to all clients in the lobby
      io.emit("activeUsers", users.size);
      console.log("Active users in lobby:", Array.from(users));
    });

    // Delegate the events to the specialized files
    // We pass io, socket, and the state they need to operate
    registerRoomHandlers({ io, socket, activeRooms });
    registerGameHandlers({ io, socket, activeRooms });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
      // remove user from list of connected users in the lobby
      users.delete(socket.id);
      // emit a list of connected users to all clients in the lobby
      io.emit("activeUsers", users.size);
      for (const [roomId, room] of activeRooms.entries()) {
        if (room.getPlayer(socket.id)) {
          room.removePlayer(socket.id);
          if (room.playerCount === 0) {
            // CHANGE: Start the countdown, passing the Map so it can delete itself later
            room.startDestructionCountdown(activeRooms);
          } else {
            io.to(roomId).emit("opponent disconnected");
          }
          break;
        }
      }
    });
  });
};
