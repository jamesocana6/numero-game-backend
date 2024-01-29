let mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    accessToken: { type: String, },
    refreshToken: { type: String, },
    highscores: { 
        hse30: { type: Number, default: 0 }, 
        hsm60: { type: Number, default: 0 }, 
        hsh120: { type: Number, default: 0 }, 
    },
    // postedScore: [{type: mongoose.Schema.Types.ObjectId, ref: "Highscore"}],
});

const User = mongoose.model("User", userSchema);

module.exports = User; 