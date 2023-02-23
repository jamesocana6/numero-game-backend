const express = require("express")
const User = require("../models/user")
const Highscore = require("../models/highscore")
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
    console.log(req.session, "session")
    // current user id
    console.log(req.body)
    User.findByIdAndUpdate(req.session._id, req.body, {new:true}, (foundUser) => {
        console.log(foundUser)
        res.send(foundUser)
    });
    
})

//Edit

//Show
//Show your own highscores

module.exports = highscoreRouter;