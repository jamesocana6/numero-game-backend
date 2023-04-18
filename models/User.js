let mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    token: { type: String, },
    highscores: { 
        hs24e30: { type: Number, default: 0 }, 
        hs24m60: { type: Number, default: 0 }, 
        hs24h120: { type: Number, default: 0 }, 
        hs48e30: { type: Number, default: 0 }, 
        hs48m60: { type: Number, default: 0 }, 
        hs48h120: { type: Number, default: 0 }, 
        hs60e30: { type: Number, default: 0 }, 
        hs60m60: { type: Number, default: 0 }, 
        hs60h120: { type: Number, default: 0 }, 
    },
    // postedScore: [{type: mongoose.Schema.Types.ObjectId, ref: "Highscore"}],
});

const User = mongoose.model("User", userSchema);

module.exports = User; 