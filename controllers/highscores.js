const express = require("express")
const User = require("../models/user")
const Highscore = require("../models/Highscore")
const highscoreRouter = express.Router()

//Index
//Show all highscores

//New

//Delete
//Delete highscores

//Update
//New highscores

//Create
//New highscore (first time)
highscoreRouter.post("/", (req, res) => {
    Highscore.findOne({username: req.session.currentUser.username, gameSetting: req.body.gameSetting}, (err, found) => {
        if (found) {
            found.value = req.body.value
            found.save()
            res.send(found)
        } else {
            Highscore.create(req.body)
            Highscore.collection.dropIndexes()
            res.json({"message" : "created"})
        }
    })
})

//Edit

//Show
//Show your own highscores

module.exports = highscoreRouter;