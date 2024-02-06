const express = require("express")
const User = require("../models/User.js")
const Highscore = require("../models/Highscore.js")
const highscoreRouter = express.Router()
const auth = require("../middleware/auth.js")

highscoreRouter.post("/userstats", async (req, res) => {
    const user = await User.findById(req.body._id)
    const userUsername = user.username
    Highscore.find({}).sort({gameMode: 1, gameDifficulty: 1, value: -1}).exec((err, highScores) => {
        if (err) {
            res.status(400).json("Something went wrong")
        } else {
            const separatedScores = { timeTrial: {} }
            const separatedScoresLengths = {timeTrial: {}}
            const userStats = {timeTrial: {}}
            let rank = 1
            let maxScoreUnder = 0
            let userScore = 0
            highScores.forEach(score => {
                const { gameMode, gameDifficulty, value, username } = score
                if (!separatedScoresLengths[gameMode][gameDifficulty]) {
                    rank = 1
                    userScore = 0
                    maxScoreUnder = 0
                    separatedScores[gameMode][gameDifficulty] = []
                    userStats[gameMode][gameDifficulty] = {}
                    separatedScoresLengths[gameMode][gameDifficulty] = {}
                    separatedScoresLengths[gameMode][gameDifficulty]["scores"] = {}
                    separatedScoresLengths[gameMode][gameDifficulty]["length"] = 0
                }
                if (!separatedScoresLengths[gameMode][gameDifficulty]["scores"][value]) {
                    separatedScoresLengths[gameMode][gameDifficulty]["scores"][value] = {}
                    separatedScoresLengths[gameMode][gameDifficulty]["scores"][value]["length"] = 0
                    separatedScoresLengths[gameMode][gameDifficulty]["scores"][value]["rank"] = rank
                    rank += 1
                }
                separatedScores[gameMode][gameDifficulty].push({ value, username, rank: separatedScoresLengths[gameMode][gameDifficulty]["scores"][value]["rank"] })
                separatedScoresLengths[gameMode][gameDifficulty]["scores"][value]["length"] += 1;
                separatedScoresLengths[gameMode][gameDifficulty]["length"] += 1;
                if (username === userUsername) {
                    userScore = value
                    userStats[gameMode][gameDifficulty]["rank"] = separatedScoresLengths[gameMode][gameDifficulty]["scores"][value]["rank"]
                }
                if (userScore > 0) {
                    if (userScore !== value) {
                        maxScoreUnder += 1
                    }
                    const percentile = (100*(1-(maxScoreUnder/separatedScoresLengths[gameMode][gameDifficulty]["length"]))).toFixed(2)
                    userStats[gameMode][gameDifficulty]["percentile"] = percentile
                } 
            });
            res.status(200).json({separatedScores, userStats})
        }
    });
});

highscoreRouter.get("/allmodes", (req, res) => {
    Highscore.find({}).sort({gameMode: 1, gameDifficulty: 1, value: -1}).exec((err, highScores) => {
        if (err) {
            res.status(400).json("Something went wrong")
        }
        const separatedScores = { timeTrial: {} };
        let rank = 0
        let prevValue = 0
        highScores.forEach(score => {
            const { gameMode, gameDifficulty, value, username } = score
            if (!separatedScores[gameMode][gameDifficulty]) {
                rank = 0
                separatedScores[gameMode][gameDifficulty] = [];
            }
            if (value !== prevValue) {
                rank += 1
            }
            prevValue = value
            separatedScores[gameMode][gameDifficulty].push({rank, value, username });
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
    const { _id, username, gameDifficulty, gameTime, gameMode } = req.body
    let user = await User.findById(_id)
    let hs = await Highscore.findOne({
        username: username,
        gameDifficulty: gameDifficulty,
        gameTime: gameTime,
        gameMode: gameMode,
    })
    if (user.highscores[gameMode][`hs${gameDifficulty + gameTime}`] === 0) {
        res.status(200).json("High score must be greater than 0!")
    } else if (hs) {
        if (hs.value < user.highscores[gameMode][`hs${gameDifficulty + gameTime}`]) {
            hs.value = user.highscores[gameMode][`hs${gameDifficulty + gameTime}`]
            hs.save()
            res.status(201).json("High score updated!")
        } else {
            res.status(200).json("High score already posted!")
        }
    } else {
        Highscore.create({
            username,
            gameDifficulty,
            gameTime,
            gameMode,
            value: user.highscores[gameMode][`hs${gameDifficulty + gameTime}`],
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