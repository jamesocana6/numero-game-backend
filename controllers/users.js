const express = require("express")
const User = require("../models/user")
const userRouter = express.Router()
const bcrypt = require("bcrypt");

//Index
userRouter.get("/", (req, res) => {
    User.findById(req.session.currentUser._id, (err, foundUser) => {
        //If no user is found with that username
        if (foundUser) {
            res.json(foundUser)
        } else {
            res.send("Nope :(")
        }
    })
})


//New

//Delete
//Delete user
userRouter.delete("/:id", (req, res) => {
    // current user id
    User.findByIdAndDelete(req.params.id);
    
})

//Update
//Update highscore
userRouter.put("/", (req, res) => {
    User.findById(req.session.currentUser._id, (err, foundUser) => {
        //If no user is found with that username
        if (foundUser) {
            foundUser.highscores[req.body.gameSetting] = req.body.value
            foundUser.save()
        } else {
            res.send("Nope :(")
        }
    })
})

//Create
//Create new user
userRouter.post("/", (req, res) => {
    User.findOne({
        username: req.body.username
    }, (err, foundUser) => {
        //If no user is found with that username
        if (!foundUser) {
            //overwrite the user password with hashed password, then pass that in to our database
            req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
            res.json(User.create(req.body));
        } else if (foundUser.username === req.body.username) {
            res.status(418).json({"error": "message"});
        };
    })
})

//Edit

//Show
//Show user??

module.exports = userRouter;