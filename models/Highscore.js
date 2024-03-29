let mongoose = require("mongoose")

const highscoreSchema = mongoose.Schema({
    username: { type: String, required: true, },
    gameDifficulty: { type: String, required: true, },
    gameTime: { type: Number, required: true, },
    gameMode: { type: String, required: true, },
    value: { type: Number, required: true, },
});

const Highscore = mongoose.model("Highscore", highscoreSchema);

module.exports = Highscore;