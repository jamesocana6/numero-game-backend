const express = require("express")
const User = require("../models/user")
const Highscore = require("../models/Highscore")
const highscoreRouter = express.Router()
const auth = require("../middleware/auth")

//Index
//Show top 25 highscores
highscoreRouter.post("/", auth, async (req, res) => {
    let scores = await Highscore.find({gameSetting: req.body.gameSetting}).sort({value:-1}).limit(25).exec()
    console.log(scores)
    res.json(scores)
})
highscoreRouter.post("/allmodes", async (req, res) => {
    let scores = await Highscore.find({gameSetting: {$regex : req.body.gameSetting} }).sort({value:-1}).limit(25).exec()
    console.log(scores)
    res.json(scores)
})

//New

//Delete
//Delete highscores

//Update
//New highscores

//Create
//New highscore (first time)
// FIX POST HS. FIND IF THEY POSTED A HS. IF POSTED, UPDATE THE OLD ONE ELSE CREATE NEW HS.
// SEARCH BY USERNAME, TARGET, TIME, and DIFFICULTY. 
// req.body is username, token, difficulty, time, and target, maybe user._id as well.
highscoreRouter.post("/", auth, (req, res) => {
    Highscore.findOne({username: req.body.username, gameSetting: req.body.gameSetting}, (err, found) => {
        if (found) {
            found.value = req.body.highscores[req.body.gameSetting]
            found.save(err => {res.json(found)})
        } else {
            Highscore.create(
                {
                    username: req.body.username, 
                    gameSetting: req.body.gameSetting,
                    value: req.body.highscores[req.body.gameSetting]
                })
            Highscore.collection.dropIndexes()
        }
    })
})

//Edit

//Show
//Show highscores near you max 25

module.exports = highscoreRouter;