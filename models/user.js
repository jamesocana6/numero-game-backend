let mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    highscores: {
        hs24e30: Number,
        hs24m60: Number,
        hs24h120: Number,
        hs48e30: Number,
        hs48m60: Number,
        hs48h120: Number,
        hs60e30: Number,
        hs60m60: Number,
        hs60h120: Number,
    },
    theme: { type: String },

});

const User = mongoose.model("User", userSchema);

module.exports = User;