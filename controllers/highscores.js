const express = require("express")
const User = require("../models/User.js")
const Highscore = require("../models/Highscore.js")
const highscoreRouter = express.Router()
const auth = require("../middleware/auth.js")

//Index
//Show top 25 highscores
// highscoreRouter.post("/", auth, async (req, res) => {
//     // username: { type: String, required: true, },
//     // gameDifficulty: { type: String, required: true, },
//     // gameTarget: { type: Number, required: true, },
//     // gameTime: { type: Number, required: true, },
//     // value: { type: Number, required: true, },

//     let scores = await Highscore.find({gameSetting: req.body.gameSetting}).sort({value:-1}).limit(25).exec()
//     console.log(scores)
//     res.json(scores)
// })
highscoreRouter.post("/allmodes", (req, res) => {
    Highscore.aggregate([
        {
            $match: {
                gameDifficulty: req.body.gameDifficulty // Replace "easy" with the difficulty you want to filter by
            }
        },
        {
            $sort: {
                value: -1
            }
        },
        {
            $group: {
                _id: "$gameDifficulty",
                usernames: { $push: "$username" },
                values: { $push: "$value" }
            }
        },
    ]).sort({_id: 1}).exec((err, result) => {
        if (err) {
            res.json("Something went wrong")
            return;
        }
        // console.log(result);
        res.json(result);
    })
});

//New

//Delete
//Delete highscores

//Update
//New highscores

//Create
//New highscore (first time)
highscoreRouter.post("/", auth, async (req, res) => {
    const { _id, username, gameDifficulty, gameTime } = req.body
    let user = await User.findById(_id)
    let hs = await Highscore.findOne({
        username: username,
        gameDifficulty: gameDifficulty,
        gameTime: gameTime,
    })
    if (hs) {
        if (hs.value < user.highscores[`hs${gameDifficulty + gameTime}`]) {
            hs.value = user.highscores[`hs${gameDifficulty + gameTime}`]
            hs.save()
            res.json("High score updated!")
        } else {
            res.json("High score already posted!")
        }
    } else {
        Highscore.create({
            username: username,
            gameDifficulty: gameDifficulty,
            gameTime: gameTime,
            value: user.highscores[`hs${gameDifficulty + gameTime}`],
        }, (err, createdHS) => {
            if (err) {
                res.json("Something went wrong")
            } else {
                res.json("High score posted!")
            }
        })
    }
})

//Edit

//Show
//Show highscores near you max 25

module.exports = highscoreRouter;