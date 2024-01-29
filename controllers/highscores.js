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

highscoreRouter.get("/allmodes", (req, res) => {
    Highscore.find({}, (err, highScores) => {
        if (err) {
            res.status(400).json("Something went wrong")
        }
        // Separate high scores by gameDifficulty
        const separatedScores = {};
        highScores.forEach(score => {
            if (!separatedScores[score.gameDifficulty]) {
                separatedScores[score.gameDifficulty] = [];
            }
            separatedScores[score.gameDifficulty].push({value: score.value, username: score.username});
        });
        // Sort scores within each group by value in descending order
        Object.keys(separatedScores).forEach(difficulty => {
            separatedScores[difficulty].sort((a, b) => b.value - a.value);
            if (separatedScores[difficulty].length >= 100) {
                separatedScores[difficulty] = separatedScores[difficulty].slice(0,100);
            }
        });
        res.status(200).json(separatedScores);
    });
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
    if (user.highscores[`hs${gameDifficulty + gameTime}`] === 0) {
        res.status(200).json("High score must be greater than 0!")
    } else if (hs) {
        if (hs.value < user.highscores[`hs${gameDifficulty + gameTime}`]) {
            hs.value = user.highscores[`hs${gameDifficulty + gameTime}`]
            hs.save()
            res.status(201).json("High score updated!")
        } else {
            res.status(200).json("High score already posted!")
        }
    } else {
        Highscore.create({
            username: username,
            gameDifficulty: gameDifficulty,
            gameTime: gameTime,
            value: user.highscores[`hs${gameDifficulty + gameTime}`],
        }, (err, createdHS) => {
            if (err) {
                res.status(400).json("Something went wrong")
            } else {
                res.status(201).json("High score posted!")
            }
        })
    }
})

//Edit

//Show
//Show highscores near you max 25

module.exports = highscoreRouter;