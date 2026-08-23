const Player = require("../../models/Player.js");
const Room = require("../../models/Room.js");

module.exports = function ({ io, socket, activeRooms }) {
  socket.on("joinRoom", ({ roomId, username, userId = null }) => {
    console.log(`User ${username} is trying to join room: ${roomId}`);
    socket.join(roomId);
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Room(roomId, "time-trial"));
    }
    activeRooms.get(roomId).addPlayer(socket.id, username, userId);
    console.log("activeRooms after joinRoom:", activeRooms);
  });
  socket.on("leaveRoom", ({ roomId }) => {
    const room = activeRooms.get(roomId);
    if (room) {
      room.removePlayer(socket.id);
      socket.leave(roomId); // Removes them from the Socket.io broadcasting channel
      // THE AUTO-DESTROY LOGIC
      if (room.playerCount === 0) {
        room.destroy();
        activeRooms.delete(roomId);
        console.log(`Room ${roomId} explicitly destroyed (empty).`);
      } else {
        io.to(roomId).emit("opponent disconnected");
      }
    }
  });
};

// Need to test this now
// When i refresh, current behavior is that the player disconnects, and the room is destroyed if they were the last player. If they were not the last player, the other player is notified that their opponent disconnected. The room will be destroyed after 10 seconds if no one joins. If someone joins within that time, the destruction countdown is canceled.
// I want to add that on page load, the player should be added to the room
// if the player refreshes, they should be re-added to the room if they were already in it. If they were not in it, they should be added as a new player. 
// roomId will come from generated URL from front end