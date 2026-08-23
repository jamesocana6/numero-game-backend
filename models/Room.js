const Player = require("./Player.js");

module.exports = class Room {
  constructor(roomId, mode = "time-trial", player) {
    this.roomId = roomId;
    this.mode = mode;
    this.status = "lobby"; // 'lobby', 'in-progress', 'finished'
    this.players = {}; // Our O(1) lookup object!

    // Game State
    this.timer = 60;
    this.timerIntervalId = null;
    this.target = null;
    this.initialNumTiles = [];

    // Destruction Logic
    this.destructionTimerId = null;
  }

  // Methods to manage players easily
  addPlayer(socketId, username, userId = null) {
    this.players[socketId] = new Player(socketId, username, userId);
  }

  removePlayer(socketId) {
    delete this.players[socketId];
  }

  getPlayer(socketId) {
    return this.players[socketId];
  }

  get playerCount() {
    return Object.keys(this.players).length;
  }

  startDestructionCountdown(activeRoomsMap) {
    console.log(
      `Room ${this.roomId} is empty. Starting 10-second grace period.`,
    );
    this.destructionTimerId = setTimeout(() => {
      console.log(`Grace period ended. Destroying room ${this.roomId}.`);
      this.destroy(); // Stop any game loops
      activeRoomsMap.delete(this.roomId); // Wipe from memory
    }, 10000); // 10 seconds
  }

  cancelDestructionCountdown() {
    if (this.destructionTimerId) {
      clearTimeout(this.destructionTimerId);
      this.destructionTimerId = null;
      console.log(`Room ${this.roomId} saved from destruction!`);
    }
  }

  destroy() {
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    if (this.destructionTimerId) clearTimeout(this.destructionTimerId);
  }
};
