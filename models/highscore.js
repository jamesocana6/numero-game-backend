let mongoose = require("mongoose")

const highscoreSchema = mongoose.Schema({
    player: { type: String, required: true, },
    gameSetting: { type: String, required: true, },
    value: { type: Number, required: true, },
});

const Highscore = mongoose.model("Highscore", highscoreSchema);

module.exports = Highscore;