module.exports = class Player {
  constructor(socketId, username, userId = null) {
    this.socketId = socketId;
    this.username = username;
    this.userId = userId; // MongoDB user ID, if available
    this.score = 0;
    this.ready = false;
    this.numTiles = [];
    this.undoArray = [];
    this.selfBuzzerActive = false;
  }

  // Helper to keep the undo array from growing infinitely
  saveHistoryState(currentState) {
    this.undoArray.push([...currentState]);
    if (this.undoArray.length > 10) {
      this.undoArray.shift(); // Remove the oldest state
    }
  }
};
